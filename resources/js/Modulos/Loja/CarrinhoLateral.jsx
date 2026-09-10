// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/SideCart.jsx
// ARQUITETURA: Global Sidebar (Blindado contra falhas de variáveis)
// ============================================================================

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- ÍCONES SVG ---
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const HeartIcon = ({ isSaved }) => <svg className={`w-5 h-5 transition-colors duration-300 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-400 group-hover/favbtn:text-red-500'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>;
const CheckCircleIcon = () => <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>;

const SideCart = ({ isOpen, onClose, cartItems = [], setCartItems, showNotification, ultimoAdicionado, isLogado }) => {
    const navigate = useNavigate();

    // Bloqueia e desbloqueia o Scroll da página
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // CÁLCULO SEGURO DO SUBTOTAL (Ignora variáveis indefinidas)
    const subtotal = cartItems.reduce((acc, item) => {
        const precoSeguro = item.precoAtual || item.precoVenda || item.preco || 0;
        return acc + (precoSeguro * item.quantidade);
    }, 0);

    // --- HANDLERS PROTEGIDOS ---
    const handleFavoritarItem = (e, id) => {
        e.preventDefault(); e.stopPropagation();
        if (!isLogado) {
            alert("Faça login para adicionar aos favoritos."); 
            return;
        }
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, isFavorito: !item.isFavorito } : item));
    };

    const atualizarQtd = (e, id, tipo) => {
        e.preventDefault(); e.stopPropagation();
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const novaQtd = tipo === 'add' ? item.quantidade + 1 : item.quantidade - 1;
                return { ...item, quantidade: Math.max(1, novaQtd) }; // Nunca deixa ser zero ou negativo
            }
            return item;
        }));
    };

    const removerItem = (e, id) => {
        e.preventDefault(); e.stopPropagation();
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleFinalizarCompra = () => {
        onClose();
        navigate('/carrinho'); 
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <aside className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog" aria-label="Carrinho de Compras Lateral">
                    
                    {/* Overlay Escuro com Desfoque */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Contentor Principal Deslizante */}
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.35 }}
                        className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden"
                    >
                        
                        {/* --- NOTIFICAÇÃO ANIMADA (Robusta) --- */}
                        <AnimatePresence>
                            {showNotification && ultimoAdicionado && (
                                <motion.div 
                                    initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
                                    transition={{ type: "spring", bounce: 0.4 }}
                                    className="absolute top-0 left-4 right-4 bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-emerald-100 rounded-2xl p-3 z-50 flex items-center gap-3"
                                >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-50 border border-gray-100">
                                        <img 
                                            src={Array.isArray(ultimoAdicionado.imagens) ? ultimoAdicionado.imagens[0] : ultimoAdicionado.imagem} 
                                            alt="Adicionado" 
                                            className="w-full h-full object-cover mix-blend-multiply" 
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center flex-grow min-w-0 pr-2">
                                        <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider mb-0.5">Adicionado com Sucesso</span>
                                        <span className="text-gray-800 font-semibold text-xs line-clamp-1">{ultimoAdicionado.nome}</span>
                                    </div>
                                    <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center mr-1">
                                        <svg className="absolute inset-0 w-full h-full text-emerald-500 -rotate-90" viewBox="0 0 50 50">
                                            <motion.circle cx="25" cy="25" r="22" fill="none" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
                                        </svg>
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }}>
                                            <CheckCircleIcon />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* --- HEADER DO CARRINHO --- */}
                        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100 shrink-0 relative z-40">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                Seu Carrinho 
                                <span className="bg-gray-100 text-gray-600 text-xs py-0.5 px-2.5 rounded-full">{cartItems.length}</span>
                            </h2>
                            <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors">
                                <CloseIcon />
                            </button>
                        </header>

                        {/* --- LISTA DE PRODUTOS --- */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-white">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    <p className="text-lg font-medium text-gray-500">O seu carrinho está vazio</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {cartItems.map((item) => {
                                        // Extração segura de dados independentemente do componente de onde veio!
                                        const precoItem = item.precoAtual || item.precoVenda || item.preco || 0;
                                        const imgItem = Array.isArray(item.imagens) ? item.imagens[0] : item.imagem;

                                        return (
                                            <article key={item.id} className="bg-gray-50 rounded-[20px] p-3 flex gap-4 relative group border border-transparent hover:border-gray-200 transition-colors">
                                                
                                                {/* Favoritar */}
                                                <button onClick={(e) => handleFavoritarItem(e, item.id)} className="absolute top-2 right-2 p-1.5 bg-white/60 backdrop-blur-sm rounded-full shadow-sm md:opacity-0 group-hover:opacity-100 transition-opacity z-10 group/favbtn" title="Adicionar aos Favoritos">
                                                    <HeartIcon isSaved={item.isFavorito} />
                                                </button>

                                                {/* Imagem */}
                                                <div className="w-[85px] h-[85px] bg-white rounded-[14px] overflow-hidden shadow-sm flex-shrink-0 border border-gray-100">
                                                    <img src={imgItem} alt={item.nome} className="w-full h-full object-cover mix-blend-multiply" />
                                                </div>

                                                {/* Informações */}
                                                <div className="flex flex-col justify-between w-full min-w-0 py-0.5">
                                                    <div className="pr-6">
                                                        <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug">{item.nome}</h3>
                                                        {item.variacaoSelecionada && Object.entries(item.variacaoSelecionada).map(([chave, valor]) => (
                                                            <span key={chave} className="text-[10px] text-gray-500 mt-1 block">{chave}: {valor}</span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-end justify-between mt-3">
                                                        <span className="font-bold text-gray-900 text-[16px]">R$ {precoItem.toFixed(2)}</span>
                                                        <div className="flex items-center gap-3">
                                                            
                                                            {/* Controles de Quantidade */}
                                                            <div className="flex items-center bg-white border border-gray-200 rounded-lg h-8 px-1 shadow-sm">
                                                                <button onClick={(e) => atualizarQtd(e, item.id, 'sub')} className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-gray-900">&minus;</button>
                                                                <span className="w-6 text-center text-xs font-semibold">{item.quantidade}</span>
                                                                <button onClick={(e) => atualizarQtd(e, item.id, 'add')} className="w-6 h-full flex items-center justify-center text-gray-500 hover:text-gray-900">&#43;</button>
                                                            </div>
                                                            
                                                            <button onClick={(e) => removerItem(e, item.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors" title="Remover item">
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* --- FOOTER DE CONVERSÃO --- */}
                        {cartItems.length > 0 && (
                            <footer className="bg-white border-t border-gray-100 p-6 shadow-[0_-15px_30px_rgba(0,0,0,0.04)] z-20 shrink-0">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-gray-500 font-medium text-sm">Subtotal</span>
                                    <span className="text-[26px] font-bold text-gray-900 leading-none">R$ {subtotal.toFixed(2)}</span>
                                </div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-2 text-[11px] text-gray-600 font-medium mb-5 bg-[#eff6ff] py-2.5 rounded-xl border border-sky-100">
                                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span>Fretes e cupons são calculados no checkout</span>
                                </motion.div>

                                <button onClick={handleFinalizarCompra} className="w-full h-[52px] bg-[#111827] text-white rounded-[14px] font-bold text-[15px] shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all mb-3 flex items-center justify-center gap-2">
                                    Finalizar Compra
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                                
                                <button onClick={onClose} className="w-full h-[48px] bg-white border border-gray-200 text-gray-700 rounded-[14px] font-semibold text-[14px] hover:bg-gray-50 transition-colors shadow-sm">
                                    Continuar a Comprar
                                </button>
                            </footer>
                        )}
                    </motion.div>
                </aside>
            )}
        </AnimatePresence>
    );
};

export default SideCart;