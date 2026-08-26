<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalSetting;
use Illuminate\Http\Request;

class GlobalSettingsController extends Controller
{
    /**
     * Retorna todas as configurações de um grupo.
     */
    public function getGroup($group)
    {
        $settings = GlobalSetting::where('group', $group)->get()->keyBy('key')->map(function ($setting) {
            return $setting->value;
        });

        return response()->json($settings);
    }

    /**
     * Salva ou atualiza uma configuração.
     */
    public function setSetting(Request $request)
    {
        $validated = $request->validate([
            'group' => 'required|string',
            'key' => 'required|string',
            'value' => 'nullable',
        ]);

        $setting = GlobalSetting::updateOrCreate(
            ['group' => $validated['group'], 'key' => $validated['key']],
            ['value' => $validated['value']]
        );

        return response()->json(['success' => true, 'data' => $setting]);
    }
}
