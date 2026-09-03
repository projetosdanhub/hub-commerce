<?php

namespace App\Domain\Identity;

use App\Models\User;
use App\Models\UserSession;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\PersonalAccessToken;

final class UserSessionService
{
    public function __construct(private readonly AuthorizationAuditLogger $audit)
    {
    }

    public function recordToken(User $user, PersonalAccessToken $token, ?Request $request = null): void
    {
        if (! Schema::hasTable('user_sessions')) {
            return;
        }

        $request ??= app()->bound('request') ? request() : null;
        $ip = $request?->ip();

        UserSession::query()->updateOrCreate(
            ['personal_access_token_id' => $token->getKey()],
            [
                'user_id' => $user->getKey(),
                'type' => UserSession::TYPE_TOKEN,
                'label' => $token->name,
                'ip_hash' => $ip ? hash_hmac('sha256', $ip, (string) config('app.key')) : null,
                'user_agent' => $request ? mb_substr((string) $request->userAgent(), 0, 512) : null,
                'last_seen_at' => now(),
                'revoked_at' => null,
            ],
        );
    }

    public function revokeCurrent(User $user, ?PersonalAccessToken $token): void
    {
        if ($token === null) {
            return;
        }

        if (! Schema::hasTable('user_sessions')) {
            $token->delete();

            return;
        }

        $session = UserSession::query()
            ->where('user_id', $user->getKey())
            ->where('personal_access_token_id', $token->getKey())
            ->first();

        if ($session === null) {
            $token->delete();

            return;
        }

        $this->revoke($user, (int) $session->getKey());
    }

    public function revoke(User $actor, int $sessionId): void
    {
        $session = UserSession::query()
            ->where('user_id', $actor->getKey())
            ->whereKey($sessionId)
            ->firstOrFail();

        $session->forceFill(['revoked_at' => now()])->save();

        if ($session->personal_access_token_id !== null) {
            PersonalAccessToken::query()->whereKey($session->personal_access_token_id)->delete();
        }

        $this->audit->record('identity', 'identity.session.revoked', $actor, target: $session);
    }

    public function revokeAll(User $actor, ?int $exceptTokenId = null): void
    {
        if (Schema::hasTable('user_sessions')) {
            $query = UserSession::query()->where('user_id', $actor->getKey())->whereNull('revoked_at');

            if ($exceptTokenId !== null) {
                $query->where('personal_access_token_id', '!=', $exceptTokenId);
            }

            $query->update(['revoked_at' => now(), 'updated_at' => now()]);
        }

        $tokens = $actor->tokens();

        if ($exceptTokenId !== null) {
            $tokens->where('id', '!=', $exceptTokenId);
        }

        $tokens->delete();
        $this->audit->record('identity', 'identity.sessions.revoked', $actor, context: ['except_token_id' => $exceptTokenId]);
    }

    public function ensureOwnSession(User $actor, UserSession $session): void
    {
        if ($session->user_id !== $actor->getKey()) {
            throw new AuthorizationException('Esta sessão não pertence à sua conta.');
        }
    }
}
