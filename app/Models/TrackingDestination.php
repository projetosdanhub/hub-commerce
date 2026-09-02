<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class TrackingDestination extends Model
{
    use HasFactory;

    private const PUBLIC_KEYS = [
        'meta_pixel_id',
        'tiktok_pixel_id',
        'ga4_measurement_id',
        'pinterest_pixel_id',
    ];

    private const SECRET_KEYS = [
        'meta_access_token',
        'tiktok_access_token',
        'ga4_api_secret',
        'pinterest_access_token',
    ];

    protected $fillable = [
        'provider',
        'name',
        'credentials',
        'settings',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_active' => 'boolean',
        ];
    }

    protected function credentials(): Attribute
    {
        return Attribute::make(
            get: function ($value, array $attributes): array {
                if (! empty($attributes['encrypted_credentials'])) {
                    return json_decode(
                        Crypt::decryptString($attributes['encrypted_credentials']),
                        true,
                        512,
                        JSON_THROW_ON_ERROR
                    );
                }

                if (is_array($value)) {
                    return $value;
                }

                return $value ? (json_decode($value, true) ?: []) : [];
            },
            set: fn ($value): array => [
                'credentials' => null,
                'encrypted_credentials' => Crypt::encryptString(json_encode(
                    $value ?: [],
                    JSON_THROW_ON_ERROR
                )),
            ],
        );
    }

    public function publicCredentials(): array
    {
        return collect($this->credentials ?? [])->only(self::PUBLIC_KEYS)->all();
    }

    public function configuredCredentials(): array
    {
        $credentials = $this->credentials ?? [];

        return collect(array_merge(self::PUBLIC_KEYS, self::SECRET_KEYS))
            ->mapWithKeys(fn (string $key) => [$key => ! empty($credentials[$key])])
            ->all();
    }

    public function maskedCredentials(): array
    {
        $credentials = $this->publicCredentials();

        foreach (self::SECRET_KEYS as $key) {
            if (! empty(($this->credentials ?? [])[$key])) {
                $credentials[$key] = '********';
            }
        }

        return $credentials;
    }
}
