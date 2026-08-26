// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/Header.jsx
// ARQUITETURA: Presentation Component (API Connected, A11y, UX Premium)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationMenu from './MenuNavegacao';
import api from '../../api';

// --- ÍCONES SVG NATIVOS ---
const SearchIcon = ({ className }) => (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const UserIcon = ({ className }) => (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const HeartIcon = ({ className, isFilled }) => (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFilled ? "0" : "1.8"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const CartIcon = ({ className }) => (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const SpinnerIcon = ({ className = "w-4 h-4 text-sky-500" }) => (
    <svg aria-hidden="true" className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const Header = ({ 
    onCartClick, 
    cartCount = 0, 
    onFavoritesClick, 
    favoritesCount = 0, 
    isLogado = false 
}) => {
    const navigate = useNavigate();

    // --- CONFIGURAÇÕES DA LOJA ---
    const configLojista = {
        logo: { 
            url: "https://via.placeholder.com/180x50?text=HUB+Commerce", 
            alt: "HUB Commerce - Página Inicial",
            alturaClasse: "h-9 sm:h-11 w-auto object-contain" 
        },
        cores: { 
            bgHeader: "bg-white", 
            hoverAnelAzul: "border-sky-400", 
            hoverAnelVermelho: "border-rose-500",
            badgeCartBg: "bg-sky-500",
            badgeFavBg: "bg-rose-500",
            badgeTexto: "text-white"
        }
    };

    // --- ESTADOS ---
    const [scrolled, setScrolled] = useState(false);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [isSearching, setIsPesquisando] = useState(false);
    const [resultadosPesquisa, setResultadosPesquisa] = useState([]);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isFetchingSearch, setIsFetchingSearch] = useState(false);

    // Estados de Loading UX
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingCart, setIsLoadingCart] = useState(false);
    const [isLoadingFav, setIsLoadingFav] = useState(false);

    const searchContainerRef = useRef(null);

    const isCoraçãoAtivo = isLogado === true && favoritesCount > 0;

    // Efeito de Scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fecha a caixa de pesquisa ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsPesquisando(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- MOTOR DE PESQUISA (Conectado na API Real) ---
    const handleSearchChange = async (e) => {
        const val = e.target.value;
        setTermoPesquisa(val);

        if (val.trim().length > 2) {
            setIsPesquisando(true);
            setIsFetchingSearch(true);
            
            try {
                // Buscamos apenas os produtos ativos da API
                const res = await api.get('/admin/products');
                const catData = res.data?.data || [];
                
                const filtrados = catData.filter(item => 
                    item.status_vitrine === 'ATIVO' && 
                    item.nome.toLowerCase().includes(val.toLowerCase())
                ).slice(0, 5); // Limita a 5 resultados para não quebrar o layout
                
                setResultadosPesquisa(filtrados);
            } catch (error) {
                console.error("Erro na busca", error);
                setResultadosPesquisa([]);
            } finally {
                setIsFetchingSearch(false);
            }
        } else {
            setIsPesquisando(false);
            setResultadosPesquisa([]);
        }
    };

    // --- NAVEGAÇÕES COM DELAY UX ---
    const handleIrParaPerfil = (e) => {
        e.preventDefault();
        setIsLoadingProfile(true);
        setTimeout(() => { 
            setIsLoadingProfile(false); 
            navigate('/perfil'); 
        }, 300);
    };

    const handleAbrirCarrinho = (e) => {
        e.preventDefault();
        setIsLoadingCart(true);
        setTimeout(() => { 
            setIsLoadingCart(false); 
            if (typeof onCartClick === 'function') onCartClick(); 
        }, 300); 
    };

    const handleAbrirFavoritos = (e) => {
        e.preventDefault();
        setIsLoadingFav(true);
        setTimeout(() => { 
            setIsLoadingFav(false); 
            if (typeof onFavoritesClick === 'function') onFavoritesClick(); 
        }, 300); 
    };

    const renderResultadosBusca = () => (
        <AnimatePresence>
            {isSearching && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 p-2"
                >
                    {isFetchingSearch ? (
                        <div className="p-6 text-center text-slate-500 text-xs flex justify-center items-center gap-2"><SpinnerIcon/> Buscando...</div>
                    ) : resultadosPesquisa.length > 0 ? (
                        resultadosPesquisa.map((prod) => (
                            <div 
                                key={prod.id} 
                                onClick={() => { navigate(`/produto/${prod.id}`); setIsPesquisando(false); setTermoPesquisa(""); }}
                                className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                            >
                                <img src={prod.img || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 object-cover rounded-lg mix-blend-multiply border border-slate-100" />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-semibold text-slate-800 truncate">{prod.nome}</span>
                                    <span className="text-xs text-sky-600 font-bold">R$ {parseFloat(prod.preco_promo || prod.preco).toFixed(2)}</span>
                                </div>
                                {(!prod.quantidade_estoque || prod.quantidade_estoque <= 0) && !prod.pre_venda && (
                                    <span className="text-[9px] bg-rose-50 text-rose-500 font-bold px-2 py-0.5 rounded uppercase tracking-widest">Esgotado</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-slate-500 text-xs font-medium">Produto não encontrado.</div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {/* INVÓLUCRO MESTRE: HEADER 100% FIXO NO TOPO */}
            <div className={`relative top-0 z-50 w-full flex flex-col transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
                
                {/* 1. BARRA PRINCIPAL (DESKTOP) */}
                <header className={`hidden md:block w-full ${configLojista.cores.bgHeader} py-4`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        
                        <Link to="/" className="flex items-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg">
                            <img src={configLojista.logo.url} alt={configLojista.logo.alt} className={configLojista.logo.alturaClasse} />
                        </Link>

                        {/* PESQUISA DESKTOP */}
                        <div ref={searchContainerRef} className="flex flex-1 max-w-xl mx-8 relative">
                            <form role="search" className="w-full relative" onSubmit={(e) => e.preventDefault()}>
                                <label htmlFor="search-input" className="sr-only">Pesquisar produtos</label>
                                <input 
                                    id="search-input"
                                    type="search" 
                                    value={termoPesquisa}
                                    onChange={handleSearchChange}
                                    onFocus={() => termoPesquisa.length > 2 && setIsPesquisando(true)}
                                    placeholder="O que você procura hoje?" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-5 pr-11 text-sm focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all outline-none text-slate-800 font-medium"
                                />
                                <button type="submit" aria-label="Executar pesquisa" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors">
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                            </form>
                            {renderResultadosBusca()}
                        </div>

                        {/* ÍCONES DE AÇÃO DESKTOP */}
                        <div className="flex items-center gap-6">
                            {/* Perfil */}
                            <button onClick={handleIrParaPerfil} disabled={isLoadingProfile} aria-label="Acessar Perfil" className="relative flex flex-col items-center group cursor-pointer">
                                <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 group-hover:bg-sky-50 transition-colors">
                                    <motion.div 
                                        className={`absolute inset-0 rounded-full border-2 border-transparent group-hover:${configLojista.cores.hoverAnelAzul} opacity-0 group-hover:opacity-100 transition-opacity`}
                                        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                        style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} 
                                    />
                                    {isLoadingProfile ? <SpinnerIcon /> : <UserIcon className="w-5 h-5 text-slate-700 group-hover:text-sky-600 transition-colors" />}
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-sky-600 mt-1 uppercase tracking-wider">Perfil</span>
                            </button>

                            {/* Favoritos */}
                            <button onClick={handleAbrirFavoritos} disabled={isLoadingFav} aria-label="Ver Favoritos" className="relative flex flex-col items-center group cursor-pointer">
                                <div className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isCoraçãoAtivo ? 'bg-rose-50' : 'bg-slate-50 group-hover:bg-rose-50'}`}>
                                    <motion.div 
                                        className={`absolute inset-0 rounded-full border-2 border-transparent group-hover:${configLojista.cores.hoverAnelVermelho} opacity-0 group-hover:opacity-100 transition-opacity`}
                                        initial={{ rotate: 0 }} whileHover={{ rotate: 360 }} transition={{ repeat: 0, duration: 0.8, ease: "easeOut" }}
                                        style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} 
                                    />
                                    {isLoadingFav ? (
                                        <SpinnerIcon className="w-5 h-5 text-rose-500" />
                                    ) : (
                                        <HeartIcon isFilled={isCoraçãoAtivo} className={`w-5 h-5 transition-colors ${isCoraçãoAtivo ? 'text-rose-500' : 'text-slate-700 group-hover:text-rose-500'}`} />
                                    )}
                                    {isCoraçãoAtivo && (
                                        <span className={`absolute -top-1 -right-1 ${configLojista.cores.badgeFavBg} ${configLojista.cores.badgeTexto} text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm`}>
                                            {favoritesCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[11px] font-bold mt-1 uppercase tracking-wider transition-colors ${isCoraçãoAtivo ? 'text-rose-500' : 'text-slate-500 group-hover:text-rose-500'}`}>Favoritos</span>
                            </button>

                            {/* Carrinho */}
                            <button onClick={handleAbrirCarrinho} disabled={isLoadingCart} aria-label="Abrir Carrinho" className="relative flex flex-col items-center group cursor-pointer">
                                <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 group-hover:bg-sky-50 transition-colors">
                                    <motion.div 
                                        className={`absolute inset-0 rounded-full border-2 border-transparent group-hover:${configLojista.cores.hoverAnelAzul} opacity-0 group-hover:opacity-100 transition-opacity`}
                                        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                        style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} 
                                    />
                                    {isLoadingCart ? <SpinnerIcon /> : <CartIcon className="w-5 h-5 text-slate-700 group-hover:text-sky-600 transition-colors" />}
                                    {cartCount > 0 && (
                                        <span className={`absolute -top-1 -right-1 ${configLojista.cores.badgeCartBg} ${configLojista.cores.badgeTexto} text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm`}>
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 group-hover:text-sky-600 mt-1 uppercase tracking-wider">Carrinho</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* 2. TOPO MOBILE */}
                <header className={`md:hidden w-full ${configLojista.cores.bgHeader} py-3 border-b border-slate-100 flex items-center justify-center`}>
                    <Link to="/" className="flex items-center justify-center focus:outline-none">
                        <img src={configLojista.logo.url} alt={configLojista.logo.alt} className="h-9 w-auto object-contain" />
                    </Link>
                </header>

                {/* 3. MENU DE NAVEGAÇÃO DESKTOP (Com SEO Link Builder) */}
                <div className="hidden md:block bg-white border-b border-slate-100 shadow-sm">
                    <NavigationMenu />
                </div>
            </div>

            {/* APP BAR BASE MOBILE */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-16 z-40 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]" aria-label="Navegação Mobile">
                <button onClick={() => setIsMobileSearchOpen(true)} className="flex flex-col items-center p-2 w-1/4 text-slate-500 active:text-sky-600">
                    <SearchIcon className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Buscar</span>
                </button>

                <button onClick={handleIrParaPerfil} className="flex flex-col items-center p-2 w-1/4 text-slate-500 active:text-sky-600">
                    {isLoadingProfile ? <SpinnerIcon className="w-5 h-5 mb-0.5 text-sky-500" /> : <UserIcon className="w-5 h-5 mb-0.5" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
                </button>

                <button onClick={handleAbrirFavoritos} className={`flex flex-col items-center p-2 w-1/4 relative transition-colors ${isCoraçãoAtivo ? 'text-rose-500 active:text-rose-600' : 'text-slate-500 active:text-rose-500'}`}>
                    {isLoadingFav ? <SpinnerIcon className="w-5 h-5 mb-0.5 text-rose-500" /> : <HeartIcon isFilled={isCoraçãoAtivo} className={`w-5 h-5 mb-0.5`} />}
                    {isCoraçãoAtivo && (
                        <span className={`absolute top-1 right-6 ${configLojista.cores.badgeFavBg} text-white text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white`}>
                            {favoritesCount}
                        </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fav</span>
                </button>

                <button onClick={handleAbrirCarrinho} className="flex flex-col items-center p-2 w-1/4 text-slate-500 active:text-sky-600 relative">
                    {isLoadingCart ? <SpinnerIcon className="w-5 h-5 mb-0.5 text-sky-500" /> : <CartIcon className="w-5 h-5 mb-0.5" />}
                    {cartCount > 0 && (
                        <span className={`absolute top-1 right-6 ${configLojista.cores.badgeCartBg} text-white text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white`}>
                            {cartCount}
                        </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">Cart</span>
                </button>
            </nav>

            {/* MODAL DE PESQUISA MOBILE */}
            <AnimatePresence>
                {isMobileSearchOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} 
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 bg-white z-[60] flex flex-col"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-center p-4 border-b border-slate-100 bg-slate-50 pt-safe shadow-sm">
                            <form className="relative flex-1" onSubmit={e => e.preventDefault()}>
                                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="search" 
                                    value={termoPesquisa} 
                                    onChange={handleSearchChange} 
                                    className="w-full bg-white border border-slate-200 rounded-full py-3 pl-10 pr-4 outline-none text-sm text-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 font-medium" 
                                    placeholder="O que você procura?" 
                                    autoFocus
                                />
                            </form>
                            <button onClick={() => setIsMobileSearchOpen(false)} className="ml-3 text-sky-600 text-xs font-bold uppercase tracking-widest p-2">Sair</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-white">
                            {termoPesquisa.length > 2 ? (
                                isFetchingSearch ? (
                                    <div className="flex justify-center py-10"><SpinnerIcon className="w-6 h-6 text-slate-400"/></div>
                                ) : resultadosPesquisa.length > 0 ? (
                                    resultadosPesquisa.map((prod) => (
                                        <div key={prod.id} onClick={() => { navigate(`/produto/${prod.id}`); setIsMobileSearchOpen(false); setTermoPesquisa(""); }} className="flex items-center gap-3 p-3 border-b border-slate-100 active:bg-slate-50 cursor-pointer">
                                            <img src={prod.img || 'https://via.placeholder.com/40'} alt="" className="w-12 h-12 object-cover rounded-xl mix-blend-multiply border border-slate-100" />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-xs font-bold text-slate-800 truncate">{prod.nome}</span>
                                                <span className="text-xs text-sky-600 font-black mt-0.5">R$ {parseFloat(prod.preco_promo || prod.preco).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-xs py-10 font-bold uppercase tracking-widest">Sem resultados.</p>
                                )
                            ) : (
                                <p className="text-slate-400 text-xs text-center py-8 font-bold uppercase tracking-widest">Digite para pesquisar...</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;