<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Declaração de conteúdo — Pedido HUB-{{ $order->id }}</title>
    <style>
        :root { color-scheme: light; font-family: Arial, sans-serif; color: #0f172a; }
        body { margin: 0; padding: 32px; background: #eef2f7; font-size: 12px; }
        .toolbar, .sheet { max-width: 920px; margin: 0 auto; }
        .toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
        button { padding: 10px 16px; border: 0; border-radius: 8px; background: #102a56; color: white; font-weight: 700; cursor: pointer; }
        .sheet { box-sizing: border-box; padding: 28px; background: white; border: 1px solid #cbd5e1; }
        h1 { margin: 0; font-size: 20px; text-align: center; text-transform: uppercase; }
        .meta { margin: 8px 0 24px; text-align: center; color: #475569; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .box { padding: 14px; border: 1px solid #94a3b8; overflow-wrap: anywhere; }
        .box h2 { margin: 0 0 8px; font-size: 12px; }
        table { width: 100%; margin-top: 20px; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #94a3b8; text-align: left; overflow-wrap: anywhere; }
        th { background: #e2e8f0; }
        .number { text-align: right; white-space: nowrap; }
        .total { margin: 16px 0; text-align: right; font-size: 14px; }
        .legal { margin-top: 24px; padding-top: 16px; border-top: 1px solid #94a3b8; }
        .signature { margin-top: 54px; text-align: center; }
        @media (max-width: 640px) { body { padding: 12px; } .sheet { padding: 16px; } .parties { grid-template-columns: 1fr; } }
        @media print { body { padding: 0; background: white; } .toolbar { display: none; } .sheet { border: 0; } }
    </style>
</head>
<body>
    <div class="toolbar"><button type="button" onclick="window.print()">Imprimir ou salvar PDF</button></div>
    <main class="sheet">
        <h1>Declaração de conteúdo</h1>
        <p class="meta">Pedido HUB-{{ $order->id }} · {{ $order->created_at->format('d/m/Y H:i') }}</p>
        <div class="parties">
            <section class="box">
                <h2>REMETENTE</h2>
                <strong>{{ $remetente['nome'] }}</strong><br>
                {{ $remetente['rua'] }}, {{ $remetente['numero'] }}<br>
                {{ $remetente['bairro'] }} — {{ $remetente['cidade'] }}/{{ $remetente['uf'] }}<br>
                CEP {{ $remetente['cep'] }} · CPF/CNPJ {{ $remetente['documento'] }}
            </section>
            <section class="box">
                <h2>DESTINATÁRIO</h2>
                <strong>{{ $order->user->name }}</strong><br>
                {{ $order->address->rua }}, {{ $order->address->num }} {{ $order->address->complemento }}<br>
                {{ $order->address->bairro }} — {{ $order->address->cidade }}/{{ $order->address->uf }}<br>
                CEP {{ $order->address->cep }} · CPF/CNPJ {{ $order->user->cpf ?: 'Não informado' }}
            </section>
        </div>
        <table>
            <thead><tr><th>Item</th><th>Variação</th><th class="number">Qtd.</th><th class="number">Unitário</th><th class="number">Total</th></tr></thead>
            <tbody>
                @foreach ($order->items as $item)
                    <tr>
                        <td>{{ $item->product_name }}</td>
                        <td>{{ $item->variation_name ?: 'Sem variação' }}</td>
                        <td class="number">{{ $item->quantity }}</td>
                        <td class="number">R$ {{ number_format((float) $item->price, 2, ',', '.') }}</td>
                        <td class="number">R$ {{ number_format((float) $item->price * $item->quantity, 2, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <p class="total"><strong>Total declarado: R$ {{ number_format((float) $order->total, 2, ',', '.') }}</strong></p>
        <p class="legal">Declaro que não estou postando material inflamável, corrosivo, explosivo, perigoso ou qualquer outro item proibido pela legislação vigente.</p>
        <p class="signature">________________________________________<br>Assinatura do remetente</p>
    </main>
</body>
</html>
