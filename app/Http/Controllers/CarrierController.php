<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Carrier; // Lembre-se de criar este Model
use Illuminate\Support\Facades\Storage;

class CarrierController extends Controller
{
    /**
     * Lista todas as transportadoras cadastradas
     */
    public function index()
    {
        $carriers = Carrier::orderBy('nome', 'asc')->get();

        // Formata os dados para o React, garantindo que a URL da imagem vá completa
        $formatted = $carriers->map(function ($c) {
            return [
                'id' => $c->id,
                'nome' => $c->nome,
                'tempo_entrega' => $c->tempo_entrega,
                'status' => $c->status,
                'imagem' => $c->imagem ? asset('storage/' . $c->imagem) : null,
            ];
        });

        return response()->json([
            'status' => 'success', 
            'data' => $formatted
        ]);
    }

    /**
     * Cria uma nova transportadora ou atualiza uma existente
     */
    public function store(Request $request)
    {
        // Validação estrita de segurança
        $request->validate([
            'nome' => 'required|string|max:255',
            'tempo_entrega' => 'required|string|max:255',
            'status' => 'required|string|in:ATIVA,INATIVA',
            'arquivo' => 'nullable|file|mimes:jpeg,png,jpg,svg,webp|max:2048' // Máx 2MB
        ]);

        $fields = $request->only(['nome', 'tempo_entrega', 'status']);

        // Verifica se a transportadora já existe (Edição)
        $carrier = null;
        if ($request->filled('id')) {
            $carrier = Carrier::find($request->id);
        }

        // Lógica de Upload da Logomarca
        if ($request->hasFile('arquivo')) {
            // Se já existia uma imagem antiga, deleta para economizar espaço no servidor
            if ($carrier && $carrier->imagem) {
                Storage::disk('public')->delete($carrier->imagem);
            }
            
            // Salva a nova imagem
            $path = $request->file('arquivo')->store('carriers', 'public');
            $fields['imagem'] = $path;
        }

        // Salva no banco de dados (Cria ou Atualiza)
        $carrier = Carrier::updateOrCreate(
            ['id' => $request->id],
            $fields
        );

        // Formata a resposta para o React atualizar a tabela imediatamente
        $carrierData = [
            'id' => $carrier->id,
            'nome' => $carrier->nome,
            'tempo_entrega' => $carrier->tempo_entrega,
            'status' => $carrier->status,
            'imagem' => $carrier->imagem ? asset('storage/' . $carrier->imagem) : null,
        ];

        return response()->json([
            'status' => 'success', 
            'message' => 'Transportadora salva com sucesso!', 
            'data' => $carrierData
        ]);
    }

    /**
     * Exclui uma transportadora
     */
    public function destroy($id)
    {
        $carrier = Carrier::findOrFail($id);

        // Remove a imagem do servidor antes de apagar do banco
        if ($carrier->imagem) {
            Storage::disk('public')->delete($carrier->imagem);
        }

        $carrier->delete();

        return response()->json([
            'status' => 'success', 
            'message' => 'Transportadora excluída com sucesso.'
        ]);
    }
}