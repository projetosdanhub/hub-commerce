<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShippingPackage;

class ShippingPackageController extends Controller
{
    public function index()
    {
        $packages = ShippingPackage::orderBy('is_default', 'desc')->orderBy('nome', 'asc')->get();
        return response()->json(['status' => 'success', 'data' => $packages]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'altura' => 'required|numeric|min:1',
            'largura' => 'required|numeric|min:11',
            'comprimento' => 'required|numeric|min:16',
            'peso_vazio' => 'required|numeric|min:0',
            'is_default' => 'nullable|boolean'
        ]);

        if ($request->boolean('is_default')) {
            ShippingPackage::query()->update(['is_default' => false]);
        }

        $package = ShippingPackage::updateOrCreate(
            ['id' => $request->id],
            $request->only(['nome', 'altura', 'largura', 'comprimento', 'peso_vazio', 'is_default'])
        );

        return response()->json(['status' => 'success', 'message' => 'Embalagem salva com sucesso!', 'data' => $package]);
    }

    public function destroy($id)
    {
        ShippingPackage::destroy($id);
        return response()->json(['status' => 'success', 'message' => 'Embalagem removida.']);
    }
}