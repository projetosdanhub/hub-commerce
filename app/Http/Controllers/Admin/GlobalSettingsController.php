<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSettingsController extends Controller
{
    private const SECRET_FIELDS = [
        'access_token',
        'secret_key',
        'api_key',
        'api_secret',
        'webhook_secret',
        'token',
    ];

    public function getGroup(string $group): JsonResponse
    {
        $settings = GlobalSetting::where('group', $group)
            ->get()
            ->mapWithKeys(function (GlobalSetting $setting): array {
                return [$setting->key => $this->maskSecrets($setting->secureValue())];
            });

        return response()->json($settings);
    }

    public function setSetting(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group' => ['required', 'string', 'max:80'],
            'key' => ['required', 'string', 'max:100'],
            'value' => ['nullable'],
        ]);

        $setting = GlobalSetting::firstOrNew([
            'group' => $validated['group'],
            'key' => $validated['key'],
        ]);

        $value = $this->mergeMaskedSecrets(
            $setting->exists ? $setting->secureValue() : null,
            $validated['value'] ?? null
        );

        $setting->setSecureValue($value)->save();

        return response()->json(['success' => true]);
    }

    private function maskSecrets(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        foreach ($value as $key => $item) {
            if (in_array((string) $key, self::SECRET_FIELDS, true) && filled($item)) {
                $value[$key] = '********';
            } elseif (is_array($item)) {
                $value[$key] = $this->maskSecrets($item);
            }
        }

        return $value;
    }

    private function mergeMaskedSecrets(mixed $current, mixed $incoming): mixed
    {
        if (! is_array($current) || ! is_array($incoming)) {
            return $incoming;
        }

        foreach (self::SECRET_FIELDS as $field) {
            if (($incoming[$field] ?? null) === '********' || ($incoming[$field] ?? null) === '') {
                if (array_key_exists($field, $current)) {
                    $incoming[$field] = $current[$field];
                }
            }
        }

        return $incoming;
    }
}
