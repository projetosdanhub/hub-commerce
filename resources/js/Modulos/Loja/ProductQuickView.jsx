// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/ProductQuickView.jsx
// ARQUITETURA: Modal Global (Controlado pelo app.jsx)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- ÍCONES SVG ---
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
const ShoppingCartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const StarIcon = ({ preenchida }) => <svg className={`w-3.5 h-3.5 ${preenchida ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>;
const ShieldIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>;
const RefreshIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>;
const LightningIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;

// O Ícone do Coração agora suporta estado preenchido e apenas contorno
const HeartIcon = ({ isFilled, className }) => (
    <svg className={className} viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFilled ? "0" : "1.8"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ProductQuickView = ({ isOpen, produtoId, onClose, onAddCart }) => {
    // --- ESTADOS ---
    const [imagemAtiva, setImagemAtiva] = useState(0);
    const [quantidade, setQuantidade] = useState(1);
    
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isFavorito, setIsFavorito] = useState(false);
    const [isFavAnimating, setIsFavAnimating] = useState(false);

    // Mock Sistema (Definido no HQ Admin)
    const isLogado = true; // Teste: Altere para false para ver o pedido de login
    const usuarioMock = {
        nome: "Sócia Empreendedora",
        foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80"
    };

    // Dados do Produto
    const produto = {
        id: produtoId || 1,
        categoriaUrl: "/categoria/eletronicos",
        categoriaNome: "Eletrónicos",
        nome: "Auscultadores Bluetooth Noise Cancelling Premium",
        precoAntigo: 450.00,
        precoAtual: 349.99,
        descricao: "Desfrute do silêncio absoluto com o cancelamento de ruído. Autonomia até 30 horas e conforto inigualável.",
        imagens: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
        ],
        avaliacoes: { media: 4.8, total: 128 },
        ePersonalizavel: true // Força a exibir a mensagem de personalização
    };

    let descontoPercentual = 0;
    if (produto.precoAntigo > produto.precoAtual) {
        descontoPercentual = Math.round(((produto.precoAntigo - produto.precoAtual) / produto.precoAntigo) * 100);
    }

    useEffect(() => {
        if (isOpen && produtoId) {
            document.body.style.overflow = 'hidden';
            setQuantidade(1);
            // Tracking Pixels
            // if (window.fbq) window.fbq('track', 'ViewContent', { content_ids: [produto.id], content_type: 'product', value: produto.precoAtual, currency: 'BRL' });
            // if (window.gtag) window.gtag('event', 'view_item', { items: [{ item_id: produto.id, item_name: produto.nome, price: produto.precoAtual }] });
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, produtoId]);

    // --- HANDLERS PROTEGIDOS ---
    const handleAddToCart = (e) => {
        e.preventDefault(); // Impede o recarregamento da página (Tela Branca)
        e.stopPropagation();
        
        setIsAddingToCart(true);

        setTimeout(() => {
            setIsAddingToCart(false);
            if (typeof onAddCart === 'function') {
                onAddCart(produto, quantidade); // O app.jsx fecha o modal e abre o SideCart
            }
        }, 500);
    };

    const handleFavoritar = (e) => {
        e.preventDefault(); 
        e.stopPropagation();

        if (!isLogado) {
            alert("Por favor, crie uma conta ou inicie sessão para guardar os favoritos.");
            return;
        }

        if (isFavorito) {
            setIsFavorito(false); // Remove o preenchimento se já tiver
        } else {
            setIsFavAnimating(true);
            setTimeout(() => {
                setIsFavAnimating(false);
                setIsFavorito(true); // Preenche o coração a vermelho
            }, 600);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
                    
                    {/* Overlay Escuro */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Principal (Max Height ajustado para não ter scrollbar geral) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white w-full max-w-[850px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        <button onClick={onClose} type="button" className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md text-gray-500 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                            <CloseIcon />
                        </button>

                        {/* COLUNA ESQUERDA: IMAGEM */}
                        <div className="w-full md:w-[45%] bg-gray-50 flex flex-col p-5 border-r border-gray-100 hidden sm:flex">
                            <div className="flex-1 rounded-2xl overflow-hidden mb-3 bg-white shadow-sm border border-gray-100 relative">
                                <AnimatePresence mode="wait">
                                    <motion.img 
                                        key={imagemAtiva} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                                        src={produto.imagens[imagemAtiva]} alt="Produto" className="w-full h-full object-cover mix-blend-multiply"
                                    />
                                </AnimatePresence>
                                {descontoPercentual > 0 && (
                                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                                        {descontoPercentual}% OFF
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 justify-center">
                                {produto.imagens.map((img, idx) => (
                                    <button 
                                        key={idx} type="button" onClick={() => setImagemAtiva(idx)}
                                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${imagemAtiva === idx ? 'border-blue-600 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover mix-blend-multiply" alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COLUNA DIREITA: INFORMAÇÕES */}
                        <div className="w-full md:w-[55%] p-5 sm:p-7 flex flex-col overflow-y-auto custom-scrollbar">
                            
                            {/* Trilha (Breadcrumb) - Agora fecha o modal ao clicar! */}
                            <nav aria-label="Breadcrumb" className="mb-2">
                                <ol className="flex text-[10px] text-gray-400 font-medium">
                                    <li><Link to="/" onClick={onClose} className="hover:text-blue-600 transition-colors">Loja</Link><span className="mx-2">/</span></li>
                                    <li><Link to={produto.categoriaUrl} onClick={onClose} className="hover:text-blue-600 transition-colors">{produto.categoriaNome}</Link></li>
                                </ol>
                            </nav>

                            <h2 className="text-[20px] sm:text-[24px] font-bold text-gray-900 leading-tight mb-1">{produto.nome}</h2>

                            <div className="flex items-center gap-1.5 mb-3">
                                <div className="flex">{[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} preenchida={i <= Math.round(produto.avaliacoes.media)} />)}</div>
                                <span className="text-[11px] font-medium text-gray-500">({produto.avaliacoes.total})</span>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-3">
                                {produto.precoAntigo > produto.precoAtual && (
                                    <span className="block text-gray-400 text-[11px] line-through font-medium mb-0.5">De R$ {produto.precoAntigo.toFixed(2)}</span>
                                )}
                                <span className="block text-gray-900 font-bold text-[24px] tracking-tight leading-none">R$ {produto.precoAtual.toFixed(2)}</span>
                            </div>

                            <p className="text-[12px] text-gray-600 leading-relaxed font-light mb-4">{produto.descricao}</p>

                            {/* AVISO DE PERSONALIZAÇÃO (Aparece se for personalizável) */}
                            {produto.ePersonalizavel && (
                                <div className="mb-5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2.5 shadow-sm">
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <p className="text-[11px] text-blue-800 leading-snug">
                                        <strong className="block mb-0.5">Produto Personalizável:</strong> 
                                        O envio da sua imagem e texto será feito de forma simples na próxima etapa (Página do Carrinho).
                                    </p>
                                </div>
                            )}

                            {/* AÇÕES DE COMPRA */}
                            <div className="flex gap-2 mt-auto">
                                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl h-11 px-1.5 w-24 shadow-sm flex-shrink-0">
                                    <button type="button" onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded transition-colors">&minus;</button>
                                    <span className="font-semibold text-gray-900 text-xs">{quantidade}</span>
                                    <button type="button" onClick={() => setQuantidade(quantidade + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded transition-colors">&#43;</button>
                                </div>

                                {/* BOTÃO ADICIONAR COM HOVER LARANJA E TYPE BUTTON PARA EVITAR TELA BRANCA */}
                                <button 
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                    className="relative overflow-hidden flex-1 bg-[#111827] text-white font-bold text-[13px] h-11 rounded-xl flex items-center justify-center gap-1.5 group/add shadow-md"
                                >
                                    <div className="absolute inset-0 bg-orange-500 transform scale-y-0 origin-bottom group-hover/add:scale-y-100 transition-transform duration-300 ease-out z-0"></div>
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        {isAddingToCart ? <><SpinnerIcon /> A Adicionar...</> : <><ShoppingCartIcon /> Adicionar ao Carrinho</>}
                                    </span>
                                </button>
                            </div>

                            {/* CONTA DO CLIENTE & FAVORITOS */}
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                                <div>
                                    {isLogado ? (
                                        <div className="flex items-center gap-2">
                                            <img src={usuarioMock.foto} alt="Perfil" className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-sm" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Logado</span>
                                                <span className="text-[11px] font-bold text-gray-800 leading-tight">{usuarioMock.nome}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link to="/login" onClick={onClose} className="text-[11px] font-bold text-sky-600 hover:text-sky-700 underline underline-offset-2 transition-colors">
                                            Criar Conta / Login
                                        </Link>
                                    )}
                                </div>

                                {/* BOTÃO FAVORITAR (Coração Animado) */}
                                <button 
                                    type="button"
                                    onClick={handleFavoritar}
                                    className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 border border-gray-100 hover:border-red-200 transition-colors group/fav flex-shrink-0"
                                    aria-label="Adicionar aos Favoritos"
                                >
                                    {isFavAnimating && (
                                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                                            <motion.circle cx="20" cy="20" r="19" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
                                        </svg>
                                    )}
                                    <HeartIcon isFilled={isFavorito} className={`w-4 h-4 transition-colors duration-300 ${isFavorito ? 'text-red-500' : 'text-gray-400 group-hover/fav:text-red-400'}`} />
                                </button>
                            </div>

                            {/* TRUST BADGES (Mais pequenas e em formato compacto) */}
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-col items-center justify-center text-center gap-1 bg-gray-50 rounded-lg p-2">
                                    <ShieldIcon className="text-emerald-500 w-4 h-4" />
                                    <span className="text-[8px] font-bold text-gray-600 uppercase leading-tight">Compra<br/>Segura</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center gap-1 bg-gray-50 rounded-lg p-2">
                                    <RefreshIcon className="text-sky-500 w-4 h-4" />
                                    <span className="text-[8px] font-bold text-gray-600 uppercase leading-tight">Troca<br/>Fácil</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center gap-1 bg-gray-50 rounded-lg p-2">
                                    <LightningIcon className="text-orange-500 w-4 h-4" />
                                    <span className="text-[8px] font-bold text-gray-600 uppercase leading-tight">Entrega<br/>Veloz</span>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductQuickView;