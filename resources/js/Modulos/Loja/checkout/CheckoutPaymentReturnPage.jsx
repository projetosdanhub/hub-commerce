import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CircleAlert, CircleCheck, Loader2, ShieldCheck } from 'lucide-react';
import {
  clearCheckoutPaymentSession,
  readCheckoutPaymentSession,
} from './checkoutPaymentSession';
import { requestCheckoutPaymentStatus, responseMessage } from './checkoutApi';

const pendingStatuses = new Set(['PENDING', 'PROCESSING']);

export default function CheckoutPaymentReturnPage() {
  const [payment] = useState(readCheckoutPaymentSession);
  const [state, setState] = useState(() => payment
    ? { kind: 'loading', message: 'Confirmando o pagamento com segurança…' }
    : { kind: 'unavailable', message: 'Não foi possível retomar esta confirmação de pagamento.' },
  );

  useEffect(() => {
    let cancelled = false;
    let timer;

    if (!payment) {
      return undefined;
    }

    const check = async () => {
      try {
        const result = await requestCheckoutPaymentStatus(payment.orderId, payment.checkoutToken);

        if (cancelled) return;

        if (result.payment_status === 'SUCCEEDED') {
          clearCheckoutPaymentSession();
          setState({ kind: 'success', message: 'Pagamento confirmado. Seu pedido entrou em preparação.' });

          return;
        }

        if (['FAILED', 'CANCELLED'].includes(result.payment_status)) {
          clearCheckoutPaymentSession();
          setState({ kind: 'error', message: 'O pagamento não foi confirmado. Revise os dados e tente novamente.' });

          return;
        }

        if (!pendingStatuses.has(result.payment_status)) {
          setState({ kind: 'unavailable', message: 'O pagamento precisa de verificação antes de continuar.' });

          return;
        }

        timer = window.setTimeout(check, 2000);
      } catch (error) {
        if (!cancelled) {
          setState({ kind: 'error', message: responseMessage(error, 'Não foi possível consultar este pagamento agora.') });
        }
      }
    };

    check();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const isLoading = state.kind === 'loading';
  const isSuccess = state.kind === 'success';
  const Icon = isLoading ? Loader2 : isSuccess ? CircleCheck : CircleAlert;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:py-16">
      <Helmet>
        <title>Confirmação de pagamento | HUB Commerce</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <ShieldCheck className="h-5 w-5 text-blue-700" aria-hidden="true" />
          Checkout protegido
        </div>
        <Icon className={'mt-8 h-9 w-9 ' + (isLoading ? 'animate-spin text-blue-700' : isSuccess ? 'text-emerald-700' : 'text-amber-700')} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{isSuccess ? 'Pagamento confirmado' : isLoading ? 'Aguardando confirmação' : 'Confirmação indisponível'}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{state.message}</p>
        {isLoading ? <p className="mt-5 text-sm text-slate-500">Esta tela atualiza automaticamente quando o servidor registrar a confirmação.</p> : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Voltar à loja</Link>
          {!isSuccess ? <Link to="/checkout" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Tentar novamente</Link> : null}
        </div>
      </section>
    </main>
  );
}
