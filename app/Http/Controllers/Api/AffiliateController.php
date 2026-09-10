<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    public function index()
    {
        $affiliates = Affiliate::with('user')->latest()->get();
        // Transform to mock format
        $data = $affiliates->map(function ($aff) {
            return [
                'id' => $aff->id,
                'nome' => $aff->user ? $aff->user->name : 'N/A',
                'codigo' => $aff->coupon_code,
                'comissao' => $aff->commission_rate . '%',
                'saldo' => 'R$ ' . number_format($aff->balance, 2, ',', '.'),
                'status' => 'Ativo'
            ];
        });
        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'coupon_code' => 'required|unique:affiliates,coupon_code',
            'commission_rate' => 'required|numeric|min:0|max:100'
        ]);

        $affiliate = Affiliate::create($validated);
        return response()->json(['data' => $affiliate]);
    }

    public function update(Request $request, Affiliate $affiliate)
    {
        $validated = $request->validate([
            'coupon_code' => 'required|unique:affiliates,coupon_code,' . $affiliate->id,
            'commission_rate' => 'required|numeric|min:0|max:100'
        ]);

        $affiliate->update($validated);
        return response()->json(['data' => $affiliate]);
    }

    public function destroy(Affiliate $affiliate)
    {
        $affiliate->delete();
        return response()->json(['message' => 'Affiliate deleted']);
    }
}
