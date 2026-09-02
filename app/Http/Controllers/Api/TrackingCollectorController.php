<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendToGa4Job;
use App\Jobs\SendToMetaCapiJob;
use App\Jobs\SendToPinterestCapiJob;
use App\Jobs\SendToTikTokCapiJob;
use App\Models\TrackingDestination;
use App\Models\TrackingEventCatalog;
use App\Models\TrackingLog;
use App\Support\Security\SensitiveData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrackingCollectorController extends Controller
{
    public function collect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event.name' => ['required', 'string', 'max:80'],
            'event.event_id' => ['required', 'string', 'max:128'],
            'event.event_time' => ['nullable', 'integer'],
            'event.event_time_iso' => ['nullable', 'date'],
            'event.source_url' => ['nullable', 'url', 'max:2048'],
            'session.session_id' => ['nullable', 'string', 'max:128'],
            'user.anonymous_id' => ['nullable', 'string', 'max:128'],
            'user.external_id' => ['nullable', 'string', 'max:255'],
            'user.em' => ['nullable', 'string', 'max:320'],
            'user.ph' => ['nullable', 'string', 'max:40'],
            'user.fn' => ['nullable', 'string', 'max:100'],
            'user.ln' => ['nullable', 'string', 'max:100'],
            'attribution.fbp' => ['nullable', 'string', 'max:255'],
            'attribution.fbc' => ['nullable', 'string', 'max:255'],
            'commerce.value' => ['nullable', 'numeric', 'min:0'],
            'commerce.currency' => ['nullable', 'string', 'size:3'],
            'commerce.transaction_id' => ['nullable', 'string', 'max:128'],
            'commerce.items' => ['nullable', 'array', 'max:100'],
            'commerce.items.*.item_id' => ['nullable', 'string', 'max:128'],
            'commerce.items.*.product_id' => ['nullable', 'string', 'max:128'],
            'commerce.items.*.quantity' => ['nullable', 'integer', 'min:1', 'max:1000'],
        ]);

        $payload = SensitiveData::sanitizeTrackingPayload($validated);
        $eventName = $payload['event']['name'];

        TrackingLog::create([
            'session_id' => $payload['session']['session_id'] ?? null,
            'anonymous_id' => isset($payload['user']['anonymous_id'])
                ? SensitiveData::hashIdentifier($payload['user']['anonymous_id'])
                : null,
            'user_id' => null,
            'event_name' => $eventName,
            'url' => $payload['event']['source_url'] ?? null,
            'ip_address' => hash('sha256', (string) $request->ip()),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1000),
            'payload' => $payload,
        ]);

        $pascalEventName = Str::studly($eventName);
        if (! TrackingEventCatalog::isStandardEvent($pascalEventName)) {
            return response()->json(['status' => 'success', 'action' => 'logged']);
        }

        $destination = TrackingDestination::where('provider', 'global')
            ->where('is_active', true)
            ->first();

        if (! $destination) {
            return response()->json(['status' => 'success', 'action' => 'logged']);
        }

        $settings = $destination->settings ?? [];
        if (($settings[Str::camel($eventName)] ?? false) !== true) {
            return response()->json(['status' => 'success', 'action' => 'logged']);
        }

        $credentials = $destination->credentials ?? [];
        $jobArguments = [
            $payload,
            (string) $request->ip(),
            (string) $request->userAgent(),
            $destination->id,
            app(TenantContextStore::class)->require()->tenantId,
        ];

        if (! empty($credentials['meta_pixel_id']) && ! empty($credentials['meta_access_token'])) {
            SendToMetaCapiJob::dispatch(...$jobArguments);
        }

        if (! empty($credentials['tiktok_pixel_id']) && ! empty($credentials['tiktok_access_token'])) {
            SendToTikTokCapiJob::dispatch(...$jobArguments);
        }

        if (! empty($credentials['ga4_measurement_id']) && ! empty($credentials['ga4_api_secret'])) {
            SendToGa4Job::dispatch(...$jobArguments);
        }

        if (! empty($credentials['pinterest_pixel_id']) && ! empty($credentials['pinterest_access_token'])) {
            SendToPinterestCapiJob::dispatch(...$jobArguments);
        }

        return response()->json(['status' => 'success', 'action' => 'queued']);
    }
}
