<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantDomain extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'domain',
        'kind',
        'status',
        'is_primary',
        'verification_token_hash',
        'verification_token',
        'verification_token_created_at',
        'verified_at',
        'dns_checked_at',
        'disconnected_at',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'verification_token_created_at' => 'datetime',
            'verified_at' => 'datetime',
            'dns_checked_at' => 'datetime',
            'disconnected_at' => 'datetime',
            'verification_token' => 'encrypted',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function setDomainAttribute(string $value): void
    {
        $this->attributes['domain'] = self::normalizeHost($value);
    }

    public static function normalizeHost(string $host): string
    {
        $host = strtolower(trim($host));
        $host = preg_replace('#^https?://#', '', $host) ?? '';
        $host = preg_replace('#/.*$#', '', $host) ?? '';
        $host = preg_replace('/:\d+$/', '', $host) ?? '';
        $host = rtrim($host, '.');

        if ($host === 'localhost' || $host === '127.0.0.1') {
            return $host;
        }

        if (! preg_match('/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/', $host)) {
            throw new \InvalidArgumentException('Domínio inválido.');
        }

        return $host;
    }
}
