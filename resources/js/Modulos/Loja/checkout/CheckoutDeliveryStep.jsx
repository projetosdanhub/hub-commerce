import { ArrowLeft, ArrowRight, MapPin, RefreshCw, Truck } from 'lucide-react';

const formatCurrency = (cents) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
}).format((cents || 0) / 100);

export default function CheckoutDeliveryStep({
    address,
    onChange,
    onLookupPostalCode,
    isLookingUpPostalCode,
    onRequestQuotes,
    isRequestingQuotes,
    quotes,
    selectedQuote,
    onSelectQuote,
    isSummarizing,
    onBack,
    onContinue,
    savedAddresses,
    isLoadingSavedAddresses,
    onSelectSavedAddress,
    onNewAddress,
    saveAsDefault,
    onSaveAsDefaultChange,
}) {
    return (
        <section className="space-y-6" aria-labelledby="checkout-delivery-title">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        Entrega
                    </span>
                    <h1 id="checkout-delivery-title" className="text-2xl font-bold tracking-tight text-slate-950">Para onde vamos enviar?</h1>
                    <p className="text-sm leading-6 text-slate-600">
                        Informe o CEP para preencher o endereço e ajuste qualquer informação necessária.
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

            {(isLoadingSavedAddresses || savedAddresses.length > 0) && (
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-labelledby="saved-addresses-title">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 id="saved-addresses-title" className="font-bold text-slate-900">Endereços salvos</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-600">Escolha um endereço da sua conta ou informe outro.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onNewAddress}
                            className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            Usar outro endereço
                        </button>
                    </div>

                    {isLoadingSavedAddresses ? (
                        <p className="mt-4 text-sm text-slate-600">Carregando seus endereços…</p>
                    ) : (
                        <div className="mt-4 grid gap-3">
                            {savedAddresses.map((savedAddress) => (
                                <button
                                    key={savedAddress.id}
                                    type="button"
                                    onClick={() => onSelectSavedAddress(savedAddress)}
                                    className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    <span className="block font-bold text-slate-900">
                                        {savedAddress.is_default ? 'Endereço padrão' : savedAddress.label || 'Endereço salvo'}
                                    </span>
                                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                                        {savedAddress.rua}, {savedAddress.numero} — {savedAddress.bairro}, {savedAddress.cidade}/{savedAddress.uf}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <div className="grid gap-4 sm:grid-cols-6">
                <label className="block sm:col-span-3">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">CEP</span>
                    <div className="flex gap-2">
                        <input
                            required
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength="9"
                            value={address.cep}
                            onChange={(event) => onChange('cep', event.target.value)}
                            onBlur={onLookupPostalCode}
                            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                            type="button"
                            onClick={onLookupPostalCode}
                            disabled={isLookingUpPostalCode}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
                            aria-label="Buscar CEP"
                        >
                            <RefreshCw className={isLookingUpPostalCode ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
                        </button>
                    </div>
                </label>

                <label className="block sm:col-span-3">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Número</span>
                    <input
                        required
                        autoComplete="address-line2"
                        value={address.numero}
                        onChange={(event) => onChange('numero', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <label className="block sm:col-span-4">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Rua ou logradouro</span>
                    <input
                        required
                        autoComplete="address-line1"
                        value={address.rua}
                        onChange={(event) => onChange('rua', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Complemento</span>
                    <input
                        autoComplete="address-line2"
                        value={address.complemento}
                        onChange={(event) => onChange('complemento', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Bairro</span>
                    <input
                        required
                        value={address.bairro}
                        onChange={(event) => onChange('bairro', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <label className="block sm:col-span-3">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">Cidade</span>
                    <input
                        required
                        autoComplete="address-level2"
                        value={address.cidade}
                        onChange={(event) => onChange('cidade', event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>

                <label className="block sm:col-span-1">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">UF</span>
                    <input
                        required
                        maxLength="2"
                        autoComplete="address-level1"
                        value={address.uf}
                        onChange={(event) => onChange('uf', event.target.value.toUpperCase())}
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                </label>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                <input
                    type="checkbox"
                    checked={saveAsDefault}
                    onChange={(event) => onSaveAsDefaultChange(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span>
                    <span className="block font-bold text-slate-900">Salvar como endereço padrão</span>
                    O endereço ficará disponível nas próximas compras desta loja.
                </span>
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-slate-900">Escolha a entrega</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                            A cotação vem da transportadora e só vale para este carrinho e endereço.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onRequestQuotes}
                        disabled={isRequestingQuotes}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                        <Truck className="h-4 w-4" aria-hidden="true" />
                        {isRequestingQuotes ? 'Cotando…' : 'Calcular frete'}
                    </button>
                </div>

                {quotes.length > 0 && (
                    <div className="mt-4 space-y-3" role="radiogroup" aria-label="Opções de entrega">
                        {quotes.map((quote) => {
                            const isSelected = quote.token === selectedQuote?.token;

                            return (
                                <button
                                    key={quote.token}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => onSelectQuote(quote)}
                                    disabled={isSummarizing}
                                    className={[
                                        'flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait',
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 bg-white hover:border-blue-300',
                                    ].join(' ')}
                                >
                                    <span className="min-w-0">
                                        <span className="block font-bold text-slate-900">Entrega em até {quote.estimated_delivery_days} dias úteis</span>
                                        <span className="mt-1 block text-sm text-slate-600">Serviço confirmado pela transportadora</span>
                                    </span>
                                    <span className="shrink-0 text-right font-bold text-slate-950">{formatCurrency(quote.shipping_cents)}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onContinue}
                disabled={!selectedQuote || isSummarizing}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                {isSummarizing ? 'Atualizando o resumo…' : 'Continuar para pagamento'}
                {!isSummarizing && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
            </button>
        </section>
    );
}
