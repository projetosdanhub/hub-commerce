<?php

namespace App\Support\Security;

class SensitiveData
{
    private const SECRET_KEYS = [
        'password', 'password_confirmation', 'token', 'access_token', 'api_key',
        'api_secret', 'secret', 'authorization', 'cvv', 'cvc', 'card_number',
        'numero_cartao', 'numeroCartao', 'validadeCartao', 'cvvCartao',
    ];

    private const IDENTITY_KEYS = ['em', 'ph', 'fn', 'ln', 'external_id'];

    public static function sanitizeTrackingPayload(array $payload): array
    {
        $clean = self::removeSecrets($payload);

        if (isset($clean['user']) && is_array($clean['user'])) {
            foreach (self::IDENTITY_KEYS as $key) {
                if (! empty($clean['user'][$key])) {
                    $clean['user'][$key] = self::hashIdentifier((string) $clean['user'][$key]);
                }
            }
        }

        return $clean;
    }

    public static function removeSecrets(array $data): array
    {
        foreach ($data as $key => $value) {
            if (in_array((string) $key, self::SECRET_KEYS, true)) {
                unset($data[$key]);
                continue;
            }

            if (is_array($value)) {
                $data[$key] = self::removeSecrets($value);
            }
        }

        return $data;
    }

    public static function hashIdentifier(string $value): string
    {
        $normalized = mb_strtolower(trim($value));

        return preg_match('/^[a-f0-9]{64}$/', $normalized)
            ? $normalized
            : hash('sha256', $normalized);
    }

    public static function redactText(?string $text): string
    {
        $text = (string) $text;
        $text = preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[email protegido]', $text);
        $text = preg_replace('/(?<!\d)\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?!\d)/', '[documento protegido]', $text);
        $text = preg_replace('/(?<!\d)(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-\s]?\d{4}(?!\d)/', '[telefone protegido]', $text);

        return $text;
    }

    public static function maskEmail(?string $email): string
    {
        if (! $email || ! str_contains($email, '@')) {
            return '[protegido]';
        }

        [$name, $domain] = explode('@', $email, 2);

        return mb_substr($name, 0, 1).'***@'.$domain;
    }

    public static function maskDocument(?string $document): string
    {
        $digits = preg_replace('/\D/', '', (string) $document);

        return $digits ? '***'.substr($digits, -3) : '[protegido]';
    }

    public static function maskPhone(?string $phone): string
    {
        $digits = preg_replace('/\D/', '', (string) $phone);

        return $digits ? '***'.substr($digits, -4) : '[protegido]';
    }
}
