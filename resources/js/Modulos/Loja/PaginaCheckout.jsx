import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Ícones
const CheckIcon = () => <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const LockIcon = () => <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>;
const CreditCardIcon = () => <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;

const CheckoutPage = ({ cartItems = [] }) => {
    // Gestão do Estado dos Passos do Checkout
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState(null);
    
    const itensCarrinho = cartItems.map((item) => ({
        id: item.id,
        nome: item.nome,
        qtd: Number(item.quantidade) || 1,
        img: item.img,
    }));
    const hasItems = itensCarrinho.length > 0;

    // Estado do Formulário
    const [formData, setFormData] = useState({
        cliente: { email: '', nome: '', cpf: '', telefone: '' },
        endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
        pagamento: { metodo: 'unavailable', parcelas: 1 }
    });

    useEffect(() => {
        // Dispara evento do Pixel: InitiateCheckout
        window.dispatchEvent(new CustomEvent('tracker:event', {
            detail: {
                event: 'InitiateCheckout',
                data: {
                    currency: 'BRL',
                    content_ids: itensCarrinho.map(i => i.id),
                    content_type: 'product',
                    num_items: itensCarrinho.length
                }
            }
        }));
    }, []);

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNextStep = (nextStep) => {
        if (nextStep === 3) {
            // Dispara evento do Pixel: AddPaymentInfo
            const eventPayload = {
                event: 'AddPaymentInfo',
                ecommerce: {
                    currency: 'BRL',
                    payment_type: formData.pagamento.metodo,
                    items: itensCarrinho.map(item => ({ item_id: item.id, item_name: item.nome, quantity: item.qtd }))
                }
            };
            window.dispatchEvent(new CustomEvent('tracker:event', { detail: eventPayload }));
        }
        setCurrentStep(nextStep);
    };


    // Componente auxiliar para os marcadores de passo (Bolinhas)
    const StepIndicator = ({ stepNum, label, isCurrent, isCompleted }) => (
        <div className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                isCompleted ? 'bg-green-500 text-white' : 
                isCurrent ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'
            }`}>
                {isCompleted ? <CheckIcon /> : stepNum}
            </div>
            <span className={`mt-2 text-xs font-medium ${isCurrent || isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <Helmet><title>Checkout | HUB Commerce</title></Helmet>

            {/* Cabeçalho Minimalista do Checkout (Sem Menu para focar na compra) */}
            <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black text-blue-600">HUB<span className="text-gray-900">Commerce</span></Link>
                    <div className="flex items-center text-sm text-gray-500">
                        <LockIcon /> Compra 100% Segura
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
                
                {/* LADO ESQUERDO: Formulários do Checkout */}
                <div className="w-full lg:w-3/5">
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Barra de Progresso */}
                    <div className="relative flex justify-between mb-10 px-4">
                        <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 -z-0">
                            <div 
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                            ></div>
                        </div>
                        <StepIndicator stepNum={1} label="Identificação" isCurrent={currentStep === 1} isCompleted={currentStep > 1} />
                        <StepIndicator stepNum={2} label="Entrega" isCurrent={currentStep === 2} isCompleted={currentStep > 2} />
                        <StepIndicator stepNum={3} label="Pagamento" isCurrent={currentStep === 3} isCompleted={currentStep > 3} />
                    </div>

                    {/* CONTEÚDO DOS PASSOS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <AnimatePresence mode="wait">
                            
                            {/* PASSO 1: IDENTIFICAÇÃO */}
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Pessoais</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                            <input type="email" value={formData.cliente.email} onChange={e => handleChange('cliente', 'email', e.target.value)} placeholder="voce@exemplo.com" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                            <input type="text" value={formData.cliente.nome} onChange={e => handleChange('cliente', 'nome', e.target.value)} placeholder="Seu nome" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                                            <input type="text" value={formData.cliente.cpf} onChange={e => handleChange('cliente', 'cpf', e.target.value)} placeholder="000.000.000-00" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                                            <input type="tel" value={formData.cliente.telefone} onChange={e => handleChange('cliente', 'telefone', e.target.value)} placeholder="(11) 90000-0000" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow" />
                                        </div>
                                    </div>
                                    <button onClick={() => handleNextStep(2)} className="w-full mt-8 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors">
                                        Continuar para Entrega
                                    </button>
                                </motion.div>
                            )}

                            {/* PASSO 2: ENTREGA */}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-800">Endereço de Entrega</h2>
                                        <button onClick={() => setCurrentStep(1)} className="text-sm text-blue-600 hover:underline">Voltar</button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="w-1/3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                                                <input type="text" value={formData.endereco.cep} onChange={e => handleChange('endereco', 'cep', e.target.value)} placeholder="00000-000" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow" />
                                            </div>
                                            <div className="w-2/3 flex items-end pb-1">
                                                <a href="#" className="text-xs text-blue-600 hover:underline">Não sei o meu CEP</a>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Logradouro</label>
                                                <input type="text" value={formData.endereco.rua} onChange={e => handleChange('endereco', 'rua', e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow bg-gray-50" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                                <input type="text" value={formData.endereco.numero} onChange={e => handleChange('endereco', 'numero', e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                            <input type="text" value={formData.endereco.complemento} onChange={e => handleChange('endereco', 'complemento', e.target.value)} placeholder="Apto, Bloco, etc (Opcional)" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none transition-shadow" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro / Freguesia</label>
                                                <input type="text" value={formData.endereco.bairro} onChange={e => handleChange('endereco', 'bairro', e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 bg-gray-50 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade - UF</label>
                                                <div className="flex gap-2">
                                                    <input type="text" value={formData.endereco.cidade} onChange={e => handleChange('endereco', 'cidade', e.target.value)} className="w-2/3 border border-gray-300 rounded-lg py-2.5 px-3 bg-gray-50 outline-none" placeholder="Cidade" />
                                                    <input type="text" value={formData.endereco.uf} onChange={e => handleChange('endereco', 'uf', e.target.value)} className="w-1/3 border border-gray-300 rounded-lg py-2.5 px-3 bg-gray-50 outline-none" placeholder="UF" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleNextStep(3)} className="w-full mt-8 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors">
                                        Ir para Pagamento
                                    </button>
                                </motion.div>
                            )}

                            {/* PASSO 3: PAGAMENTO (Estilo Gateway Transparente) */}
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-800">Pagamento Seguro</h2>
                                        <button onClick={() => setCurrentStep(2)} className="text-sm text-blue-600 hover:underline">Voltar</button>
                                    </div>
                                    
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                                        <h3 className="font-bold text-amber-900">Pagamento temporariamente indisponivel</h3>
                                        <p className="mt-2 text-sm leading-6 text-amber-800">
                                            A captura de cartao foi desativada ate que Stripe, Mercado Pago ou Pagar.me
                                            estejam homologados com tokenizacao segura. A HUB Commerce nao coleta PAN,
                                            validade ou CVV diretamente.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        disabled
                                        className="w-full mt-8 bg-gray-300 text-gray-600 font-bold py-4 rounded-xl cursor-not-allowed"
                                    >
                                        Checkout aguardando gateway seguro
                                    </button>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* LADO DIREITO: Resumo do Pedido (Fixo/Sticky) */}
                <div className="w-full lg:w-2/5">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-4">Resumo do Pedido</h3>
                        
                        {/* Itens */}
                        <div className="space-y-4 mb-6">
                            {itensCarrinho.map(item => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 rounded-md bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 relative">
                                        <img src={item.img} alt={item.nome} className="w-full h-full object-cover mix-blend-multiply" />
                                        <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{item.qtd}</span>
                                    </div>
                                    <div className="flex-grow flex flex-col justify-center">
                                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.nome}</h4>
                                        <span className="text-sm text-gray-500 font-medium">Valor confirmado no checkout</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totais */}
                        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Itens</span>
                                <span className="font-medium text-gray-800">{itensCarrinho.length}</span>
                            </div>
                            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-amber-800">
                                {hasItems
                                    ? 'Frete, descontos e total serão confirmados pelo servidor após a cotação.'
                                    : 'Seu carrinho está vazio.'}
                            </div>
                        </div>

                        {/* Aviso de Segurança */}
                        <div className="mt-6 bg-green-50 rounded-lg p-3 flex items-start gap-2 border border-green-100">
                            <LockIcon />
                            <p className="text-xs text-green-700 leading-tight">
                                Os seus dados estão protegidos. Utilizamos encriptação de ponta a ponta para garantir a segurança da sua transação.
                            </p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default CheckoutPage;