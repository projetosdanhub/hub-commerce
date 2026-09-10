<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string|null $access_token
 * @property string $environment
 * @property array<string, mixed>|null $sender_info
 */
class MelhorEnvioSetting extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'access_token',
        'environment',
        'carriers_ativas',
        'sender_info'
    ];

    protected function casts(): array
    {
        return [
            'access_token'    => 'encrypted',
            'carriers_ativas' => 'array',
            'sender_info'     => 'array',
        ];
    }

    public function oauthConnection(): ?ProviderInstallation
    {
        $installation = ProviderInstallation::query()
            ->where('tenant_id', app(\App\Domain\Tenancy\TenantContextStore::class)->require()->tenantId)
            ->where('provider', 'melhor_envio')
            ->where('environment', $this->environment)
            ->where('status', 'CONNECTED')
            ->whereNull('revoked_at')
            ->with('credential')
            ->first();
        $credential = $installation?->credential;

        if ($credential === null || $credential->revoked_at !== null
            || $credential->expires_at?->isPast() || blank($credential->access_token)) {
            return null;
        }

        return $installation;
    }

    public function oauthAccessToken(): string
    {
        $token = $this->oauthConnection()?->credential?->access_token;
        if (! is_string($token) || blank($token)) {
            throw new \DomainException('Conecte o Melhor Envio no ambiente selecionado.');
        }

        return $token;
    }
}