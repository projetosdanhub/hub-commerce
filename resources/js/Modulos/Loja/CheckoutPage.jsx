import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Ícones
const CheckIcon = () => <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const LockIcon = () => <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>;
const CreditCardIcon = () => <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>;

const CheckoutPage = () => {
    // Gestão do Estado dos Passos do Checkout
    const [currentStep, setCurrentStep] = useState(1);
    
    // Dados Fictícios do Carrinho
    const itensCarrinho = [
        { id: 1, nome: 'Ténis Nike Air Max', preco: 254.91, qtd: 1, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' },
    ];
    const subtotal = 254.91;
    const valorFrete = 15.90;
    const total = subtotal + valorFrete;

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
                                            <input type="email" placeholder="seu@email.com" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CPF / NIF</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / Telemóvel</label>
                                            <input type="tel" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                        </div>
                                    </div>
                                    <button onClick={() => setCurrentStep(2)} className="w-full mt-8 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors">
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
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CEP / Código Postal</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div className="w-2/3 flex items-end pb-1">
                                                <a href="#" className="text-xs text-blue-600 hover:underline">Não sei o meu CEP</a>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Morada</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 bg-gray-50 outline-none" />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento (Opcional)</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro / Freguesia</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 bg-gray-50 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade - Estado</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 bg-gray-50 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setCurrentStep(3)} className="w-full mt-8 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition-colors">
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
                                    <div className="flex gap-2 mb-6">
                                        <button className="flex-1 py-3 border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold rounded-lg flex items-center justify-center gap-2">
                                            <CreditCardIcon /> Cartão
                                        </button>
                                        <button className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50">
                                            PIX / MBWay
                                        </button>
                                        <button className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50">
                                            Boleto
                                        </button>
                                    </div>

                                    {/* Formulário do Cartão */}
                                    <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Impresso no Cartão</label>
                                            <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Validade (MM/AA)</label>
                                                <input type="text" placeholder="MM/AA" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                                <input type="password" placeholder="123" maxLength="4" className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Opções de Parcelamento</label>
                                            <select className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-200 outline-none bg-white">
                                                <option>1x de R$ {total.toFixed(2)} sem juros</option>
                                                <option>2x de R$ {(total/2).toFixed(2)} sem juros</option>
                                                <option>3x de R$ {(total/3).toFixed(2)} sem juros</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button className="w-full mt-8 bg-green-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-lg">
                                        <LockIcon /> Pagar R$ {total.toFixed(2)}
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