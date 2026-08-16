// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/CartPage.jsx
// ARQUITETURA: Sem Header/Footer (Geridos globalmente) | Com Cupons Animados
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// --- ÍCONES SVG ---
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const UploadIcon = () => <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>;
const TicketIcon = () => <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>;
const TruckIcon = () => <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>;
const LockIcon = () => <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>;
const ShieldCheckIcon = () => <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>;
const RefreshIcon = () => <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>;

const CartPage = ({ cartItems = [], setCartItems = () => {} }) => {
    const navigate = useNavigate();

    // Mocks do Sistema
    const isLogado = true;
    const enderecosSalvos = [
        { id: 1, apelido: "Minha Casa", cep: "12345-678", rua: "Av. Principal" }
    ];

    // --- ESTADOS DO CARRINHO ---
    const [cep, setCep] = useState('');
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
    const [frete, setFrete] = useState({ valor: 0, prazo: '', calculado: false });
    const [isCalculandoFrete, setIsCalculandoFrete] = useState(false);

    const [cupomProduto, setCupomProduto] = useState('');
    const [descontoProduto, setDescontoProduto] = useState(0);

    const [cupomFrete, setCupomFrete] = useState('');
    const [isFreteGratis, setIsFreteGratis] = useState(false);

    // --- TRAVAS DE SEGURANÇA E VALIDAÇÃO ---
    const [tentouFinalizar, setTentouFinalizar] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => { 
        if (typeof window !== 'undefined') window.scrollTo(0, 0); 
    }, []);

    // Calcula preços protegendo contra F12
    const obterPrecoSeguro = (item) => Number(item.precoAtual || item.precoVenda || item.preco) || 0;
    const subtotalSeguro = cartItems.reduce((acc, item) => acc + (obterPrecoSeguro(item) * (Number(item.quantidade) || 1)), 0);

    // Verifica se o item personalizável tem os dados obrigatórios
    const isItemIncompleto = (item) => {
        if (!item.ePersonalizavel) return false;
        const semImagem = !item.imagemPersonalizada;
        const semTexto = !item.textoPersonalizado || item.textoPersonalizado.trim() === '';
        return semImagem && semTexto; 
    };

    // --- HANDLERS ---
    const atualizarQuantidade = (id, delta) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantidade: Math.max(1, (Number(item.quantidade) || 1) + delta) } : item));
    };

    const removerItem = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

    const handleTextoPersonalizado = (id, texto) => {
        const textoLimpo = texto.replace(/</g, "&lt;").replace(/>/g, "&gt;").substring(0, 50);
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, textoPersonalizado: textoLimpo } : item));
    };

    const handleUploadImagem = (id, event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { alert("A imagem não pode ultrapassar 5MB."); return; }
            const imageUrl = URL.createObjectURL(file);
            setCartItems(prev => prev.map(item => item.id === id ? { ...item, imagemPersonalizada: imageUrl, nomeArquivoImagem: file.name } : item));
        }
    };

    const simularFrete = () => {
        setIsCalculandoFrete(true);
        setTimeout(() => {
            setFrete({ valor: 18.90, prazo: '3 a 5 dias úteis', calculado: true });
            setIsCalculandoFrete(false);
            if (tentouFinalizar) setTentouFinalizar(false);
        }, 1000);
    };

    // --- APLICADORES DE CUPONS ---
    const aplicarCupomProduto = () => {
        if (cupomProduto.toUpperCase() === 'HUB10') setDescontoProduto(10);
        else { alert("Cupom inválido ou expirado."); setDescontoProduto(0); }
    };

    const aplicarCupomFrete = () => {
        if (cupomFrete.toUpperCase() === 'FRETEGRATIS') {
            if (!frete.calculado) alert("Por favor, calcule o frete antes de aplicar o cupom.");
            else setIsFreteGratis(true);
        } else {
            alert("Cupom de frete inválido.");
            setIsFreteGratis(false);
        }
    };

    const valorDescontoProduto = subtotalSeguro * (descontoProduto / 100);
    const valorFreteFinal = isFreteGratis ? 0 : frete.valor;
    const totalFinal = Math.max(0, subtotalSeguro - valorDescontoProduto + valorFreteFinal);

    // --- CHECKOUT ---
    const handleCheckout = () => {
        setTentouFinalizar(true);
        
        if (!frete.calculado) { 
            window.scrollTo({ top: document.getElementById('frete-area').offsetTop - 100, behavior: 'smooth' }); 
            return; 
        }
        
        if (cartItems.some(item => isItemIncompleto(item))) { 
            alert("Atenção: Preencha as personalizações obrigatórias destacadas a vermelho."); 
            return; 
        }
        
        setIsCheckingOut(true);
        setTimeout(() => navigate('/checkout'), 1500); 
    };

    return (
        <div className="w-full selection:bg-blue-100">
            <Helmet>
                <title>Carrinho de Compras | HUB Commerce</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
                
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">O seu Carrinho</h1>
                    <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6"><TruckIcon className="w-10 h-10 text-gray-300" /></div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">O seu carrinho está vazio</h2>
                        <Link to="/" className="bg-[#111827] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 mt-6 shadow-md transition-all">Voltar à Loja</Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                        
                        {/* ========================================================= */}
                        {/* COLUNA ESQUERDA: LISTA DE PRODUTOS */}
                        {/* ========================================================= */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-6">
                            <AnimatePresence>
                                {cartItems.map((item) => {
                                    if (!item) return null;
                                    const temErroDePersonalizacao = tentouFinalizar && isItemIncompleto(item);
                                    const imgSegura = Array.isArray(item.imagens) ? item.imagens[0] : (item.imagem || "https://via.placeholder.com/150");

                                    return (
                                        <motion.article 
                                            key={item.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                            className={`bg-white rounded-[20px] p-5 shadow-sm border transition-all ${temErroDePersonalizacao ? 'border-red-300 shadow-red-100' : 'border-gray-100 hover:shadow-md'}`}
                                        >
                                            <div className="flex flex-col sm:flex-row gap-5">
                                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100"><img src={imgSegura} alt={item.nome || "Produto"} className="w-full h-full object-cover mix-blend-multiply" /></div>
                                                <div className="flex flex-col flex-grow justify-between min-w-0 pr-6">
                                                    <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-snug"><Link to={`/produto/${item.id}`}>{item.nome || "Produto"}</Link></h3>
                                                    <div className="flex flex-wrap items-end justify-between mt-4 gap-4">
                                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl h-10 px-1 w-28">
                                                            <button onClick={() => atualizarQuantidade(item.id, -1)} className="w-8 h-8 text-gray-500 hover:bg-white rounded-lg transition-colors">&minus;</button>
                                                            <span className="font-bold text-gray-900 text-xs w-6 text-center">{item.quantidade || 1}</span>
                                                            <button onClick={() => atualizarQuantidade(item.id, 1)} className="w-8 h-8 text-gray-500 hover:bg-white rounded-lg transition-colors">&#43;</button>
                                                        </div>
                                                        <span className="text-lg font-bold text-gray-900 leading-none">R$ {(obterPrecoSeguro(item) * (item.quantidade || 1)).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => removerItem(item.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><TrashIcon /></button>
                                            </div>

                                            {/* PERSONALIZAÇÃO DE PRODUTO */}
                                            {item.ePersonalizavel && (
                                                <div className="mt-5 pt-5 border-t border-gray-100">
                                                    <div className={`rounded-xl p-4 border transition-colors ${temErroDePersonalizacao ? 'bg-red-50/50 border-red-200' : 'bg-sky-50/50 border-sky-100'}`}>
                                                        <h4 className="text-[13px] font-bold text-gray-800 mb-1.5 flex items-center gap-2">Detalhes da Personalização</h4>
                                                        
                                                        {temErroDePersonalizacao && (
                                                            <span className="text-[11px] font-bold text-red-500 mb-4 block">* É obrigatório enviar a imagem OU preencher o texto para personalizarmos o seu produto.</span>
                                                        )}
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                                                            <div>
                                                                <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Logomarca / Imagem</label>
                                                                {!item.imagemPersonalizada ? (
                                                                    <label className={`flex items-center justify-center gap-2 w-full h-12 bg-white border border-dashed rounded-lg cursor-pointer transition-colors shadow-sm ${temErroDePersonalizacao ? 'border-red-300 hover:bg-red-50 text-red-500' : 'border-gray-300 hover:border-sky-400 hover:bg-sky-50'}`}>
                                                                        <UploadIcon /> <span className="text-[11px] font-medium">Anexar Ficheiro</span>
                                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImagem(item.id, e)} />
                                                                    </label>
                                                                ) : (
                                                                    <div className="flex items-center gap-3 bg-white h-12 px-3 rounded-lg border border-emerald-200 shadow-sm">
                                                                        <img src={item.imagemPersonalizada} alt="Preview" className="w-8 h-8 rounded object-cover" />
                                                                        <span className="text-[10px] text-gray-600 truncate flex-grow text-emerald-600 font-semibold">Anexado com Sucesso!</span>
                                                                        <button onClick={() => handleUploadImagem(item.id, { target: { files: [] }})} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Texto Gravado</label>
                                                                <input type="text" placeholder="Digite a frase..." maxLength={50} value={item.textoPersonalizado || ''} onChange={(e) => handleTextoPersonalizado(item.id, e.target.value)} className={`w-full h-12 bg-white border rounded-lg px-3 text-[13px] font-medium outline-none transition-all shadow-sm ${temErroDePersonalizacao && !item.imagemPersonalizada ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-200' : 'border-gray-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-100'}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.article>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* ========================================================= */}
                        {/* COLUNA DIREITA: RESUMO E CUPONS ANIMADOS */}
                        {/* ========================================================= */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 sticky top-28">
                                <h2 className="text-lg font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">Resumo da Encomenda</h2>
                                
                                <div className="space-y-3.5 mb-6">
                                    <div className="flex justify-between text-[14px]">
                                        <span className="text-gray-500 font-medium">Subtotal</span>
                                        <span className="text-gray-900 font-semibold">R$ {subtotalSeguro.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* 1. ANIMAÇÃO DE CUPOM DE PRODUTO */}
                                    <AnimatePresence>
                                        {descontoProduto > 0 && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-[14px] items-center text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg mt-2 overflow-hidden">
                                                <span className="font-bold flex items-center gap-1.5"><TicketIcon /> Desconto ({descontoProduto}%)</span>
                                                <span className="font-bold">- R$ {valorDescontoProduto.toFixed(2)}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* 2. ANIMAÇÃO DE FRETE GRÁTIS */}
                                    <div className="flex justify-between text-[14px] items-center mt-3">
                                        <span className="text-gray-500 font-medium">Envio (Melhor Envio)</span>
                                        {isFreteGratis ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 line-through text-xs">R$ {frete.valor.toFixed(2)}</span>
                                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">Grátis</motion.span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-900 font-semibold">{frete.calculado ? `R$ ${frete.valor.toFixed(2)}` : '---'}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-5 mb-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-800 font-bold">Total a Pagar</span>
                                        <span className="text-[32px] font-black text-gray-900 leading-none tracking-tight">R$ {totalFinal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button onClick={handleCheckout} disabled={isCheckingOut} className="relative w-full overflow-hidden bg-[#111827] text-white h-14 rounded-xl font-bold text-[15px] hover:bg-gray-800 transition-colors shadow-xl shadow-gray-900/20 mb-6 flex items-center justify-center">
                                    <motion.div initial={{ width: 0 }} animate={{ width: isCheckingOut ? '100%' : 0 }} transition={{ duration: 1.4, ease: "easeInOut" }} className="absolute left-0 top-0 bottom-0 bg-emerald-600 z-0" />
                                    <span className="relative z-10 flex items-center gap-2"><LockIcon /> {isCheckingOut ? 'Processando Segurança...' : 'Finalizar Compra Segura'}</span>
                                </button>

                                {/* Neurovendas / Trust Badges */}
                                <div className="bg-gray-50/80 rounded-xl p-4 mb-6 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3"><ShieldCheckIcon /><p className="text-[11px] text-gray-700 leading-tight"><strong>Ambiente 100% Seguro.</strong></p></div>
                                    <div className="flex items-center gap-3"><RefreshIcon /><p className="text-[11px] text-gray-700 leading-tight"><strong>Garantia de 7 Dias.</strong> Devolução facilitada.</p></div>
                                </div>

                                {/* ========================================================= */}
                                {/* FERRAMENTAS: CÁLCULO CEP E INPUTS DE CUPONS               */}
                                {/* ========================================================= */}
                                <div id="frete-area" className="space-y-5 pt-4 border-t border-gray-100">
                                    
                                    {/* BLOCO: Calcular Frete */}
                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5"><TruckIcon /> Calcular Entrega (Obrigatório)</label>
                                        
                                        {/* Dropdown Endereço Salvo (Se estiver Logado) */}
                                        {isLogado && enderecosSalvos.length > 0 && (
                                            <div className="mb-2">
                                                <select 
                                                    className="w-full bg-white border border-gray-200 text-gray-600 text-xs rounded-lg px-3 h-10 outline-none focus:border-sky-400 cursor-pointer"
                                                    onChange={(e) => {
                                                        const end = enderecosSalvos.find(x => x.id == e.target.value);
                                                        if(end) { setCep(end.cep); setEnderecoSelecionado(end); simularFrete(); }
                                                    }}
                                                >
                                                    <option value="">Escolher endereço salvo...</option>
                                                    {enderecosSalvos.map(end => <option key={end.id} value={end.id}>{end.apelido} ({end.rua})</option>)}
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Ou digite o CEP..." maxLength={9} value={cep} onChange={(e) => setCep(e.target.value)} className={`flex-grow bg-white border rounded-lg px-3 text-sm focus:ring-1 outline-none h-11 transition-all ${tentouFinalizar && !frete.calculado ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-sky-400 focus:ring-sky-100'}`} />
                                            <button onClick={simularFrete} disabled={isCalculandoFrete || cep.length < 8} className="px-4 bg-[#111827] text-white rounded-lg text-[12px] font-bold transition-all disabled:opacity-50">
                                                {isCalculandoFrete ? 'Aguarde...' : 'Calcular'}
                                            </button>
                                        </div>

                                        {tentouFinalizar && !frete.calculado && (
                                            <span className="text-[11px] font-bold text-red-500 mt-1 block">* O cálculo do frete é obrigatório para prosseguir.</span>
                                        )}
                                    </div>

                                    {/* BLOCO: Cupom de Desconto */}
                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5"><TicketIcon /> Cupom de Desconto</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Ex: HUB10" value={cupomProduto} onChange={(e) => setCupomProduto(e.target.value.toUpperCase())} className="flex-grow bg-white border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-sky-400 transition-all h-11 uppercase" />
                                            <button onClick={aplicarCupomProduto} className="px-4 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">Aplicar</button>
                                        </div>
                                    </div>

                                    {/* BLOCO: Cupom de Frete */}
                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5"><TicketIcon /> Cupom de Frete</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Ex: FRETEGRATIS" value={cupomFrete} onChange={(e) => setCupomFrete(e.target.value.toUpperCase())} className="flex-grow bg-white border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-sky-400 transition-all h-11 uppercase" />
                                            <button onClick={aplicarCupomFrete} className="px-4 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">Aplicar</button>
                                        </div>
                                        <span className="text-[9px] text-gray-400 mt-1 block italic">*Válido apenas para o custo de transporte.</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;