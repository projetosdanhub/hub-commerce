// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/ProductCardHorizontal.jsx
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- ÍCONES SVG ---
const ShoppingCartIcon = () => (
    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>
);
const StarIcon = ({ preenchida }) => (
    <svg className={`w-3.5 h-3.5 ${preenchida ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
);
const TruckIcon = () => (
    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
    </svg>
);
// Spinner para feedbacks de carregamento (UX)
const SpinnerIcon = () => (
    <svg className="w-4 h-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ProductCardHorizontal = ({ abrirModal, produtoId = 1 }) => {
    const navigate = useNavigate();

    // --- ESTADOS DE LOADING PARA EXPERIÊNCIA DO UTILIZADOR (UX) ---
    const [isNavigating, setIsNavigating] = useState(false);
    const [isOpeningCart, setIsOpeningCart] = useState(false);

    // 1. CONFIGURAÇÕES DEFINIDAS PELO LOJISTA (Simulação do HQ Admin)
    const configLojista = {
        exibirDescricao: true, 
        freteGratis: true,
        formatoBotoes: 'rounded-xl',
        cores: { hoverVerde: 'bg-emerald-500' }, // Lojista pode personalizar esta cor
        badgesExtras: ["Pronta Entrega", "Em Alta"] // Opcional, aparece abaixo do preço
    };

    // 2. DADOS DO PRODUTO (Dinâmicos)
    const produto = {
        id: produtoId,
        sku: `SKU-${produtoId}HQ`,
        nome: "Auscultadores Bluetooth Noise Cancelling Premium",
        precoAntigo: 450.00,
        precoAtual: 349.99,
        descricaoCurta: "Cancelamento de ruído ativo topo de gama, até 30h de bateria, conforto inigualável.",
        imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
        avaliacoes: { total: 412, media: 4.9 },
        ePersonalizavel: true
    };

    let descontoPercentual = 0;
    if (produto.precoAntigo > produto.precoAtual) {
        descontoPercentual = Math.round(((produto.precoAntigo - produto.precoAtual) / produto.precoAntigo) * 100);
    }

    // --- TRACKING & HANDLERS COM DELAYS ---
    const handleVerDetalhes = (e) => {
        if(e) { e.preventDefault(); e.stopPropagation(); }
        setIsNavigating(true);

        // GA4 & PIXEL: Disparar evento de ViewItem
        // if (window.gtag) gtag('event', 'view_item', { items: [{ item_id: produto.id, item_name: produto.nome, price: produto.precoAtual }] });
        // if (window.fbq) fbq('track', 'ViewContent', { content_ids: [produto.id], content_type: 'product', value: produto.precoAtual, currency: 'BRL' });

        // Atraso de 0.7s sugerido para processar a animação
        setTimeout(() => {
            navigate(`/produto/${produto.id}`);
            setIsNavigating(false); // Reseta caso o user faça "Voltar" no browser
        }, 700);
    };

    const handleAddToCart = (e) => {
        if(e) { e.preventDefault(); e.stopPropagation(); }
        setIsOpeningCart(true);

        // Atraso de 0.5s para não abrir instantaneamente e dar tempo ao DOM de preparar
        setTimeout(() => {
            if (typeof abrirModal === 'function') {
                abrirModal(produto.id);
            } else {
                console.warn("Função abrirModal não fornecida ao ProductCardHorizontal.");
            }
            setIsOpeningCart(false);
        }, 500);
    };

    return (
        <article 
            // Utilizamos 'group/card' para garantir que os hovers (como o ícone do carrinho) 
            // reajam APENAS a este cartão específico.
            className="w-full min-w-[85vw] lg:min-w-0 min-h-[150px] sm:min-h-[170px] bg-white rounded-[16px] border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300 relative flex overflow-hidden group/card select-none"
            aria-label={`Visualizar detalhes do produto: ${produto.nome}`}
        >
            {/* ZONA DA IMAGEM (ESQUERDA) */}
            <div className="relative w-[130px] sm:w-[190px] bg-gray-50 overflow-hidden flex-shrink-0 pointer-events-none">
                <img 
                    src={produto.imagem} 
                    alt={produto.nome} 
                    loading="lazy"
                    draggable="false"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-transform duration-1000 ease-out group-hover/card:scale-[1.04]" 
                />

                {produto.ePersonalizavel && (
                    <div className="absolute top-2 left-2 bg-[#111827]/80 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm z-10 tracking-wider uppercase border border-white/20">
                        Personalizável
                    </div>
                )}

                {/* BOTÃO CARRINHO (Aparece APENAS no hover deste card, canto inferior direito da imagem) */}
                <div className="absolute bottom-2 right-2 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/card:translate-y-0 z-20">
                    <button 
                        onClick={handleAddToCart} 
                        disabled={isOpeningCart}
                        className="relative w-10 h-10 flex items-center justify-center bg-white backdrop-blur-md rounded-full shadow-md pointer-events-auto transition-transform hover:scale-110 cursor-pointer overflow-hidden group/cartbtn"
                        title="Adicionar ao Carrinho"
                        aria-label="Adicionar ao Carrinho"
                    >
                        <motion.div 
                            className="absolute inset-0 rounded-full border-2 border-transparent group-hover/cartbtn:border-emerald-400 opacity-0 group-hover/cartbtn:opacity-100 transition-opacity"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
                        />
                        <div className="z-10">
                            {isOpeningCart ? <SpinnerIcon /> : <ShoppingCartIcon />}
                        </div>
                    </button>
                </div>
            </div>

            {/* ZONA DE INFORMAÇÃO E AÇÕES (DIREITA) */}
            <div className="p-3 sm:p-4 flex flex-col flex-grow min-w-0 justify-between pointer-events-none">
                
                <div className="mb-2">
                    <h3 className="text-gray-900 font-medium text-[14px] sm:text-[15px] line-clamp-2 leading-snug mb-1.5">
                        {produto.nome}
                    </h3>

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        {produto.avaliacoes.total > 0 && (
                            <div className="flex items-center space-x-1.5">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} preenchida={i <= Math.round(produto.avaliacoes.media)} />)}
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">({produto.avaliacoes.total})</span>
                            </div>
                        )}
                        
                        {configLojista.freteGratis && (
                            <div className="flex items-center gap-1 text-emerald-600 font-medium text-[10px] sm:text-[11px]">
                                <TruckIcon />
                                <span>Frete grátis</span>
                            </div>
                        )}
                    </div>

                    {configLojista.exibirDescricao && (
                        <p className="text-gray-500 text-[11px] sm:text-[12px] line-clamp-1 sm:line-clamp-2 leading-relaxed hidden sm:block">
                            {produto.descricaoCurta}
                        </p>
                    )}
                </div>

                <div className="flex flex-row justify-between items-end mt-auto gap-2 pointer-events-auto">
                    
                    {/* Bloco de Preços e Badges Extras */}
                    <div className="flex flex-col min-w-0 pointer-events-none">
                        {produto.precoAntigo > produto.precoAtual && (
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className="text-gray-400 text-[11px] sm:text-[12px] line-through font-medium truncate">
                                    R$ {produto.precoAntigo.toFixed(2)}
                                </span>
                                {descontoPercentual > 0 && (
                                    <span className="text-orange-500 text-[10px] sm:text-[11px] font-semibold tracking-tight whitespace-nowrap">
                                        {descontoPercentual}% OFF
                                    </span>
                                )}
                            </div>
                        )}
                        
                        <span className="text-gray-900 font-bold text-[18px] sm:text-[22px] leading-none tracking-tight truncate">
                            R$ {produto.precoAtual.toFixed(2)}
                        </span>

                        {/* Badges Adicionais Injetados pelo Lojista */}
                        {configLojista.badgesExtras && configLojista.badgesExtras.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {configLojista.badgesExtras.map((badge, idx) => (
                                    <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider whitespace-nowrap">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botão Ver Detalhes Isolado (Único sítio que navega) */}
                    <button 
                        onClick={handleVerDetalhes}
                        disabled={isNavigating}
                        className={`relative overflow-hidden hidden sm:flex flex-shrink-0 bg-[#F8F9FA] border border-gray-200 text-gray-700 font-semibold py-1.5 px-4 text-[12px] hover:text-white transition-colors items-center justify-center cursor-pointer shadow-sm group/btn ${configLojista.formatoBotoes}`}
                    >
                        {/* Animação Verde Suave (origin-bottom) */}
                        <div className={`absolute inset-0 ${configLojista.cores.hoverVerde} transform scale-y-0 origin-bottom group-hover/btn:scale-y-100 transition-transform duration-300 ease-out z-0`}></div>
                        
                        <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                            {isNavigating ? <><SpinnerIcon /> A carregar</> : "Ver Detalhes"}
                        </span>
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCardHorizontal;