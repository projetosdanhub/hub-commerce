// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/ProductDetail.jsx
// ARQUITETURA: Detalhe do Produto de Alta Conversão sem Erros de Referência
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';

// Importação dos Componentes Globais da Loja
import ProductCard from './ProductCard'; 
import PromoBanners from './PromoBanners';

// --- ÍCONES SVG DECLARADOS E BLINDADOS ---
const HeartIcon = ({ isFilled, className }) => (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFilled ? "0" : "1.8"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const ShoppingCartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const StarIcon = ({ preenchida }) => (
    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${preenchida ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ShieldIcon = ({ className }) => (
    <svg className={className || "w-5 h-5 text-emerald-500"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const RefreshIcon = ({ className }) => (
    <svg className={className || "w-5 h-5 text-sky-500"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className || "w-5 h-5 text-orange-500"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

const SpinnerIcon = ({ className }) => (
    <svg className={`animate-spin ${className || "w-5 h-5"}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const CheckBadgeIcon = ({ className }) => (
    <svg className={className || "w-3.5 h-3.5 text-emerald-600"} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

// --- COMPONENTE INTERNO: CARROSSEL DE QUEM VIU COMPROU ---
const ProductCarouselRelated = ({ onOpenQuickView }) => {
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollPosition = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        window.addEventListener('resize', checkScrollPosition);
        return () => window.removeEventListener('resize', checkScrollPosition);
    }, []);

    const scrollByAmount = (amount) => {
        if (carouselRef.current) {
            carouselRef.current.style.scrollSnapType = 'none';
            carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
            setTimeout(() => {
                if(carouselRef.current) carouselRef.current.style.scrollSnapType = 'x mandatory';
            }, 400);
        }
    };

    return (
        <div className="relative w-full group">
            <button 
                onClick={() => scrollByAmount(-350)} 
                className={`absolute top-1/2 -left-4 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex w-12 h-12 items-center justify-center bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-sky-600 hover:scale-105 ${!canScrollLeft ? 'invisible' : ''}`}
            >
                <svg className="w-6 h-6 ml-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <button 
                onClick={() => scrollByAmount(350)} 
                className={`absolute top-1/2 -right-4 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex w-12 h-12 items-center justify-center bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-sky-600 hover:scale-105 ${!canScrollRight ? 'invisible' : ''}`}
            >
                 <svg className="w-6 h-6 mr-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="overflow-hidden w-full px-2">
                <div ref={carouselRef} onScroll={checkScrollPosition} className="flex gap-3 sm:gap-5 pt-2 pb-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style dangerouslySetContent={{__html: `::-webkit-scrollbar { display: none; }`}}></style>
                    {[1, 2, 3, 4, 5, 6].map(prodId => (
                        <div key={prodId} className="snap-start flex-shrink-0">
                            <ProductCard abrirModal={onOpenQuickView} produtoId={prodId} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProductDetail = ({ onAddCart, onOpenQuickView }) => {
    const { id } = useParams();
    
    // --- ESTADOS DO PRODUTO E UI ---
    const [imagemAtiva, setImagemAtiva] = useState(0);
    const [quantidade, setQuantidade] = useState(1);
    const [qtdKey, setQtdKey] = useState(0); // Força animação de chaqualhar

    const [isAdding, setIsAdding] = useState(false);
    const [isFavorito, setIsFavorito] = useState(false);
    const [isFavAnimating, setIsFavAnimating] = useState(false);
    
    const [abaAtiva, setAbaAtiva] = useState('descricao');
    const [filtroReview, setFiltroReview] = useState('todas');
    const [paginaReviewAtual, setPaginaReviewAtual] = useState(1);

    const isLogado = true;

    useEffect(() => { 
        if (typeof window !== 'undefined') window.scrollTo(0, 0); 
    }, [id]);

    // --- CONFIGURAÇÕES DINÂMICAS DO LOJISTA (Banners) ---
    const configuracaoLojista = {
        bannerTopo: {
            ativo: true,
            tipo: "full", // "full" ou "half"
            imagemDesktop: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
            imagemMobile: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"
        },
        parcelamento: {
            ativo: true,
            texto: "Em até 12x s/ juros no cartão"
        },
        promocoes: [
            { id: 1, urlImagemDesktop: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=1200', linkDestino: '/ofertas' }
        ]
    };

    // --- DADOS DO PRODUTO (MOCK API) ---
    const produto = {
        id: id || 1,
        nome: "Auscultadores Bluetooth Noise Cancelling Premium com Som HD",
        precoAntigo: 450.00,
        precoAtual: 349.99,
        descricao: "Desfrute do silêncio absoluto com o cancelamento de ruído ativo de última geração. O design ergonómico garante conforto para horas de utilização ininterrupta.",
        imagens: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
            "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&q=80"
        ],
        avaliacoes: { media: 4.8, total: 128, contagemImagens: 24, contagemVideos: 5, contagemTexto: 99 },
        ePersonalizavel: true,
        freteGratisAte: true,
        variacoes: [
            { 
                tipo: 'Cor', 
                estilo: 'imagem', 
                opcoes: [
                    { nome: 'Preto Onyx', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100' },
                    { nome: 'Prata Lunar', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100' }
                ]
            },
            { 
                tipo: 'Tamanho', 
                estilo: 'texto', 
                opcoes: [{ nome: 'Único' }, { nome: 'Ajustável' }] 
            }
        ],
        estoque: 15
    };

    const [variacoesSelecionadas, setVariacoesSelecionadas] = useState({ 'Cor': 'Preto Onyx', 'Tamanho': 'Único' });
    const descontoPercentual = produto.precoAntigo > produto.precoAtual ? Math.round(((produto.precoAntigo - produto.precoAtual) / produto.precoAntigo) * 100) : 0;

    // --- AVALIAÇÕES MOCK & PAGINAÇÃO ---
    const reviewsMock = [
        { id: 1, autor: "João Silva", rating: 5, data: "12/10/2026", tipo: "texto", texto: "Produto fantástico! O cancelamento de ruído é surreal e a entrega foi super rápida." },
        { id: 2, autor: "Maria Costa", rating: 5, data: "10/10/2026", tipo: "imagem", texto: "Muito bonito, o material é premium. Encaixou perfeitamente.", imagens: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150"] },
        { id: 3, autor: "Carlos Mendes", rating: 4, data: "05/10/2026", tipo: "video", texto: "Melhor fone que já tive. Gravei um pequeno vídeo para verem.", videoThumb: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150" },
        { id: 4, autor: "Ana Sofia", rating: 5, data: "01/10/2026", tipo: "texto", texto: "Excelente compra." },
        { id: 5, autor: "Pedro R.", rating: 3, data: "28/09/2026", tipo: "texto", texto: "Bom produto, mas demorou um pouco a chegar." },
        { id: 6, autor: "Lúcia T.", rating: 5, data: "20/09/2026", tipo: "texto", texto: "Recomendo vivamente." }
    ];

    const reviewsFiltradas = reviewsMock.filter(r => {
        if (filtroReview === 'todas') return true;
        if (filtroReview === 'com_imagens') return r.tipo === 'imagem';
        if (filtroReview === 'com_videos') return r.tipo === 'video';
        if (filtroReview === 'texto') return r.tipo === 'texto';
        return true;
    });

    const reviewsPorPagina = 5;
    const totalPaginasReviews = Math.ceil(reviewsFiltradas.length / reviewsPorPagina);
    const reviewsExibidas = reviewsFiltradas.slice((paginaReviewAtual - 1) * reviewsPorPagina, paginaReviewAtual * reviewsPorPagina);

    useEffect(() => { setPaginaReviewAtual(1); }, [filtroReview]);

    // --- HANDLERS ---
    const handleQtdChange = (delta) => {
        setQuantidade(prev => Math.max(1, prev + delta));
        setQtdKey(prev => prev + 1);
    };

    const handleAddToCart = () => {
        setIsAdding(true);
        setTimeout(() => {
            setIsAdding(false);
            if (typeof onAddCart === 'function') onAddCart({ ...produto, variacoesSelecionadas }, quantidade);
        }, 600);
    };

    const handleFavoritar = () => {
        if (!isLogado) { alert("Inicie sessão para guardar os favoritos."); return; }
        if (!isFavorito) {
            setIsFavAnimating(true);
            setTimeout(() => { setIsFavAnimating(false); setIsFavorito(true); }, 600);
        } else {
            setIsFavorito(false);
        }
    };

    return (
        <div className="w-full bg-[#FCFCFD] selection:bg-blue-100">
            <Helmet>
                <title>{produto.nome} | HUB Commerce</title>
                <meta name="description" content={produto.descricao} />
            </Helmet>

            {/* 1. BANNER DO TOPO */}
            {configuracaoLojista.bannerTopo.ativo && (
                <div className={`w-full relative overflow-hidden mb-6 ${configuracaoLojista.bannerTopo.tipo === 'half' ? 'h-[150px] md:h-[220px]' : 'h-[250px] md:h-[350px]'}`}>
                    <picture>
                        <source media="(min-width: 768px)" srcSet={configuracaoLojista.bannerTopo.imagemDesktop} />
                        <img src={configuracaoLojista.bannerTopo.imagemMobile} alt="Banner Promocional" className="absolute inset-0 w-full h-full object-cover" />
                    </picture>
                    <div className="absolute inset-0 bg-gray-900/10 mix-blend-multiply"></div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                
                {/* --- BREADCRUMB --- */}
                <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex items-center text-xs text-gray-500 font-medium overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
                        <li><Link to="/" className="hover:text-sky-600 transition-colors">Início</Link><span className="mx-2">/</span></li>
                        <li><Link to="/categoria/eletronicos" className="hover:text-sky-600 transition-colors">Departamentos</Link><span className="mx-2">/</span></li>
                        <li className="text-gray-800 truncate">{produto.nome}</li>
                    </ol>
                </nav>

                {/* --- SEÇÃO PRINCIPAL (GALERIA E INFORMAÇÕES) --- */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-5 md:p-8 flex flex-col lg:flex-row gap-8 xl:gap-12 mb-12">
                    
                    {/* LADO ESQUERDO: GALERIA GLASSMORFISMO */}
                    <div className="w-full lg:w-[55%] flex flex-col gap-4">
                        <div className="w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-gray-50/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-100 relative flex items-center justify-center p-2">
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={imagemAtiva} 
                                    initial={{ opacity: 0, scale: 0.98 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 1.02 }} 
                                    transition={{ duration: 0.3 }} 
                                    src={produto.imagens[imagemAtiva]} 
                                    alt={produto.nome} 
                                    className="w-full h-full object-contain mix-blend-multiply" 
                                />
                            </AnimatePresence>
                        </div>
                        
                        {/* Miniaturas Centralizadas */}
                        <div className="flex justify-center w-full">
                            <div className="flex gap-3 overflow-x-auto snap-x scroll-smooth pb-2 custom-scrollbar px-1 max-w-full">
                                {produto.imagens.map((img, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setImagemAtiva(idx)} 
                                        className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 snap-start rounded-xl overflow-hidden border-2 transition-all ${imagemAtiva === idx ? 'border-sky-500 shadow-sm scale-105' : 'border-transparent bg-white/50 backdrop-blur-sm opacity-70 hover:opacity-100 hover:border-gray-200'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover mix-blend-multiply bg-gray-50/50" alt="" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* LADO DIREITO: INFORMAÇÕES */}
                    <div className="w-full lg:w-[45%] flex flex-col">
                        <h1 className="text-[22px] md:text-[28px] font-bold text-gray-900 leading-tight tracking-tight mb-3">
                            {produto.nome}
                        </h1>
                        
                        <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => { document.getElementById('abas')?.scrollIntoView({behavior: 'smooth'}); setAbaAtiva('avaliacoes'); }}>
                            <div className="flex">{[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} preenchida={i <= Math.round(produto.avaliacoes.media)} />)}</div>
                            <span className="text-sm font-semibold text-gray-700 hover:text-sky-600 transition-colors">{produto.avaliacoes.media} <span className="text-gray-400 font-normal underline decoration-dashed underline-offset-4">({produto.avaliacoes.total})</span></span>
                        </div>

                        {/* Bloco de Preço */}
                        <div className="flex flex-col mb-8 pb-8 border-b border-gray-100">
                            {produto.precoAntigo > produto.precoAtual && (
                                <span className="text-gray-400 text-sm line-through font-medium mb-1">
                                    R$ {produto.precoAntigo.toFixed(2)}
                                </span>
                            )}
                            
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-gray-900 font-black text-4xl tracking-tight">R$ {produto.precoAtual.toFixed(2)}</span>
                                {descontoPercentual > 0 && <span className="bg-orange-500 text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm">{descontoPercentual}% OFF</span>}
                                {produto.freteGratisAte && <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1"><TruckIcon className="w-3.5 h-3.5"/> FRETE GRÁTIS</span>}
                            </div>
                            
                            {configuracaoLojista.parcelamento.ativo && (
                                <span className="text-[13px] text-gray-600 mt-2 block flex items-center gap-1.5 font-medium">
                                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    {configuracaoLojista.parcelamento.texto}
                                </span>
                            )}
                        </div>

                        {/* Variações Dinâmicas */}
                        <div className="flex flex-col gap-6 mb-8">
                            {produto.variacoes.map((varData, idx) => (
                                <div key={idx}>
                                    <h4 className="text-[13px] font-bold text-gray-900 mb-2.5">
                                        {varData.tipo}: <span className="text-gray-500 font-medium">{variacoesSelecionadas[varData.tipo]}</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {varData.opcoes.map(op => {
                                            const isSelected = variacoesSelecionadas[varData.tipo] === op.nome;
                                            
                                            if (varData.estilo === 'imagem' && op.img) {
                                                return (
                                                    <button 
                                                        key={op.nome} 
                                                        onClick={() => setVariacoesSelecionadas({...variacoesSelecionadas, [varData.tipo]: op.nome})} 
                                                        className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 ${isSelected ? 'border-sky-500 shadow-sm scale-110' : 'border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <img src={op.img} alt={op.nome} className="w-full h-full object-cover rounded-full mix-blend-multiply bg-gray-50" />
                                                    </button>
                                                );
                                            }
                                            
                                            return (
                                                <button 
                                                    key={op.nome} 
                                                    onClick={() => setVariacoesSelecionadas({...variacoesSelecionadas, [varData.tipo]: op.nome})} 
                                                    className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all ${isSelected ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                                                >
                                                    {op.nome}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Aviso Personalizável */}
                        {produto.ePersonalizavel && (
                            <div className="mb-8 p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl flex items-start gap-3 shadow-sm">
                                <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                <p className="text-[12px] text-sky-800 leading-snug">
                                    <strong className="block mb-0.5 text-[13px]">Produto Personalizável!</strong> 
                                    Após adicionar ao carrinho, poderá anexar a sua logomarca ou escrever o texto de gravação de forma simples.
                                </p>
                            </div>
                        )}

                        {/* Ações: Quantidade, Carrinho e Favoritos */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                            <motion.div 
                                key={qtdKey} 
                                animate={{ x: [0, -3, 3, -3, 3, 0] }} 
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl h-14 px-2 w-full sm:w-32 shadow-sm flex-shrink-0"
                            >
                                <button onClick={() => handleQtdChange(-1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-lg font-medium transition-colors">&minus;</button>
                                <span className="font-bold text-gray-900 text-sm">{quantidade}</span>
                                <button onClick={() => handleQtdChange(1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-lg font-medium transition-colors">&#43;</button>
                            </motion.div>

                            <button 
                                onClick={handleAddToCart} 
                                disabled={isAdding || produto.estoque === 0} 
                                className="relative overflow-hidden flex-1 bg-[#111827] text-white font-bold h-14 rounded-xl shadow-lg shadow-gray-900/20 group/add disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <div className="absolute inset-0 bg-orange-500 transform scale-y-0 origin-bottom group-hover/add:scale-y-100 transition-transform duration-300 ease-out z-0"></div>
                                <span className="relative z-10 flex items-center justify-center gap-2 h-full text-[14px]">
                                    {isAdding ? <><SpinnerIcon /> A Adicionar...</> : produto.estoque > 0 ? <><ShoppingCartIcon /> Adicionar ao Carrinho</> : "Esgotado"}
                                </span>
                            </button>

                            <button onClick={handleFavoritar} className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-colors group/fav shadow-sm flex-shrink-0">
                                {isFavAnimating && (
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                                        <motion.circle cx="28" cy="28" r="26" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
                                    </svg>
                                )}
                                <HeartIcon isFilled={isFavorito} className={`w-5 h-5 transition-colors duration-300 ${isFavorito ? 'text-red-500' : 'text-gray-400 group-hover/fav:text-red-400'}`} />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100">
                            <div className="flex flex-col items-center justify-center text-center gap-1.5 bg-gray-50 rounded-lg p-2.5">
                                <ShieldIcon className="w-5 h-5" />
                                <span className="text-[9px] font-bold text-gray-700 uppercase leading-tight">Compra<br/>Segura</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-1.5 bg-gray-50 rounded-lg p-2.5">
                                <RefreshIcon className="w-5 h-5" />
                                <span className="text-[9px] font-bold text-gray-700 uppercase leading-tight">Troca<br/>Fácil</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-1.5 bg-gray-50 rounded-lg p-2.5">
                                <TruckIcon className="w-5 h-5" />
                                <span className="text-[9px] font-bold text-gray-700 uppercase leading-tight">Entrega<br/>Rápida</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ABAS DE DESCRIÇÃO E AVALIAÇÕES --- */}
                <div id="abas" className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-10 mb-12">
                    <div className="flex gap-8 border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar">
                        {['descricao', 'especificacoes', 'avaliacoes'].map(aba => (
                            <button 
                                key={aba} 
                                onClick={() => setAbaAtiva(aba)} 
                                className={`pb-4 text-[13px] font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${abaAtiva === aba ? 'text-sky-600' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                {aba === 'descricao' ? 'Descrição Geral' : aba === 'especificacoes' ? 'Especificações Técnicas' : `Avaliações (${produto.avaliacoes.total})`}
                                {abaAtiva === aba && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-sky-500" />}
                            </button>
                        ))}
                    </div>

                    <div className="prose prose-sm max-w-none text-gray-600">
                        {abaAtiva === 'descricao' && (
                            <div className="leading-relaxed space-y-4">
                                <p>{produto.descricao}</p>
                            </div>
                        )}
                        {abaAtiva === 'especificacoes' && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <ul className="space-y-3 text-sm">
                                    <li className="flex border-b border-gray-200 pb-2"><span className="font-bold w-1/3 text-gray-900">Garantia:</span> <span className="w-2/3">1 Ano de Fábrica</span></li>
                                </ul>
                            </div>
                        )}
                        
                        {/* AVALIAÇÕES COM FILTROS E PAGINAÇÃO */}
                        {abaAtiva === 'avaliacoes' && (
                            <div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-yellow-50 border border-yellow-100 p-6 rounded-2xl mb-8">
                                    <div className="text-center sm:text-left">
                                        <span className="text-4xl font-black text-yellow-600">{produto.avaliacoes.media}</span>
                                        <div className="flex justify-center sm:justify-start mt-1">{[1,2,3,4,5].map(i=><StarIcon key={i} preenchida={i<=4} />)}</div>
                                    </div>
                                    <div className="text-xs text-yellow-800 border-t sm:border-t-0 sm:border-l border-yellow-200 pt-4 sm:pt-0 sm:pl-6">
                                        Baseado em <strong>{produto.avaliacoes.total} avaliações</strong> de clientes verificados.
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                                    {[
                                        { id: 'todas', label: `Todas (${produto.avaliacoes.total})` },
                                        { id: 'com_imagens', label: `Com Imagens (${produto.avaliacoes.contagemImagens})` },
                                        { id: 'com_videos', label: `Com Vídeos (${produto.avaliacoes.contagemVideos})` },
                                        { id: 'texto', label: `Apenas Texto (${produto.avaliacoes.contagemTexto})` }
                                    ].map(filtro => (
                                        <button 
                                            key={filtro.id} 
                                            onClick={() => setFiltroReview(filtro.id)}
                                            className={`px-5 py-2 rounded-full text-[11px] uppercase font-bold whitespace-nowrap transition-colors border ${filtroReview === filtro.id ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {filtro.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {reviewsExibidas.length > 0 ? reviewsExibidas.map(review => (
                                            <motion.div key={review.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">{review.autor.substring(0,2).toUpperCase()}</div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                            {review.autor} <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] px-2 py-0.5 rounded uppercase tracking-wide border border-emerald-100"><CheckBadgeIcon /> Comprador Verificado</span>
                                                        </span>
                                                        <div className="flex mt-0.5">{[1,2,3,4,5].map(i=><StarIcon key={i} preenchida={i <= review.rating} />)}</div>
                                                    </div>
                                                    <span className="ml-auto text-xs text-gray-400">{review.data}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.texto}</p>
                                                
                                                {(review.tipo === 'imagem' || review.tipo === 'video') && (
                                                    <div className="flex gap-3">
                                                        {review.imagens && review.imagens.map((img, i) => <img key={i} src={img} alt="Avaliação" className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm" />)}
                                                        {review.videoThumb && (
                                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer group">
                                                                <img src={review.videoThumb} alt="Vídeo" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors"><svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z" /></svg></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )) : (
                                            <div className="text-center py-10 text-gray-400 text-sm">Nenhuma avaliação encontrada.</div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Paginação */}
                                {totalPaginasReviews > 1 && (
                                    <div className="flex justify-center items-center mt-8 gap-3">
                                        <button disabled={paginaReviewAtual === 1} onClick={() => setPaginaReviewAtual(prev => prev - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors shadow-sm">&lt;</button>
                                        <span className="text-xs text-gray-500 font-bold px-2">Página {paginaReviewAtual} de {totalPaginasReviews}</span>
                                        <button disabled={paginaReviewAtual === totalPaginasReviews} onClick={() => setPaginaReviewAtual(prev => prev + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors shadow-sm">&gt;</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- BANNERS PROMOCIONAIS OPCIONAIS --- */}
                {configuracaoLojista.promocoes && configuracaoLojista.promocoes.length > 0 && (
                    <div className="mb-12">
                        <PromoBanners banners={configuracaoLojista.promocoes} maxBanners={1} />
                    </div>
                )}

                {/* --- PRODUTOS RELACIONADOS --- */}
                <ProductCarouselRelated onOpenQuickView={onOpenQuickView} />

            </main>
        </div>
    );
};

export default ProductDetail;