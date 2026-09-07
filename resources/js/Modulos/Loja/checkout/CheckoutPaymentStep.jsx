import { ArrowLeft, CircleAlert, LockKeyhole } from 'lucide-react';

export default function CheckoutPaymentStep({ onBack }) {
    return (
        <section className="space-y-6" aria-labelledby="checkout-payment-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                        Pagamento
                    </span>
                    <h1 id="checkout-payment-title" className="text-2xl font-bold tracking-tight text-slate-950">Pagamento protegido</h1>
                    <p className="text-sm leading-6 text-slate-600">
                        O valor e a entrega já foram confirmados pelo servidor.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Voltar
                </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
                    <div>
                        <h2 className="font-bold text-amber-950">Pagamento ainda não está disponível nesta loja</h2>
                        <p className="mt-2 text-sm leading-6 text-amber-900">
                            Cartão, PIX e boleto só aparecerão depois que um gateway for configurado, homologado e conectado com tokenização e webhook seguros.
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="button"
                disabled
                className="min-h-12 w-full rounded-xl bg-slate-200 px-5 font-bold text-slate-500"
            >
                Aguardando um gateway seguro
            </button>
        </section>
    );
}
