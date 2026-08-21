<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Carrier;
use Illuminate\Support\Facades\Storage;

class CarrierController extends Controller
{
    public function index()
    {
        $carriers = Carrier::orderBy('nome', 'asc')->get();

        $formatted = $carriers->map(function ($c) {
            return [
                'id' => $c->id,
                'nome' => $c->nome,
                'tempo_entrega' => $c->tempo_entrega,
                'status' => $c->status,
                'imagem' => $c->imagem ? asset('storage/' . $c->imagem) : null,
                'cep' => $c->cep,
                'rua' => $c->rua,
                'numero' => $c->numero,
                'complemento' => $c->complemento,
                'bairro' => $c->bairro,
                'cidade' => $c->cidade,
                'uf' => $c->uf,
                'referencia' => $c->referencia,
            ];
        });

        return response()->json(['status' => 'success', 'data' => $formatted]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'tempo_entrega' => 'required|string|max:255',
            'status' => 'required|string|in:ATIVA,INATIVA',
            'arquivo' => 'nullable|file|mimes:jpeg,png,jpg,svg,webp|max:2048'
        ]);

        // 🟢 Captura todos os campos, incluindo os de endereço
        $fields = $request->only([
            'nome', 'tempo_entrega', 'status', 
            'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'referencia'
        ]);

        $carrier = $request->filled('id') ? Carrier::find($request->id) : null;

        if ($request->hasFile('arquivo')) {
            if ($carrier && $carrier->imagem) {
                Storage::disk('public')->delete($carrier->imagem);
            }
            $fields['imagem'] = $request->file('arquivo')->store('carriers', 'public');
        }

        $carrier = Carrier::updateOrCreate(['id' => $request->id], $fields);

        return response()->json(['status' => 'success', 'message' => 'Transportadora salva com sucesso!', 'data' => $carrier]);
    }

    public function destroy($id)
    {
        $carrier = Carrier::findOrFail($id);
        if ($carrier->imagem) {
            Storage::disk('public')->delete($carrier->imagem);
        }
        $carrier->delete();
        return response()->json(['status' => 'success']);
    }
}