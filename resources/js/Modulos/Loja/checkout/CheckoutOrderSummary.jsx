import { Box, ShieldCheck } from 'lucide-react';

const formatCurrency = (cents) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
}).format((cents || 0) / 100);

export default function CheckoutOrderSummary({ cartItems, summary }) {
    const items = summary?.items || cartItems;

    return (
        <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950">Resumo do pedido</h2>

                <div className="mt-5 space-y-4">
                    {items.map((item) => {
                        const cartItem = cartItems.find((cart) => cart.id === item.product_id || cart.id === item.id);
                        const quantity = item.quantity || item.quantidade;

                        return (
                            <div key={item.product_id || item.id} className="flex gap-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    {cartItem?.img ? (
                                        <img src={cartItem.img} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <Box className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold leading-5 text-slate-900">{item.name || item.nome}</p>
                                    <p className="mt-1 text-sm text-slate-600">Quantidade: {quantity}</p>
                                    {summary && (
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {formatCurrency(item.line_total_cents)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {summary ? (
                    <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm">
                        <div className="flex items-center justify-between gap-4 text-slate-600">
                            <span>Produtos</span>
                            <span>{formatCurrency(summary.snapshot.product_subtotal_cents)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-600">
                            <span>Entrega</span>
                            <span>{formatCurrency(summary.snapshot.shipping_cents)}</span>
                        </div>
                        {summary.snapshot.benefits.map((benefit) => (
                            <div key={[benefit.source, benefit.scope, benefit.reference || ''].join('-')} className="flex items-center justify-between gap-4 text-emerald-700">
                                <span>Desconto aplicado</span>
                                <span>-{formatCurrency(benefit.amount_cents)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4 text-base font-bold text-slate-950">
                            <span>Total</span>
                            <span>{formatCurrency(summary.snapshot.net_total_cents)}</span>
                        </div>
                    </div>
                ) : (
                    <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        Informe a entrega para confirmar subtotal, frete, descontos e total.
                    </p>
                )}

                <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-5 text-blue-900">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                    <p>Valores conferidos no servidor. Seus dados de cartão nunca serão coletados pela loja.</p>
                </div>
            </div>
        </aside>
    );
}
