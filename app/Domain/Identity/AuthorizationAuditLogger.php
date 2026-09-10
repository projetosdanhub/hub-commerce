<?php

namespace App\Domain\Identity;

use App\Models\AuthorizationAuditLog;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

final class AuthorizationAuditLogger
{
    /**
     * @param array<string, mixed> $before
     * @param array<string, mixed> $after
     * @param array<string, mixed> $context
     */
    public function record(
        string $scope,
        string $action,
        ?User $actor = null,
        ?Tenant $tenant = null,
        ?Model $target = null,
        string $result = AuthorizationAuditLog::RESULT_SUCCESS,
        ?string $reason = null,
        array $before = [],
        array $after = [],
        array $context = [],
        ?Request $request = null,
    ): ?AuthorizationAuditLog {
        // Algumas suítes legadas reconstroem a tabela users isoladamente.
        // A auditoria é complementar nesses cenários, nunca uma dependência
        // que impeça o logout ou a revogação de tokens.
        if (! Schema::hasTable('authorization_audit_logs')) {
            return null;
        }

        $request ??= app()->bound('request') ? request() : null;
        $ip = $request?->ip();

        return AuthorizationAuditLog::query()->create([
            'scope' => $scope,
            'tenant_id' => $tenant?->getKey(),
            'actor_user_id' => $actor?->getKey(),
            'action' => $action,
            'target_type' => $target ? $target::class : null,
            'target_id' => $target ? (string) $target->getKey() : null,
            'result' => $result,
            'reason' => $reason,
            'before_values' => $this->redact($before),
            'after_values' => $this->redact($after),
            'context' => $this->redact($context),
            'request_id' => $request?->header('X-Request-ID'),
            'ip_hash' => $ip ? hash_hmac('sha256', $ip, (string) config('app.key')) : null,
            'user_agent' => $request ? mb_substr((string) $request->userAgent(), 0, 512) : null,
        ]);
    }

    /**
     * @param array<string, mixed> $values
     * @return array<string, mixed>
     */
    private function redact(array $values): array
    {
        $redacted = [];

        foreach ($values as $key => $value) {
            $normalizedKey = strtolower((string) $key);

            if (preg_match('/password|secret|token|code|authorization|cookie|cpf|email|phone|telefone/', $normalizedKey)) {
                $redacted[$key] = '[REDACTED]';

                continue;
            }

            if (is_array($value)) {
                $redacted[$key] = $this->redact($value);

                continue;
            }

            $redacted[$key] = $value;
        }

        return $redacted;
    }
}
