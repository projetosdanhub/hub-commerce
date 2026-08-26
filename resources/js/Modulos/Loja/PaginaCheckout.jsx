import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// Ícones
const CheckIcon = () => <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const LockIcon = () => <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>;
const CreditCardIcon = () => <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;

const CheckoutPage = () => {
    const navigate = useNavigate();

    // Gestão do Estado dos Passos do Checkout
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Dados Fictícios do Carrinho (No mundo real, pegaria do Contexto ou LocalStorage)
    const itensCarrinho = [
        { id: 1, nome: 'Tênis Nike Air Max', preco: 254.91, qtd: 1, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' },
    ];
    
    const subtotal = itensCarrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
    const valorFrete = 15.90;
    const total = subtotal + valorFrete;

    // Estado do Formulário
    const [formData, setFormData] = useState({
        cliente: { email: '', nome: '', cpf: '', telefone: '' },
        endereco: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
        pagamento: { metodo: 'credit_card', parcelas: 1, numeroCartao: '', nomeCartao: '', validadeCartao: '', cvvCartao: '' }
    });

    useEffect(() => {
        // Dispara evento do Pixel: InitiateCheckout
        window.dispatchEvent(new CustomEvent('tracker:event', {
            detail: {
                event: 'InitiateCheckout',
                data: {
                    value: total,
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
                    value: total,
                    payment_type: formData.pagamento.metodo,
                    items: itensCarrinho.map(item => ({ item_id: item.id, item_name: item.nome, price: item.preco, quantity: item.qtd }))
                }
            };
            window.dispatchEvent(new CustomEvent('tracker:event', { detail: eventPayload }));
        }
        setCurrentStep(nextStep);
    };

    const handleProcessCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/storefront/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    cliente: formData.cliente,
                    endereco: formData.endereco,
                    pagamento: formData.pagamento,
                    items: itensCarrinho.map(item => ({
                        id: item.id,
                        quantity: item.qtd
                    }))
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao processar o checkout.');
            }

            // Dispara evento do Pixel: Purchase
            window.dispatchEvent(new CustomEvent('tracker:event', {
                detail: {
                    event: 'Purchase',
                    data: {
                        value: total,
                        currency: 'BRL',
                        content_ids: itensCarrinho.map(i => i.id),
                        content_type: 'product',
                        transaction_id: result.data.order_id
                    }
                }
            }));

            alert('Pedido #'+result.data.order_id+' realizado com sucesso!');
            navigate('/'); // Redirecionar para página de obrigado

        } catch (err) {
            console.error('Erro no checkout:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                                    
                                    {/* Opções de Pagamento (Abas) */}
                                    <div className="flex gap-4 mb-8">
                                        <button onClick={() => handleChange('pagamento', 'metodo', 'credit_card')} className={`flex-1 py-3 border-2 font-bold rounded-lg flex items-center justify-center gap-2 ${formData.pagamento.metodo === 'credit_card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            <CreditCardIcon /> Cartão
                                        </button>
                                        <button onClick={() => handleChange('pagamento', 'metodo', 'pix')} className={`flex-1 py-3 border-2 font-medium rounded-lg ${formData.pagamento.metodo === 'pix' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            Pix
                                        </button>
                                        <button onClick={() => handleChange('pagamento', 'metodo', 'boleto')} className={`flex-1 py-3 border-2 font-medium rounded-lg ${formData.pagamento.metodo === 'boleto' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            Boleto
                                        </button>
                                    </div>

                                    {/* Formulário do Cartão */}
                                    {formData.pagamento.metodo === 'credit_card' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 animate-fade-in">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                                                <input type="text" value={formData.pagamento.numeroCartao} onChange={e => handleChange('pagamento', 'numeroCartao', e.target.value)} placeholder="0000 0000 0000 0000" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Impresso no Cartão</label>
                                                <input type="text" value={formData.pagamento.nomeCartao} onChange={e => handleChange('pagamento', 'nomeCartao', e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                                                <input type="text" value={formData.pagamento.validadeCartao} onChange={e => handleChange('pagamento', 'validadeCartao', e.target.value)} placeholder="MM/AA" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Código (CVV)</label>
                                                <input type="password" value={formData.pagamento.cvvCartao} onChange={e => handleChange('pagamento', 'cvvCartao', e.target.value)} placeholder="123" maxLength="4" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div className="sm:col-span-2 mt-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Opções de Parcelamento</label>
                                                <select value={formData.pagamento.parcelas} onChange={e => handleChange('pagamento', 'parcelas', e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none bg-white">
                                                    <option value="1">1x de R$ {total.toFixed(2)} sem juros</option>
                                                    <option value="2">2x de R$ {(total/2).toFixed(2)} sem juros</option>
                                                    <option value="3">3x de R$ {(total/3).toFixed(2)} sem juros</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Opção Pix */}
                                    {formData.pagamento.metodo === 'pix' && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center animate-fade-in">
                                            <svg className="w-12 h-12 text-emerald-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                            <h4 className="font-bold text-gray-800 text-lg mb-2">Desconto de 5% no Pix!</h4>
                                            <p className="text-gray-600 text-sm">O código QR será gerado na próxima tela após confirmar o pedido.</p>
                                        </div>
                                    )}

                                    {/* Opção Boleto */}
                                    {formData.pagamento.metodo === 'boleto' && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center animate-fade-in">
                                            <svg className="w-12 h-12 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            <h4 className="font-bold text-gray-800 text-lg mb-2">Boleto Bancário</h4>
                                            <p className="text-gray-600 text-sm">Aprovação em até 2 dias úteis. O boleto será exibido após a conclusão do pedido.</p>
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleProcessCheckout} 
                                        disabled={loading}
                                        className={`w-full mt-8 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Processando...
                                            </>
                                        ) : (
                                            <>
                                                <LockIcon /> Pagar R$ {total.toFixed(2)}
                                            </>
                                        )}
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
                                        <span className="text-sm text-gray-500 font-medium">R$ {item.preco.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totais */}
                        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-800">R$ {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete (Correios PAC)</span>
                                <span className="font-medium text-gray-800">R$ {valorFrete.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                <span>Total a Pagar</span>
                                <span className="text-blue-600">R$ {total.toFixed(2)}</span>
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