<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Tenancy\TenantContextStore;
use App\Http\Controllers\Controller;
use App\Models\AuthorizationAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AuthorizationAuditController extends Controller
{
    public function __construct(private readonly TenantContextStore $tenantContext)
    {
    }

    public function tenant(Request $request): JsonResponse
    {
        $tenantId = $this->tenantContext->require()->tenantId;

        return $this->respond(
            AuthorizationAuditLog::query()
                ->where('tenant_id', $tenantId)
                ->latest('id'),
            $request,
        );
    }

    public function platform(Request $request): JsonResponse
    {
        return $this->respond(
            AuthorizationAuditLog::query()
                ->where('scope', 'platform')
                ->latest('id'),
            $request,
        );
    }

    private function respond($query, Request $request): JsonResponse
    {
        $perPage = min(100, max(1, $request->integer('per_page', 30)));
        $entries = $query->paginate($perPage);

        return response()->json([
            'data' => $entries->getCollection()->map(fn (AuthorizationAuditLog $entry): array => [
                'uuid' => $entry->uuid,
                'scope' => $entry->scope,
                'tenant_id' => $entry->tenant_id,
                'actor_user_id' => $entry->actor_user_id,
                'action' => $entry->action,
                'target_type' => $entry->target_type,
                'target_id' => $entry->target_id,
                'result' => $entry->result,
                'reason' => $entry->reason,
                'before' => $entry->before_values,
                'after' => $entry->after_values,
                'context' => $entry->context,
                'created_at' => $entry->created_at?->toIso8601String(),
            ])->values(),
            'meta' => [
                'current_page' => $entries->currentPage(),
                'last_page' => $entries->lastPage(),
                'per_page' => $entries->perPage(),
                'total' => $entries->total(),
            ],
        ]);
    }
}
