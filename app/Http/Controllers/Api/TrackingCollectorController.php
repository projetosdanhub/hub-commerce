<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TrackingLog;
use App\Models\TrackingDestination;
use App\Models\TrackingEventCatalog;
use Illuminate\Support\Str;

class TrackingCollectorController extends Controller
{
    public function collect(Request $request)
    {
        $payload = $request->all();
        $eventData = $payload['event'] ?? [];
        $userData = $payload['user'] ?? [];
        
        if (!isset($eventData['name'])) {
            return response()->json(['status' => 'ignored', 'reason' => 'Missing event name']);
        }

        $eventName = $eventData['name'];

        // 1. DATA WAREHOUSE (GRAVAR TUDO PARA O FUNIL INTERNO DO PAINEL)
        TrackingLog::create([
            'session_id'   => $payload['session']['session_id'] ?? null,
            'anonymous_id' => $userData['anonymous_id'] ?? null,
            'user_id'      => $userData['external_id'] ?? null,
            'event_name'   => $eventName,
            'url'          => $eventData['source_url'] ?? null,
            'ip_address'   => $request->ip(),
            'user_agent'   => $request->userAgent(),
            'payload'      => $payload
        ]);

        $pascalEventName = Str::studly($eventName); 

        // 2. A "ALFÂNDEGA" (FILTRO DE ENVIO SERVER-SIDE / CAPI)
        if (TrackingEventCatalog::isStandardEvent($pascalEventName)) {
            
            $globalConfig = TrackingDestination::where('provider', 'global')->first();
            $settings = $globalConfig ? ($globalConfig->settings ?? []) : [];
            $credentials = $globalConfig ? ($globalConfig->credentials ?? []) : [];
            
            $reactKey = Str::camel($eventName);

            if (isset($settings[$reactKey]) && $settings[$reactKey] === true) {
                
                // 🚀 SUCESSO! DESPACHANDO PARA AS FILAS (JOBS) EM BACKGROUND
                
                // 🔵 META (FACEBOOK) CAPI
                if (!empty($credentials['meta_pixel_id']) && !empty($credentials['meta_access_token'])) {
                    \App\Jobs\SendToMetaCapiJob::dispatch($payload, $request->ip(), $request->userAgent(), $credentials)->onQueue('default');
                }

                // 🎵 TIKTOK EVENTS API
                if (!empty($credentials['tiktok_pixel_id'])) {
                    \App\Jobs\SendToTikTokCapiJob::dispatch($payload, $request->ip(), $request->userAgent(), $credentials)->onQueue('default');
                }

                // 🟡 GOOGLE ANALYTICS 4 (Measurement Protocol)
                if (!empty($credentials['ga4_measurement_id'])) {
                    \App\Jobs\SendToGa4Job::dispatch($payload, $request->ip(), $request->userAgent(), $credentials)->onQueue('default');
                }
                
                return response()->json([
                    'status' => 'success', 
                    'action' => 'Queued for Server-Side Delivery (Meta, TikTok, GA4)'
                ]);
            }
        }

        return response()->json([
            'status' => 'success', 
            'action' => 'Logged locally only.'
        ]);
    }
}