<?php

namespace App\Http\Controllers\Identity;

use App\Domain\Identity\UserSessionService;
use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class UserSessionController extends Controller
{
    public function __construct(private readonly UserSessionService $sessions)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()?->currentAccessToken()?->getKey();
        $sessions = UserSession::query()
            ->where('user_id', $request->user()->getKey())
            ->orderByDesc('last_seen_at')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => $sessions->map(fn (UserSession $session): array => [
                'uuid' => $session->uuid,
                'label' => $session->label,
                'type' => $session->type,
                'last_seen_at' => $session->last_seen_at?->toIso8601String(),
                'created_at' => $session->created_at?->toIso8601String(),
                'revoked_at' => $session->revoked_at?->toIso8601String(),
                'is_current' => $currentTokenId !== null && (int) $session->personal_access_token_id === (int) $currentTokenId,
            ])->values(),
        ]);
    }

    public function revoke(Request $request, string $session): JsonResponse
    {
        $model = UserSession::query()
            ->where('user_id', $request->user()->getKey())
            ->where('uuid', $session)
            ->firstOrFail();

        $this->sessions->revoke($request->user(), (int) $model->getKey());

        return response()->noContent();
    }

    public function revokeOthers(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()?->currentAccessToken()?->getKey();
        $this->sessions->revokeAll($request->user(), $currentTokenId ? (int) $currentTokenId : null);

        return response()->noContent();
    }
}
