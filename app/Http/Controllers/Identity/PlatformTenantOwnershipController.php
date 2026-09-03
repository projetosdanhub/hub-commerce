<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\TenantOwnershipService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\TransferTenantOwnershipRequest;
use App\Models\Tenant;
use App\Models\TenantMembership;
use Illuminate\Http\JsonResponse;

final class PlatformTenantOwnershipController extends Controller
{
    public function __construct(private readonly TenantOwnershipService $ownership)
    {
    }

    public function transfer(TransferTenantOwnershipRequest $request, int $tenant): JsonResponse
    {
        $store = Tenant::query()->findOrFail($tenant);
        $nextOwner = TenantMembership::query()
            ->where('tenant_id', $store->getKey())
            ->findOrFail($request->validated('membership_id'));

        $this->ownership->transfer($request->user(), $store, $nextOwner);

        return response()->json([
            'status' => 'success',
            'data' => [
                'tenant_id' => $store->getKey(),
                'owner_membership_id' => $nextOwner->getKey(),
            ],
        ]);
    }
}
