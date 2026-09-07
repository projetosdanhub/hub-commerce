import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import CheckoutAccountStep from './checkout/CheckoutAccountStep';
import CheckoutDeliveryStep from './checkout/CheckoutDeliveryStep';
import CheckoutOrderSummary from './checkout/CheckoutOrderSummary';
import CheckoutPaymentStep from './checkout/CheckoutPaymentStep';
import CheckoutProgress from './checkout/CheckoutProgress';
import {
    getCheckoutAddresses,
    lookupPostalCode,
    requestCheckoutSummary,
    requestShippingQuotes,
    saveCheckoutAddress,
    responseMessage,
    startCheckoutCustomerSession,
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

const emptyCustomer = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

export default function PaginaCheckout({ cartItems = [] }) {
    const prefersReducedMotion = useReducedMotion();
    const location = useLocation();
    const deliveryDraft = location.state?.deliveryDraft;
    const initialDraftAddress = deliveryDraft?.address || emptyAddress;
    const initialDraftQuote = deliveryDraft?.quote || null;
    const [currentStep, setCurrentStep] = useState(1);
    const [customer, setCustomer] = useState(emptyCustomer);
    const [customerSession, setCustomerSession] = useState(null);
    const [address, setAddress] = useState(() => ({ ...emptyAddress, ...initialDraftAddress }));
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [saveAsDefault, setSaveAsDefault] = useState(false);
    const [quotes, setQuotes] = useState(() => initialDraftQuote ? [initialDraftQuote] : []);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [summary, setSummary] = useState(null);
    const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
    const [isLookingUpPostalCode, setIsLookingUpPostalCode] = useState(false);
    const [isLoadingSavedAddresses, setIsLoadingSavedAddresses] = useState(false);
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

    const clearDeliveryCalculation = () => {
        setQuotes([]);
        setSelectedQuote(null);
        setSummary(null);
    };

    const updateCustomer = (field, value) => {
        setCustomer((current) => ({ ...current, [field]: value }));
    };

    const updateAddress = (field, value) => {
        clearDeliveryCalculation();
        setAddress((current) => ({ ...current, [field]: value }));
    };

    const handleCustomerSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsSubmittingAccount(true);

        try {
            const session = await startCheckoutCustomerSession(customer);

            setCustomerSession(session.token);
            setIsLoadingSavedAddresses(true);

            try {
                const addresses = await getCheckoutAddresses(session.token);

                setSavedAddresses(addresses);
            } catch (requestError) {
                setError(responseMessage(requestError, 'Não foi possível carregar os endereços salvos. Você pode informar um novo endereço.'));
            } finally {
                setIsLoadingSavedAddresses(false);
            }

            setCurrentStep(2);
        } catch (requestError) {
            setError(responseMessage(requestError, 'Não foi possível preparar sua conta. Tente novamente.'));
        } finally {
            setIsSubmittingAccount(false);
        }
    };

    const handlePostalCodeLookup = async () => {
        const postalCode = address.cep.replace(/\D/g, '');

        if (postalCode.length !== 8) {
            return;
        }

        setError(null);
        setIsLookingUpPostalCode(true);

        try {
            const foundAddress = await lookupPostalCode(postalCode);

            clearDeliveryCalculation();
            setAddress((current) => ({
                ...current,
                ...foundAddress,
            }));
        } catch (requestError) {
            setError(responseMessage(requestError, 'Não foi possível localizar o CEP. Preencha o endereço manualmente.'));
        } finally {
            setIsLookingUpPostalCode(false);
        }
    };

    const handleSelectSavedAddress = (savedAddress) => {
        clearDeliveryCalculation();
        setAddress({
            cep: savedAddress.cep,
            rua: savedAddress.rua,
            numero: savedAddress.numero,
            complemento: savedAddress.complemento || '',
            bairro: savedAddress.bairro,
            cidade: savedAddress.cidade,
            uf: savedAddress.uf,
        });
        setSaveAsDefault(false);
    };

    const handleNewAddress = () => {
        clearDeliveryCalculation();
        setAddress(emptyAddress);
        setSaveAsDefault(false);
    };

    const handleRequestQuotes = async () => {
        if (items.length === 0) {
            setError('Seu carrinho está vazio.');
            return;
        }

        setError(null);
        setIsRequestingQuotes(true);

        try {
            if (saveAsDefault) {
                const storedAddress = await saveCheckoutAddress(customerSession, {
                    ...address,
                    is_default: true,
                });

                setSavedAddresses((current) => [
                    storedAddress,
                    ...current.map((savedAddress) => ({
                        ...savedAddress,
                        is_default: false,
                    })),
                ]);
                setSaveAsDefault(false);
            }

            const nextQuotes = await requestShippingQuotes(items, address);

            setQuotes(nextQuotes);
            setSelectedQuote(null);
            setSummary(null);

            if (nextQuotes.length === 0) {
                setError('Não há opções de entrega disponíveis para este endereço.');
            }
        } catch (requestError) {
            setError(responseMessage(requestError, 'Não foi possível calcular o frete para este endereço.'));
        } finally {
            setIsRequestingQuotes(false);
        }
    };

    const handleSelectQuote = async (quote) => {
        setError(null);
        setSelectedQuote(quote);
        setSummary(null);
        setIsSummarizing(true);

        try {
            const nextSummary = await requestCheckoutSummary(items, address, quote.token);

            setSummary(nextSummary);
        } catch (requestError) {
            setSelectedQuote(null);
            setError(responseMessage(requestError, 'A cotação expirou. Calcule o frete novamente.'));
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleContinueToPayment = () => {
        if (!summary) {
            setError('Selecione uma entrega para confirmar o total.');
            return;
        }

        setCurrentStep(3);
    };

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-12">
                <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-950">Seu carrinho está vazio</h1>
                    <p className="mt-3 text-slate-600">Adicione um produto antes de iniciar o checkout.</p>
                    <Link
                        to="/carrinho"
                        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 font-bold text-white transition hover:bg-blue-700"
                    >
                        Ir para o carrinho
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <Helmet>
                <title>Finalizar compra | HUB Commerce</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Link to="/carrinho" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-blue-700">
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        Carrinho
                    </Link>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <LockKeyhole className="h-4 w-4 text-blue-700" aria-hidden="true" />
                        Checkout protegido
                    </div>
                </div>
            </header>

            <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:items-start lg:py-10">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:col-span-2">
                    <CheckoutProgress currentStep={currentStep} reducedMotion={prefersReducedMotion} />

                    {error && (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900" role="alert">
                            {error}
                        </div>
                    )}

                    {customerSession && currentStep > 1 && (
                        <div className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-900">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                            <p>Conta preparada para esta compra.</p>
                        </div>
                    )}

                    <motion.div
                        key={currentStep}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
                        className="mt-8"
                    >
                        {currentStep === 1 && (
                            <CheckoutAccountStep
                                customer={customer}
                                onChange={updateCustomer}
                                onSubmit={handleCustomerSubmit}
                                isSubmitting={isSubmittingAccount}
                            />
                        )}

                        {currentStep === 2 && (
                            <CheckoutDeliveryStep
                                address={address}
                                onChange={updateAddress}
                                onLookupPostalCode={handlePostalCodeLookup}
                                isLookingUpPostalCode={isLookingUpPostalCode}
                                onRequestQuotes={handleRequestQuotes}
                                isRequestingQuotes={isRequestingQuotes}
                                quotes={quotes}
                                selectedQuote={selectedQuote}
                                onSelectQuote={handleSelectQuote}
                                isSummarizing={isSummarizing}
                                onBack={() => setCurrentStep(1)}
                                onContinue={handleContinueToPayment}
                                savedAddresses={savedAddresses}
                                isLoadingSavedAddresses={isLoadingSavedAddresses}
                                onSelectSavedAddress={handleSelectSavedAddress}
                                onNewAddress={handleNewAddress}
                                saveAsDefault={saveAsDefault}
                                onSaveAsDefaultChange={setSaveAsDefault}
                            />
                        )}

                        {currentStep === 3 && <CheckoutPaymentStep onBack={() => setCurrentStep(2)} />}
                    </motion.div>
                </section>

                <CheckoutOrderSummary cartItems={cartItems} summary={summary} />
            </main>
        </div>
    );
}
