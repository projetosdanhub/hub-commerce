import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    LoaderCircle,
    MapPin,
    PackageCheck,
    RefreshCw,
    ShieldCheck,
    Ticket,
    Trash2,
    Truck,
} from 'lucide-react';
import {
    lookupPostalCode,
    requestCheckoutSummary,
    requestShippingQuotes,
    responseMessage,
} from './checkout/checkoutApi';

const emptyAddress = {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
};

const formatCurrency = (cents) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
}).format((cents || 0) / 100);

const formatItemPrice = (item) => {
    const amount = Number(item.precoAtual || item.precoVenda || item.preco) || 0;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
};

export default function PaginaCarrinho({ cartItems = [], setCartItems = () => {} }) {
    const navigate = useNavigate();
    const reducedMotion = useReducedMotion();
    const [address, setAddress] = useState(emptyAddress);
    const [quotes, setQuotes] = useState([]);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [summary, setSummary] = useState(null);
    const [isLookingUpPostalCode, setIsLookingUpPostalCode] = useState(false);
    const [isRequestingQuotes, setIsRequestingQuotes] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [error, setError] = useState(null);

    const items = useMemo(
        () => cartItems.map((item) => ({
            id: item.id,
            quantity: Number(item.quantidade) || 1,
        })),
        [cartItems],
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const clearCalculation = () => {
        setQuotes([]);
        setSelectedQuote(null);
        setSummary(null);
    };

    const updateAddress = (field, value) => {
        clearCalculation();
        setAddress((current) => ({ ...current, [field]: value }));
    };

    const updateQuantity = (id, delta) => {
        clearCalculation();
        setCartItems((current) => current.map((item) => item.id === id
            ? { ...item, quantidade: Math.max(1, (Number(item.quantidade) || 1) + delta) }
            : item));
    };

    const removeItem = (id) => {
        clearCalculation();
        setCartItems((current) => current.filter((item) => item.id !== id));
    };

    const lookupAddress = async () => {
        const postalCode = address.cep.replace(/\D/g, '');

        if (postalCode.length !== 8) {
            setError('Informe os oito números do CEP para buscar o endereço.');
            return;
        }

        setError(null);
        setIsLookingUpPostalCode(true);

        try {
            const foundAddress = await lookupPostalCode(postalCode);

            clearCalculation();
            setAddress((current) => ({
                ...current,
                ...foundAddress,
            }));
        } catch (requestError) {
            setError(responseMessage(requestError, 'Não foi possível localizar esse CEP. Preencha o endereço manualmente.'));
        } finally {
            setIsLookingUpPostalCode(false);
        }
    };

    const requestQuotes = async () => {
        if (items.length === 0) {
            setError('Seu carrinho está vazio.');
            return;
        }

        setError(null);
        setIsRequestingQuotes(true);

        try {
            const nextQuotes = await requestShippingQuotes(items, address);

            setQuotes(nextQuotes);
            setSelectedQuote(null);
            setSummary(null);

            if (nextQuotes.length === 0) {
                setError('Não há opções de entrega disponíveis para este endereço.');
            }
        } catch (requestError) {
            setError(responseMessage(requestError, 'Preencha o endereço completo para calcular o frete.'));
        } finally {
            setIsRequestingQuotes(false);
        }
    };

    const selectQuote = async (quote) => {
        setError(null);
        setSelectedQuote(quote);
        setSummary(null);
        setIsSummarizing(true);

        try {
            const nextSummary = await requestCheckoutSummary(items, address, quote.token);

            setSummary(nextSummary);
        } catch (requestError) {
            setSelectedQuote(null);
            setError(responseMessage(requestError, 'A cotação expirou ou o carrinho mudou. Calcule o frete novamente.'));
        } finally {
            setIsSummarizing(false);
        }
    };

    const proceedToCheckout = () => {
        if (summary === null || selectedQuote === null) {
            setError('Calcule e selecione uma opção de entrega para confirmar o total.');
            document.getElementById('delivery-options')?.scrollIntoView({
                behavior: reducedMotion ? 'auto' : 'smooth',
                block: 'center',
            });
            return;
        }

        navigate('/checkout', {
            state: {
                deliveryDraft: {
                    address,
                    quote: selectedQuote,
                },
            },
        });
    };

    return (
        <main className="min-h-screen bg-slate-50 py-8 text-slate-950 sm:py-12">
            <Helmet>
                <title>Carrinho | HUB Commerce</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-blue-700">Sua compra</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Carrinho</h1>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                        {items.length} {items.length === 1 ? 'produto' : 'produtos'}
                    </span>
                </div>

                {items.length === 0 ? (
                    <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <PackageCheck className="mx-auto h-12 w-12 text-blue-700" aria-hidden="true" />
                        <h2 className="mt-5 text-xl font-bold text-slate-950">Seu carrinho está vazio</h2>
                        <p className="mt-2 text-slate-600">Escolha um produto para continuar sua compra.</p>
                        <Link
                            to="/"
                            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                            Voltar para a loja
                        </Link>
                    </section>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                        <section className="space-y-4 lg:col-span-2" aria-labelledby="cart-items-title">
                            <h2 id="cart-items-title" className="sr-only">Itens do carrinho</h2>
                            <AnimatePresence initial={false}>
                                {cartItems.map((item) => (
                                    <motion.article
                                        key={item.id}
                                        layout
                                        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                                        className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                                    >
                                        <div className="flex gap-4">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                                                {item.imagem || Array.isArray(item.imagens) && item.imagens[0] ? (
                                                    <img
                                                        src={item.imagem || item.imagens[0]}
                                                        alt={item.nome || 'Produto'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-slate-100" aria-hidden="true" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <Link to={'/produto/' + item.id} className="line-clamp-2 pr-8 text-sm font-bold leading-6 text-slate-900 transition hover:text-blue-700 sm:text-base">
                                                    {item.nome || 'Produto'}
                                                </Link>
                                                {item.variacaoSelecionada && (
                                                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                        {Object.entries(item.variacaoSelecionada).map(([name, value]) => name + ': ' + value).join(' · ')}
                                                    </p>
                                                )}
                                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                                    <div className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            aria-label={'Diminuir quantidade de ' + (item.nome || 'produto')}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantidade || 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            aria-label={'Aumentar quantidade de ' + (item.nome || 'produto')}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{formatItemPrice(item)}</span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                aria-label={'Remover ' + (item.nome || 'produto') + ' do carrinho'}
                                                className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </motion.article>
                                ))}
                            </AnimatePresence>

                            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                                <div className="flex gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                                    <p className="text-sm leading-6 text-blue-950">
                                        O total é confirmado pela loja a partir do catálogo e da entrega selecionada. Nenhum valor informado pelo navegador é usado no pagamento.
                                    </p>
                                </div>
                            </section>
                        </section>

                        <aside className="space-y-5 lg:sticky lg:top-6">
                            {error && (
                                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
                                    {error}
                                </div>
                            )}

                            <section id="delivery-options" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
                                    <div>
                                        <h2 className="font-bold text-slate-950">Entrega</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">Digite o CEP e revise o endereço antes de cotar.</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-6 lg:grid-cols-1">
                                    <label className="sm:col-span-3">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">CEP</span>
                                        <div className="flex gap-2">
                                            <input
                                                value={address.cep}
                                                onChange={(event) => updateAddress('cep', event.target.value)}
                                                onBlur={lookupAddress}
                                                inputMode="numeric"
                                                autoComplete="postal-code"
                                                maxLength="9"
                                                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={lookupAddress}
                                                disabled={isLookingUpPostalCode}
                                                aria-label="Buscar CEP"
                                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:text-slate-400"
                                            >
                                                <RefreshCw className={isLookingUpPostalCode ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </label>

                                    <label className="sm:col-span-3">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">Número</span>
                                        <input
                                            value={address.numero}
                                            onChange={(event) => updateAddress('numero', event.target.value)}
                                            autoComplete="address-line2"
                                            className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </label>

                                    <label className="sm:col-span-6">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">Rua</span>
                                        <input
                                            value={address.rua}
                                            onChange={(event) => updateAddress('rua', event.target.value)}
                                            autoComplete="address-line1"
                                            className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </label>

                                    <label className="sm:col-span-6">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">Complemento <span className="font-normal text-slate-500">(opcional)</span></span>
                                        <input
                                            value={address.complemento}
                                            onChange={(event) => updateAddress('complemento', event.target.value)}
                                            autoComplete="address-line2"
                                            className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </label>

                                    <label className="sm:col-span-2">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">Bairro</span>
                                        <input value={address.bairro} onChange={(event) => updateAddress('bairro', event.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
                                    </label>

                                    <label className="sm:col-span-3">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">Cidade</span>
                                        <input value={address.cidade} onChange={(event) => updateAddress('cidade', event.target.value)} autoComplete="address-level2" className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
                                    </label>

                                    <label className="sm:col-span-1">
                                        <span className="mb-1.5 block text-sm font-semibold text-slate-800">UF</span>
                                        <input value={address.uf} onChange={(event) => updateAddress('uf', event.target.value.toUpperCase())} maxLength="2" autoComplete="address-level1" className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm uppercase outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={requestQuotes}
                                    disabled={isRequestingQuotes}
                                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-wait disabled:text-blue-400"
                                >
                                    {isRequestingQuotes ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Truck className="h-4 w-4" aria-hidden="true" />}
                                    {isRequestingQuotes ? 'Cotando entrega…' : 'Calcular frete'}
                                </button>

                                {quotes.length > 0 && (
                                    <div className="mt-4 space-y-2" role="radiogroup" aria-label="Opções de entrega">
                                        {quotes.map((quote) => {
                                            const isSelected = selectedQuote?.token === quote.token;

                                            return (
                                                <button
                                                    key={quote.token}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    onClick={() => selectQuote(quote)}
                                                    disabled={isSummarizing}
                                                    className={[
                                                        'flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait',
                                                        isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300',
                                                    ].join(' ')}
                                                >
                                                    <span>
                                                        <span className="block text-sm font-bold text-slate-900">Até {quote.estimated_delivery_days} dias úteis</span>
                                                        <span className="mt-1 block text-xs text-slate-600">Serviço confirmado pela transportadora</span>
                                                    </span>
                                                    <span className="shrink-0 text-sm font-bold text-slate-950">{formatCurrency(quote.shipping_cents)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="cart-summary-title">
                                <h2 id="cart-summary-title" className="text-lg font-bold text-slate-950">Resumo</h2>

                                {summary ? (
                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex justify-between gap-4 text-slate-600">
                                            <span>Produtos</span>
                                            <span className="font-semibold text-slate-900">{formatCurrency(summary.snapshot.product_subtotal_cents)}</span>
                                        </div>
                                        <div className="flex justify-between gap-4 text-slate-600">
                                            <span>Entrega</span>
                                            <span className="font-semibold text-slate-900">{formatCurrency(summary.snapshot.shipping_cents)}</span>
                                        </div>
                                        <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-base">
                                            <span className="font-bold text-slate-950">Total confirmado</span>
                                            <span className="font-bold text-slate-950">{formatCurrency(summary.snapshot.net_total_cents)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm leading-6 text-slate-600">Selecione uma entrega para o servidor confirmar produtos, frete e total.</p>
                                )}

                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="flex gap-2">
                                        <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
                                        <p className="text-xs leading-5 text-slate-600">
                                            Cupons e benefícios de frete serão exibidos aqui somente quando a regra da loja puder ser validada pelo servidor.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={proceedToCheckout}
                                    disabled={isSummarizing}
                                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:bg-slate-400"
                                >
                                    {isSummarizing ? 'Confirmando total…' : 'Continuar para checkout'}
                                    {!isSummarizing && <ChevronRight className="h-5 w-5" aria-hidden="true" />}
                                </button>
                            </section>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}
