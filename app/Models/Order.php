<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;
use App\Enums\OrderStatus;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'user_id',
        'carrier_id',
        'subtotal',
        'frete',
        'desconto',
        'total',
        'status',
        'payment_gateway',
        'payment_method',
        'payment_installments',
        'installment_value', // Valor de cada parcela
        'gateway_fee',       // Taxa de Juros do Gateway
        'tracking_code',
        'applied_coupons',    // Guarda os múltiplos cupons em formato JSON
        'cancel_reason',
        'refund_receipt',
        'refund_receipts',
        'refund_method',
        'refund_reason',
        'refund_requested_from_status',
        'payment_receipt',    // 🟢 ADICIONADO: Comprovante de Pagamento Manual
        'delivery_receipt'    // 🟢 ADICIONADO: Comprovante de Entrega / Assinatura
    ];

    // Blindagem de Tipos para o React receber os números e listas perfeitos
    protected function casts(): array
    {
        return [
            'status'               => OrderStatus::class,
            'subtotal'             => 'decimal:2',
            'frete'                => 'decimal:2',
            'desconto'             => 'decimal:2',
            'total'                => 'decimal:2',
            'installment_value'    => 'decimal:2',
            'gateway_fee'          => 'decimal:2',
            'payment_installments' => 'integer',
            'applied_coupons'      => 'array', // Converte JSON do banco para Lista no React automaticamente
            'refund_receipts'     => 'array',
        ];
    }

    // ==========================================
    // RELACIONAMENTOS (A Mágica do Banco Relacional)
    // ==========================================
    
    // 1 Pedido PERTENCE a 1 Cliente
    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    // 1 Pedido PERTENCE a 1 Transportadora
    public function carrier() {
        return $this->belongsTo(Carrier::class, 'carrier_id');
    }

    // 1 Pedido TEM MUITOS Itens (Carrinho)
    public function items() {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    // 1 Pedido TEM 1 Endereço de Entrega
    public function address() {
        return $this->hasOne(OrderAddress::class, 'order_id');
    }

    // 1 Pedido TEM MUITOS Logs de Histórico (Timeline)
    public function history() {
        return $this->hasMany(OrderHistory::class, 'order_id');
    }
}