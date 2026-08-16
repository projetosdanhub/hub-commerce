// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/ProductCard.jsx
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
    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
    </svg>
);

// Spinner animado para os estados de carregamento
const SpinnerIcon = () => (
    <svg className="w-4 h-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ProductCard = ({ abrirModal, produtoId = 1 }) => {
    const navigate = useNavigate();

    // Estados de Loading para melhoria da experiência do utilizador (UX)
    const [isNavigating, setIsNavigating] = useState(false);
    const [isOpeningCart, setIsOpeningCart] = useState(false);

    // 1. CONFIGURAÇÕES DEFINIDAS PELO LOJISTA (hq Admin / Configurações da Loja)
    const configLojista = {
        exibirTitulo: true,
        aspetoImagem: 'aspect-square',
        freteGratis: true,
        estiloBotao: 'rounded-xl',
        cores: {
            hoverVerde: 'bg-emerald-500', // Cor verde suave configurável
        }
    };

    // 2. DADOS DO PRODUTO (Mock Dinâmico)
    const produto = {
        id: produtoId,
        nome: "Caneca Mágica Personalizável Premium",
        precoAntigo: 89.90,
        precoAtual: 65.90,
        imagem: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",
        avaliacoes: { total: 128, media: 4.8 },
        ePersonalizavel: true,
        badgesExtras: ["Pronta Entrega", "Novidade"] // Badges extras configuradas pelo lojista
    };

    let descontoPercentual = 0;
    if (produto.precoAntigo > produto.precoAtual) {
        descontoPercentual = Math.round(((produto.precoAntigo - produto.precoAtual) / produto.precoAntigo) * 100);
    }

    // --- TRACKING & HANDLERS ---
    const handleVerDetalhes = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setIsNavigating(true);

        // Ativação futura para Pixel / Google Analytics pelo Lojista
        // if (window.fbq) window.fbq('track', 'ViewContent', { content_ids: [produto.id], content_type: 'product', value: produto.precoAtual, currency: 'BRL' });
        // if (window.gtag) window.gtag('event', 'select_item', { items: [{ item_id: produto.id, item_name: produto.nome, price: produto.precoAtual }] });

        setTimeout(() => {
            navigate(`/produto/${produto.id}`);
            setIsNavigating(false);
        }, 700);
    };

    const handleAddToCart = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setIsOpeningCart(true);

        setTimeout(() => {
            if (typeof abrirModal === 'function') {
                abrirModal(produto.id);
            } else {
                console.warn("Função abrirModal não foi fornecida ao ProductCard.");
            }
            setIsOpeningCart(false);
        }, 500);
    };

    return (
        <article 
            className="w-[45vw] sm:w-[240px] bg-white rounded-[16px] border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-500 relative flex flex-col group/card overflow-hidden select-none"
            aria-label={`Produto: ${produto.nome}`}
        >
            <div className="flex flex-col flex-grow pointer-events-none">
                
                {/* --- ZONA DA IMAGEM --- */}
                <div className={`relative w-full ${configLojista.aspetoImagem} bg-gray-50 overflow-hidden`}>
                    <img 
                        src={produto.imagem} 
                        alt={produto.nome} 
                        loading="lazy"
                        draggable="false"
                        className="w-full h-full object-cover mix-blend-multiply transition-transform duration-1000 ease-out group-hover/card:scale-[1.03]" 
                    />

                    {/* Badge de Personalização */}
                    {produto.ePersonalizavel && (
                        <div className="absolute bottom-2 left-2 bg-[#111827]/80 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm z-10 tracking-wider uppercase border border-white/20">
                            Personalizável
                        </div>
                    )}

                    {/* BOTÃO DO CARRINHO (Surgimento exclusivo no hover deste cartão) */}
                    <div className="absolute bottom-2 right-2 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/card:translate-y-0 z-20">
                        <button 
                            onClick={handleAddToCart} 
                            disabled={isOpeningCart}
                            className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full shadow-md pointer-events-auto transition-transform hover:scale-110 cursor-pointer overflow-hidden group/cartbtn"
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

                {/* --- ZONA DE INFORMAÇÕES DO PRODUTO --- */}
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    
                    {/* Estrelas e Avaliações */}
                    {produto.avaliacoes.total > 0 && (
                        <div className="flex items-center space-x-1 mb-1.5 sm:mb-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <StarIcon key={i} preenchida={i <= Math.round(produto.avaliacoes.media)} />
                                ))}
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">
                                ({produto.avaliacoes.total})
                            </span>
                        </div>
                    )}

                    {/* Título do Produto */}
                    {configLojista.exibirTitulo && (
                        <h3 className="text-gray-900 font-medium text-[12px] sm:text-[14px] mb-2 line-clamp-2 leading-snug">
                            {produto.nome}
                        </h3>
                    )}

                    {/* Bloco de Preços, Frete e Badges */}
                    <div className="mt-auto flex flex-col">
                        {produto.precoAntigo > produto.precoAtual && (
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className="text-gray-400 text-[10px] sm:text-[12px] line-through font-medium">
                                    R$ {produto.precoAntigo.toFixed(2)}
                                </span>
                                {descontoPercentual > 0 && (
                                    <span className="text-orange-500 text-[9px] sm:text-[11px] font-semibold tracking-tight whitespace-nowrap">
                                        {descontoPercentual}% OFF
                                    </span>
                                )}
                            </div>
                        )}
                        
                        <p className="text-gray-900 font-bold text-[18px] sm:text-[22px] leading-none tracking-tight">
                            R$ {produto.precoAtual.toFixed(2)}
                        </p>

                        {/* Texto de Frete Grátis com Cupom */}
                        {configLojista.freteGratis && (
                            <p className="text-emerald-600 font-medium text-[9px] sm:text-[11px] mt-1.5 sm:mt-2 flex items-center gap-1 sm:gap-1.5">
                                <TruckIcon />
                                Frete grátis <span className="text-gray-500 font-normal hidden sm:inline">com cupom</span>
                            </p>
                        )}

                        {/* Badges Extras posicionadas ABAIXO do texto do Frete Grátis */}
                        {produto.badgesExtras && produto.badgesExtras.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {produto.badgesExtras.map((badge, idx) => (
                                    <span 
                                        key={idx} 
                                        className="bg-gray-50 border border-gray-100 text-gray-600 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider whitespace-nowrap"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- BOTÃO VER DETALHES --- */}
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex pointer-events-auto">
                <button 
                    onClick={handleVerDetalhes}
                    disabled={isNavigating}
                    className={`relative overflow-hidden flex-grow bg-[#F8F9FA] border border-gray-200 text-gray-700 font-semibold py-2 sm:py-2.5 text-[11px] sm:text-[12px] hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-sm group/btn ${configLojista.estiloBotao}`}
                >
                    {/* Animação Verde Suave de baixo para cima */}
                    <div className={`absolute inset-0 ${configLojista.cores.hoverVerde} transform scale-y-0 origin-bottom group-hover/btn:scale-y-100 transition-transform duration-300 ease-out z-0`}></div>
                    
                    <span className="relative z-10 flex items-center gap-2">
                        {isNavigating ? (
                            <>
                                <SpinnerIcon /> A carregar...
                            </>
                        ) : (
                            "Ver Detalhes"
                        )}
                    </span>
                </button>
            </div>
        </article>
    );
};

export default ProductCard;