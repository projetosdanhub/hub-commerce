// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/SideFavorites.jsx
// ARQUITETURA: Presentation Component com Microinterações Premium
// ============================================================================

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- ÍCONES SVG ---
const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

const HeartIcon = () => (
    <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);

const ShoppingCartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
);

const TruckIcon = () => (
    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
);


const SideFavorites = ({ isOpen, onClose, favoritos = [], onRemoverFavorito, onOpenQuickView }) => {
    const navigate = useNavigate();

    // Trava do Scroll da página ao abrir a gaveta
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <aside className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog" aria-label="Seus Favoritos">
                    
                    {/* Fundo Desfocado com Fade */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Gaveta Lateral (Deslizamento Suave 'easeInOut') */}
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
                        className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden"
                    >
                        {/* --- HEADER --- */}
                        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <HeartIcon /> Favoritos 
                                <span className="bg-red-50 text-red-600 text-xs py-0.5 px-2.5 rounded-full font-bold">{favoritos.length}</span>
                            </h2>
                            <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-200 transition-colors" aria-label="Fechar">
                                <CloseIcon />
                            </button>
                        </header>

                        {/* --- LISTA DE FAVORITOS --- */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-white">
                            {favoritos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4"><HeartIcon /></div>
                                    <p className="text-lg font-medium text-gray-600 mb-1">A sua lista está vazia</p>
                                    <p className="text-xs text-gray-400 text-center max-w-xs">Explore os produtos e clique no coração para os guardar aqui.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    {favoritos.map((item) => {
                                        // Variáveis de suporte caso venham do mock antigo
                                        const precoBase = item.precoAtual || item.preco || 0;
                                        const temDesconto = item.precoAntigo && item.precoAntigo > precoBase;
                                        const descontoPercentual = temDesconto ? Math.round(((item.precoAntigo - precoBase) / item.precoAntigo) * 100) : 0;
                                        const emEstoque = item.emEstoque !== false; // Padrão é ter estoque

                                        return (
                                            <article key={item.id} className="bg-white rounded-[20px] p-4 flex flex-col relative group border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                                                
                                                {/* Botão Remover (Lixeira) */}
                                                <button onClick={() => onRemoverFavorito(item.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10" title="Remover dos favoritos">
                                                    <TrashIcon />
                                                </button>

                                                <div className="flex gap-4 pr-6">
                                                    {/* Imagem e Badge Personalizável */}
                                                    <div className="relative w-[90px] h-[90px] bg-gray-50 rounded-[14px] overflow-hidden shadow-sm flex-shrink-0 border border-gray-100">
                                                        <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover mix-blend-multiply" />
                                                        {item.ePersonalizavel && (
                                                            <div className="absolute bottom-1 left-1 bg-[#111827]/80 backdrop-blur-md text-white text-[7px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase">
                                                                Personalizável
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Detalhes, Preços e Badges de Info */}
                                                    <div className="flex flex-col justify-center min-w-0">
                                                        <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{item.nome}</h3>
                                                        
                                                        {/* Badges de Estoque */}
                                                        <div className="mb-1.5">
                                                            {emEstoque ? (
                                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wide">Em Estoque</span>
                                                            ) : (
                                                                <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wide">Esgotado</span>
                                                            )}
                                                        </div>

                                                        {/* Bloco de Preços */}
                                                        <div className="flex flex-col">
                                                            {temDesconto && (
                                                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                                                    <span className="text-gray-400 text-[10px] line-through font-medium">R$ {item.precoAntigo.toFixed(2)}</span>
                                                                    <span className="text-orange-500 text-[9px] font-semibold tracking-tight whitespace-nowrap">{descontoPercentual}% OFF</span>
                                                                </div>
                                                            )}
                                                            <span className="font-bold text-gray-900 text-[16px] leading-none mb-1">R$ {precoBase.toFixed(2)}</span>
                                                        </div>

                                                        {/* Frete Grátis */}
                                                        {item.freteGratis && (
                                                            <div className="flex items-center gap-1 text-emerald-600 font-medium text-[9px]">
                                                                <TruckIcon /> <span>Frete grátis c/ cupom</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* --- BOTÕES DE AÇÃO --- */}
                                                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                                                    
                                                    {/* ESQUERDA: Botão Ver Detalhes (Animação origin-bottom verde) */}
                                                    <button 
                                                        onClick={() => { onClose(); navigate(`/produto/${item.id}`); }}
                                                        className="relative overflow-hidden flex-1 bg-[#F8F9FA] border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl flex items-center justify-center group/btn shadow-sm"
                                                    >
                                                        <div className="absolute inset-0 bg-emerald-500 transform scale-y-0 origin-bottom group-hover/btn:scale-y-100 transition-transform duration-300 ease-out z-0"></div>
                                                        <span className="relative z-10 flex items-center gap-1.5 text-[11px] group-hover/btn:text-white transition-colors">
                                                            <EyeIcon /> Ver Detalhes
                                                        </span>
                                                    </button>

                                                    {/* DIREITA: Ícone Carrinho (Animação de desenho Circular: Vermelho -> Verde) */}
                                                    <motion.button 
                                                        initial="rest"
                                                        whileHover="hover"
                                                        onClick={() => { 
                                                            onClose(); 
                                                            // Abre o QuickView em vez de adicionar diretamente
                                                            if(onOpenQuickView) onOpenQuickView(item.id); 
                                                        }}
                                                        className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm transition-colors group/cartbtn"
                                                        title="Abrir Opções (QuickView)"
                                                        aria-label="Abrir Opções de Compra"
                                                    >
                                                        {/* SVG para criar o efeito de desenho do círculo */}
                                                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                                                            <motion.circle
                                                                cx="20" cy="20" r="19"
                                                                fill="none"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                variants={{
                                                                    // Começa invisível ou neutro
                                                                    rest: { pathLength: 0, stroke: "transparent" },
                                                                    // Ao passar o rato: Desenha a vermelho e no fim muda para verde
                                                                    hover: { 
                                                                        pathLength: 1, 
                                                                        stroke: ["#ef4444", "#ef4444", "#10b981"], 
                                                                        transition: { duration: 0.8, ease: "easeOut" } 
                                                                    }
                                                                }}
                                                            />
                                                        </svg>
                                                        <div className="relative z-10">
                                                            <ShoppingCartIcon />
                                                        </div>
                                                    </motion.button>
                                                    
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* --- FOOTER --- */}
                        <footer className="bg-white border-t border-gray-100 p-6 shadow-[0_-15px_30px_rgba(0,0,0,0.04)] shrink-0">
                            <button 
                                onClick={onClose} 
                                className="w-full h-[48px] bg-white border border-gray-200 text-gray-700 rounded-[14px] font-semibold text-[14px] hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Continuar a Navegar
                            </button>
                        </footer>

                    </motion.div>
                </aside>
            )}
        </AnimatePresence>
    );
};

export default SideFavorites;