import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CircleAlert, CreditCard, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { requestStripePaymentIntent, responseMessage } from './checkoutApi';

const loadStripe = (publishableKey) => new Promise((resolve, reject) => {
    if (window.Stripe) {
        resolve(window.Stripe(publishableKey));
        return;
    }

    const current = document.querySelector('script[data-stripe-js="true"]');

    if (current) {
        current.addEventListener('load', () => resolve(window.Stripe(publishableKey)), { once: true });
        current.addEventListener('error', () => reject(new Error('Não foi possível carregar o Stripe.')), { once: true });
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.dataset.stripeJs = 'true';
    script.onload = () => resolve(window.Stripe(publishableKey));
    script.onerror = () => reject(new Error('Não foi possível carregar o Stripe.'));
    document.head.appendChild(script);
});

export default function CheckoutPaymentStep({ checkoutToken, items, address, shippingQuoteToken, onBack }) {
    const mountRef = useRef(null);
    const [intent, setIntent] = useState(null);
    const [stripeState, setStripeState] = useState(null);
    const [error, setError] = useState(null);
    const [isPreparing, setIsPreparing] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const idempotencyKey = useRef(window.crypto?.randomUUID?.() || null);

    useEffect(() => {
        let cancelled = false;

        const prepare = async () => {
            try {
                if (!idempotencyKey.current) {
                    throw new Error('Seu navegador não pode iniciar um pagamento seguro.');
                }

                const paymentIntent = await requestStripePaymentIntent({
                    items,
                    address,
                    shipping_quote_token: shippingQuoteToken,
                    idempotency_key: idempotencyKey.current,
                }, checkoutToken);
                const stripe = await loadStripe(paymentIntent.publishable_key);

                if (cancelled) return;

                const elements = stripe.elements({
                    clientSecret: paymentIntent.client_secret,
                    appearance: {
                        theme: 'stripe',
                        variables: { colorPrimary: '#c2410c', borderRadius: '12px' },
                    },
                });
                const paymentElement = elements.create('payment');
                paymentElement.mount(mountRef.current);
                setIntent(paymentIntent);
                setStripeState({ stripe, elements });
            } catch (requestError) {
                if (!cancelled) {
                    setError(responseMessage(requestError, 'O pagamento por cartão não está disponível nesta loja.'));
                }
            } finally {
                if (!cancelled) setIsPreparing(false);
            }
        };

        prepare();

        return () => {
            cancelled = true;
        };
    }, [address, checkoutToken, items, shippingQuoteToken]);

    const confirm = async () => {
        if (!stripeState) return;

        setError(null);
        setIsConfirming(true);

        try {
            const result = await stripeState.stripe.confirmPayment({
                elements: stripeState.elements,
                confirmParams: {
                    return_url: window.location.origin + '/checkout/retorno',
                },
                redirect: 'if_required',
            });

            if (result.error) {
                setError(result.error.message || 'Não foi possível confirmar o pagamento.');
                return;
            }

            setError('Pagamento enviado para confirmação. O pedido será atualizado somente após o webhook seguro.');
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <section className="space-y-6" aria-labelledby="checkout-payment-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                        Pagamento
                    </span>
                    <h1 id="checkout-payment-title" className="text-2xl font-bold tracking-tight text-slate-950">Pagamento protegido</h1>
                    <p className="text-sm leading-6 text-slate-600">O total foi reconstruído no servidor e os dados do cartão seguem direto para o Stripe.</p>
                </div>
                <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Voltar
                </button>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                <ShieldCheck className="mr-2 inline h-4 w-4" aria-hidden="true" />
                O pedido só é aprovado após a confirmação assinada do webhook.
            </div>

            {error ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950" role="alert">
                    <CircleAlert className="mr-2 inline h-5 w-5" aria-hidden="true" />
                    {error}
                </div>
            ) : null}

            {isPreparing ? (
                <div className="flex min-h-36 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-700">
                    <Loader2 className="h-5 w-5 animate-spin text-orange-700" aria-hidden="true" />
                    Preparando o pagamento seguro…
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div ref={mountRef} aria-label="Formulário seguro de pagamento Stripe" />
                </div>
            )}

            <button type="button" disabled={!intent || !stripeState || isConfirming} onClick={confirm} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 font-bold text-white transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                {isConfirming ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <CreditCard className="h-5 w-5" aria-hidden="true" />}
                {isConfirming ? 'Confirmando…' : 'Pagar com segurança'}
            </button>
        </section>
    );
}
