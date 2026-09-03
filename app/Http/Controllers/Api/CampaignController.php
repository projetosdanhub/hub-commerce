<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::latest()->get();
        // Format to mock matching style
        $data = $campaigns->map(function ($c) {
            return [
                'id' => $c->id,
                'nome' => $c->name,
                'tipo' => $c->type,
                'status' => $c->status,
                'orcamento' => $c->budget ? 'R$ ' . number_format($c->budget, 2, ',', '.') : 'R$ 0,00',
                'gasto' => 'R$ ' . number_format($c->spent, 2, ',', '.'),
                'roi' => '0%'
            ];
        });
        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'status' => 'required|in:active,paused,finished',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $campaign = Campaign::create($validated);
        return response()->json(['data' => $campaign]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'status' => 'required|in:active,paused,finished',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $campaign->update($validated);
        return response()->json(['data' => $campaign]);
    }

    public function destroy(Campaign $campaign)
    {
        $campaign->delete();
        return response()->json(['message' => 'Campaign deleted']);
    }
}
