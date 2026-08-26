<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Carrier;
use App\Models\CarrierAuditLog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class CarrierController extends Controller
{
    public function index()
    {
        $carriers = Carrier::withCount('orders')->orderBy('nome', 'asc')->get();

        $formatted = $carriers->map(function ($c) {
            return [
                'id' => $c->id,
                'nome' => $c->nome,
                'tempo_entrega' => $c->tempo_entrega,
                'status' => $c->status,
                'status_reason' => $c->status_reason,
                'imagem' => $c->imagem ? asset('storage/' . $c->imagem) : null,
                'cep' => $c->cep,
                'rua' => $c->rua,
                'numero' => $c->numero,
                'complemento' => $c->complemento,
                'bairro' => $c->bairro,
                'cidade' => $c->cidade,
                'uf' => $c->uf,
                'referencia' => $c->referencia,
                'vehicle_plate' => $c->vehicle_plate,
                'vehicle_model' => $c->vehicle_model,
                'vehicle_type' => $c->vehicle_type,
                'document_rg_front' => $c->document_rg_front ? asset('storage/' . $c->document_rg_front) : null,
                'document_rg_back' => $c->document_rg_back ? asset('storage/' . $c->document_rg_back) : null,
                'document_cnh' => $c->document_cnh ? asset('storage/' . $c->document_cnh) : null,
                'pedidos_count' => $c->orders_count,
                'created_at' => $c->created_at ? $c->created_at->format('Y-m-d H:i:s') : null,
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

        // 🟢 Captura todos os campos, incluindo os de endereço e veículos
        $fields = $request->only([
            'nome', 'tempo_entrega', 'status', 'status_reason',
            'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'referencia',
            'vehicle_plate', 'vehicle_model', 'vehicle_type'
        ]);

        $carrier = $request->filled('id') ? Carrier::find($request->id) : null;

        if ($request->hasFile('arquivo')) {
            if ($carrier && $carrier->imagem) Storage::disk('public')->delete($carrier->imagem);
            $fields['imagem'] = $request->file('arquivo')->store('carriers', 'public');
        }
        if ($request->hasFile('file_rg_front')) {
            if ($carrier && $carrier->document_rg_front) Storage::disk('public')->delete($carrier->document_rg_front);
            $fields['document_rg_front'] = $request->file('file_rg_front')->store('carriers/docs', 'public');
        }
        if ($request->hasFile('file_rg_back')) {
            if ($carrier && $carrier->document_rg_back) Storage::disk('public')->delete($carrier->document_rg_back);
            $fields['document_rg_back'] = $request->file('file_rg_back')->store('carriers/docs', 'public');
        }
        if ($request->hasFile('file_cnh')) {
            if ($carrier && $carrier->document_cnh) Storage::disk('public')->delete($carrier->document_cnh);
            $fields['document_cnh'] = $request->file('file_cnh')->store('carriers/docs', 'public');
        }

        $isNew = !$request->filled('id');
        $carrier = Carrier::updateOrCreate(['id' => $request->id], $fields);

        CarrierAuditLog::create([
            'admin_id' => Auth::id(),
            'acao' => $isNew ? 'Transportadora Criada' : 'Transportadora Atualizada',
            'detalhes' => "A transportadora {$carrier->nome} foi " . ($isNew ? 'criada.' : 'atualizada.')
        ]);

        return response()->json(['status' => 'success', 'message' => 'Transportadora salva com sucesso!', 'data' => $carrier]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:ATIVA,INATIVA',
            'status_reason' => 'required|string|max:1000'
        ]);

        $carrier = Carrier::findOrFail($id);
        $carrier->status = $request->status;
        $carrier->status_reason = $request->status_reason;
        $carrier->save();

        CarrierAuditLog::create([
            'admin_id' => Auth::id(),
            'acao' => "Transportadora {$request->status}",
            'detalhes' => "O status da transportadora {$carrier->nome} foi alterado para {$request->status}. Motivo: {$request->status_reason}"
        ]);

        return response()->json(['status' => 'success', 'message' => 'Status atualizado com sucesso!']);
    }

    public function destroy($id)
    {
        $carrier = Carrier::findOrFail($id);
        
        if ($carrier->orders()->exists()) {
            return response()->json(['status' => 'error', 'message' => 'Não é possível excluir esta transportadora pois ela já possui pedidos vinculados. Considere desativá-la.'], 400);
        }

        if ($carrier->imagem) Storage::disk('public')->delete($carrier->imagem);
        if ($carrier->document_rg_front) Storage::disk('public')->delete($carrier->document_rg_front);
        if ($carrier->document_rg_back) Storage::disk('public')->delete($carrier->document_rg_back);
        if ($carrier->document_cnh) Storage::disk('public')->delete($carrier->document_cnh);

        CarrierAuditLog::create([
            'admin_id' => Auth::id(),
            'acao' => 'Transportadora Excluída',
            'detalhes' => "A transportadora {$carrier->nome} foi excluída permanentemente."
        ]);

        $carrier->delete();
        return response()->json(['status' => 'success']);
    }

    public function getAudits(Request $request)
    {
        $query = CarrierAuditLog::with('admin:id,name,role')->orderBy('created_at', 'desc');

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->paginate(15);
        return response()->json($logs);
    }

    public function getOrders(Request $request, $id)
    {
        $query = \App\Models\Order::where('carrier_id', $id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc');

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $orders = $query->paginate(10);
        
        $orders->getCollection()->transform(function($o) {
            return [
                'id' => $o->id,
                'status' => $o->status,
                'created_at' => $o->created_at->format('d/m/Y'),
                'total' => (float) $o->total,
                'cliente_nome' => $o->user ? $o->user->name : 'Cliente',
                'romaneio_url' => $o->romaneio_url ? asset('storage/' . $o->romaneio_url) : null,
                'tracking_code' => $o->tracking_code
            ];
        });

        return response()->json(['status' => 'success', 'data' => $orders]);
    }

    public function uploadRomaneio(Request $request, $orderId)
    {
        $request->validate(['arquivo' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120']);
        $order = \App\Models\Order::findOrFail($orderId);
        
        if ($order->romaneio_url) {
            Storage::disk('public')->delete($order->romaneio_url);
        }
        
        $path = $request->file('arquivo')->store('romaneios', 'public');
        $order->romaneio_url = $path;
        $order->save();
        
        return response()->json(['status' => 'success', 'url' => asset('storage/' . $path)]);
    }

    public function auditDownload(Request $request)
    {
        $request->validate([
            'document_type' => 'required|string',
            'carrier_name' => 'nullable|string'
        ]);

        $docType = $request->document_type;
        $carrierName = $request->carrier_name ?? 'Desconhecida';

        CarrierAuditLog::create([
            'admin_id' => Auth::id(),
            'acao' => 'Download de Documento',
            'detalhes' => "Download do documento ({$docType}) referente a transportadora {$carrierName}."
        ]);

        return response()->json(['status' => 'success']);
    }
}