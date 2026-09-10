<?php

namespace App\Domain\Payments;

use App\Models\GlobalSetting;

final class StripeGatewayConfiguration
{
    public const SANDBOX = 'SANDBOX';

    public const PRODUCTION = 'PRODUCTION';

    private const SETTING_GROUP = 'payments';

    private const SETTING_KEY = 'stripe';

    /**
     * @return array{secret_key: string, publishable_key: string|null, webhook_secret: string|null}
     */
    public function credentialsFor(string $environment): array
    {
        $environment = $this->environment($environment);
        $config = $this->configuration();
        $credentials = $config[$this->environmentKey($environment)] ?? [];

        $secretKey = $credentials['secret_key'] ?? null;

        if (! is_string($secretKey) || blank($secretKey)) {
            throw new StripeGatewayUnavailableException('O Stripe não está configurado para este ambiente.');
        }

        $prefix = $environment === self::PRODUCTION ? 'live' : 'test';
        if (! str_starts_with($secretKey, 'sk_'.$prefix.'_')) {
            throw new StripeGatewayUnavailableException('A credencial Stripe não corresponde ao ambiente.');
        }

        return [
            'secret_key' => $secretKey,
            'publishable_key' => $this->stringOrNull($credentials['publishable_key'] ?? null),
            'webhook_secret' => $this->stringOrNull($credentials['webhook_secret'] ?? null),
        ];
    }

    /**
     * @param  array<string, string|null>  $input
     * @return array{
     *     active_environment: string,
     *     environments: array<string, array{publishable_key_configured: bool, secret_key_configured: bool, webhook_secret_configured: bool}>
     * }
     */
    public function save(array $input): array
    {
        $config = $this->configuration();
        $config['active_environment'] = $this->environment((string) $input['active_environment']);

        foreach ([self::SANDBOX, self::PRODUCTION] as $environment) {
            $key = $this->environmentKey($environment);
            $current = is_array($config[$key] ?? null) ? $config[$key] : [];

            foreach (['publishable_key', 'secret_key', 'webhook_secret'] as $field) {
                $inputKey = strtolower($environment).'_'.$field;
                $value = $input[$inputKey] ?? null;

                if (is_string($value) && filled($value)) {
                    $current[$field] = $value;
                }
            }

            $config[$key] = $current;
        }

        $setting = GlobalSetting::query()->firstOrNew([
            'group' => self::SETTING_GROUP,
            'key' => self::SETTING_KEY,
        ]);
        $setting->setSecureValue($config)->save();

        return $this->safeStatus();
    }

    /**
     * @return array{
     *     active_environment: string,
     *     environments: array<string, array{publishable_key_configured: bool, secret_key_configured: bool, webhook_secret_configured: bool}>
     * }
     */
    public function safeStatus(): array
    {
        $config = $this->configuration();
        $activeEnvironment = $this->environment($this->stringOrNull($config['active_environment'] ?? null) ?? self::SANDBOX);

        return [
            'active_environment' => $activeEnvironment,
            'environments' => collect([self::SANDBOX, self::PRODUCTION])
                ->mapWithKeys(function (string $environment) use ($config): array {
                    $credentials = $config[$this->environmentKey($environment)] ?? [];

                    return [$environment => [
                        'publishable_key_configured' => filled($credentials['publishable_key'] ?? null),
                        'secret_key_configured' => filled($credentials['secret_key'] ?? null),
                        'webhook_secret_configured' => filled($credentials['webhook_secret'] ?? null),
                    ]];
                })
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function configuration(): array
    {
        $value = GlobalSetting::query()
            ->where('group', self::SETTING_GROUP)
            ->where('key', self::SETTING_KEY)
            ->first()?->secureValue();

        return is_array($value) ? $value : [];
    }

    private function environment(string $environment): string
    {
        if (in_array($environment, [self::SANDBOX, self::PRODUCTION], true) === false) {
            throw new StripeGatewayUnavailableException('O ambiente de pagamento é inválido.');
        }

        return $environment;
    }

    private function environmentKey(string $environment): string
    {
        return strtolower($environment);
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && filled($value) ? $value : null;
    }
}
