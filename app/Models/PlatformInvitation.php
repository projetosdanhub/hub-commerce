<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class PlatformInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'token_hash',
        'invited_by_membership_id',
        'accepted_by_user_id',
        'expires_at',
        'accepted_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $invitation): void {
            $invitation->uuid ??= (string) Str::uuid();
            $invitation->email = mb_strtolower(trim((string) $invitation->email));
        });
    }

    public function invitedByMembership(): BelongsTo
    {
        return $this->belongsTo(PlatformMembership::class, 'invited_by_membership_id');
    }

    public function acceptedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by_user_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(PlatformRole::class, 'platform_invitation_roles')->withTimestamps();
    }

    public function isPending(): bool
    {
        return $this->accepted_at === null
            && $this->revoked_at === null
            && $this->expires_at->isFuture();
    }
}
