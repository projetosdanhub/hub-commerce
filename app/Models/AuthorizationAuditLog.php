<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AuthorizationAuditLog extends Model
{
    use HasFactory;

    public const RESULT_SUCCESS = 'SUCCESS';
    public const RESULT_DENIED = 'DENIED';

    protected $fillable = [
        'scope',
        'tenant_id',
        'actor_user_id',
        'action',
        'target_type',
        'target_id',
        'result',
        'reason',
        'before_values',
        'after_values',
        'context',
        'request_id',
        'ip_hash',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'before_values' => 'array',
            'after_values' => 'array',
            'context' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $audit): void {
            $audit->uuid ??= (string) Str::uuid();
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
