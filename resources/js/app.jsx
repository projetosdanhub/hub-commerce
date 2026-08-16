// ============================================================================
// FICHEIRO: resources/js/app.jsx
// ARQUITETURA DEFINITIVA: Global Layout com Modais Sobrepostos Corretamente
// ============================================================================

import './bootstrap';
import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';

// --- IMPORTAÇÃO DOS COMPONENTES DA LOJA ---
import Header from './Modulos/Loja/Header';
import Footer from './Modulos/Loja/Footer';
import ProductQuickView from './Modulos/Loja/ProductQuickView';
import SideCart from './Modulos/Loja/SideCart';
import SideFavorites from './Modulos/Loja/SideFavorites';

// --- IMPORTAÇÃO DAS PÁGINAS DA LOJA ---
import HomePage from './Modulos/Loja/HomePage';
import ProductDetail from './Modulos/Loja/ProductDetail';
import CartPage from './Modulos/Loja/CartPage';
import PerfilPage from './Modulos/Loja/PerfilPage';
import AfiliadosDashboard from './Modulos/Loja/AfiliadosDashboard';
import AuthPage from './Modulos/Loja/AuthPage';

// --- IMPORTAÇÃO DOS MÓDULOS ADMIN ---
import AdminLayout from './Modulos/Admin/AdminLayout';
import AdminOrders from './Modulos/Admin/AdminOrders';
import AdminCategories from './Modulos/Admin/AdminCategories';
import AdminProducts from './Modulos/Admin/AdminProducts';
import AdminMarketing from './Modulos/Admin/AdminMarketing';
import AdminCustomers from './Modulos/Admin/AdminCustomers';
import AdminAfiliados from './Modulos/Admin/AdminAfiliados';
import AdminVitrine from './Modulos/Admin/AdminVitrine';
import AdminConfig from './Modulos/Admin/AdminConfig';
import AdminAvaliacoes from './Modulos/Admin/AdminAvaliacoes';
import AdminLogin from './Modulos/Admin/AdminLogin';

// Mocks Temporários
const CategoryPage = () => <div className="p-20 text-center text-2xl font-bold">Página de Categoria / Departamentos</div>;
const CheckoutPage = () => <div className="p-20 text-center text-2xl font-bold">Página de Checkout Oficial (Em Breve)</div>;


// ============================================================================
// O ESTRUTURADOR MESTRE: AppContent (Gerencia Layout Global e Estado)
// ============================================================================
const AppContent = () => {
    const location = useLocation();
    
    // O sistema oculta o Header/Footer se estivermos no painel administrativo ou na tela de login
    const isAdmin = location.pathname.startsWith('/admin');
    const isLoginStore = location.pathname === '/login';
    const hideLayout = isAdmin || isLoginStore;

    // --- 1. ESTADO GLOBAL DO CARRINHO (MEMÓRIA LOCALSTORAGE) ---
    const [cartItems, setCartItems] = useState(() => {
        try {
            const items = window.localStorage.getItem('hubcommerce_cart');
            return items ? JSON.parse(items) : [];
        } catch (e) { return []; }
    });

    useEffect(() => {
        window.localStorage.setItem('hubcommerce_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- 2. ESTADO GLOBAL DOS FAVORITOS (MEMÓRIA LOCALSTORAGE) ---
    const [favoritos, setFavoritos] = useState(() => {
        try {
            const favs = window.localStorage.getItem('hubcommerce_favs');
            return favs ? JSON.parse(favs) : [];
        } catch (e) { return []; }
    });

    useEffect(() => {
        window.localStorage.setItem('hubcommerce_favs', JSON.stringify(favoritos));
    }, [favoritos]);

    // --- 3. GESTÃO DE SESSÃO 24 HORAS ---
    useEffect(() => {
        const lastSession = localStorage.getItem('hub_session_time');
        const now = Date.now();
        if (lastSession && (now - parseInt(lastSession)) > 86400000) {
            localStorage.removeItem('hub_session_time');
        } else {
            localStorage.setItem('hub_session_time', now.toString());
        }
    }, [location.pathname]);

    // --- 4. ESTADOS DOS MODAIS GLOBAIS ---
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [showCartNotification, setShowCartNotification] = useState(false);
    const [ultimoAdicionado, setUltimoAdicionado] = useState(null);
    const [quickViewProdutoId, setQuickViewProdutoId] = useState(false);

    // --- 5. FUNÇÕES CORE (ORQUESTRAÇÃO) ---
    const handleOpenQuickView = (id) => setQuickViewProdutoId(id);
    const handleCloseQuickView = () => setQuickViewProdutoId(false);

    const adicionarAoCarrinho = (produto, quantidade = 1) => {
        setQuickViewProdutoId(false); 
        setIsFavoritesOpen(false);    
        
        setCartItems(prev => {
            const existe = prev.find(item => item.id === produto.id);
            if (existe) {
                return prev.map(item => item.id === produto.id ? { ...item, quantidade: (Number(item.quantidade) || 1) + quantidade } : item);
            }
            return [{ ...produto, quantidade, isFavorito: false }, ...prev];
        });

        setUltimoAdicionado(produto);
        setIsCartOpen(true);
        setShowCartNotification(true);

        setTimeout(() => setShowCartNotification(false), 3500);
    };

    const handleRemoverFavorito = (id) => {
        setFavoritos(prev => prev.filter(item => item.id !== id));
    };

    const handleMoverParaCarrinho = (produto) => {
        handleRemoverFavorito(produto.id); 
        adicionarAoCarrinho(produto, 1); 
    };

    const totalItems = cartItems.reduce((acc, item) => acc + (Number(item.quantidade) || 1), 0);

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFCFD] overflow-x-clip relative">
            
            {/* ======================================================= */}
            {/* CONFIGURAÇÃO DE SEO E TÍTULOS GLOBAIS (HELMET PADRÃO)    */}
            {/* ======================================================= */}
            <Helmet>
                <title>HUB Commerce</title>
                <meta name="description" content="A sua loja virtual completa, segura e de alto desempenho." />
            </Helmet>

            {/* ======================================================= */}
            {/* CABEÇALHO GLOBAL (RENDERIZADO PRIMEIRO)                  */}
            {/* ======================================================= */}
            {!hideLayout && (
                <Header 
                    cartCount={totalItems} 
                    onCartClick={() => setIsCartOpen(true)}
                    favoritesCount={favoritos.length}
                    onFavoritesClick={() => setIsFavoritesOpen(true)}
                    isLogado={true}
                />
            )}

            {/* ======================================================= */}
            {/* CONTEÚDO DINÂMICO DE CADA PÁGINA (Roteamento)           */}
            {/* ======================================================= */}
            <main className="flex-grow w-full relative z-10">
                <Routes>
                    {/* ROTAS PÚBLICAS DA LOJA */}
                    <Route path="/" element={<HomePage onOpenQuickView={handleOpenQuickView} />} />
                    <Route path="/produto/:id" element={<ProductDetail onAddCart={adicionarAoCarrinho} onOpenQuickView={handleOpenQuickView} />} />
                    <Route path="/carrinho" element={<CartPage cartItems={cartItems} setCartItems={setCartItems} onOpenCart={() => setIsCartOpen(true)} favoritesCount={favoritos.length} onOpenFavorites={() => setIsFavoritesOpen(true)} />} />
                    <Route path="/perfil" element={<PerfilPage cartCount={totalItems} onOpenCart={() => setIsCartOpen(true)} favoritesCount={favoritos.length} onOpenFavorites={() => setIsFavoritesOpen(true)} />} />
                    <Route path="/afiliados" element={<AfiliadosDashboard cartCount={totalItems} onOpenCart={() => setIsCartOpen(true)} favoritesCount={favoritos.length} onOpenFavorites={() => setIsFavoritesOpen(true)} />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/categoria/:slug" element={<CategoryPage />} />
                    <Route path="/login" element={<AuthPage />} />

                    {/* ROTAS DO HUB ADMIN */}
                    {/* Usando rotas aninhadas (v6) para tirar proveito total do <Outlet /> no AdminLayout */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<div className="p-8 text-slate-500">Dashboard Geral (Em construção)</div>} />
                        <Route path="pedidos" element={<AdminOrders />} />
                        <Route path="categorias" element={<AdminCategories />} />
                        <Route path="produtos" element={<AdminProducts />} />
                        <Route path="marketing" element={<AdminMarketing />} />
                        <Route path="clientes" element={<AdminCustomers />} />
                        <Route path="afiliados" element={<AdminAfiliados />} />
                        <Route path="vitrine" element={<AdminVitrine />} />
                        <Route path="configuracoes" element={<AdminConfig />} />
                        <Route path="avaliacoes" element={<AdminAvaliacoes />} />
                    </Route>
                    
                    {/* Login do Admin (Fica fora do Layout) */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                </Routes>
            </main>

            {/* ======================================================= */}
            {/* RODAPÉ GLOBAL                                           */}
            {/* ======================================================= */}
            {!hideLayout && <Footer />}

            {/* ========================================================================= */}
            {/* MODAIS GLOBAIS DA RAIZ (RENDERIZADOS NO FIM PARA SOBREPOR TUDO O RESTO)   */}
            {/* ========================================================================= */}
            <SideCart 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
                showNotification={showCartNotification} 
                ultimoAdicionado={ultimoAdicionado} 
                isLogado={true} 
            />

            <SideFavorites 
                isOpen={isFavoritesOpen} 
                onClose={() => setIsFavoritesOpen(false)} 
                favoritos={favoritos} 
                onRemoverFavorito={handleRemoverFavorito} 
                onMoverParaCarrinho={handleMoverParaCarrinho} 
                onOpenQuickView={handleOpenQuickView} 
            />

            <ProductQuickView 
                isOpen={quickViewProdutoId !== false} 
                produtoId={quickViewProdutoId} 
                onClose={handleCloseQuickView} 
                onAddCart={adicionarAoCarrinho} 
            />
            
        </div>
    );
};

// ============================================================================
// PONTO DE ENTRADA DO REACT (O HelmetProvider "liga" a funcionalidade para toda a app)
// ============================================================================
const App = () => (
    <HelmetProvider>
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    </HelmetProvider>
);

// ============================================================================
// INICIALIZAÇÃO SEGURA DO REACT 18+ (Correção do HMR Warning do Vite)
// ============================================================================
const rootElement = document.getElementById('app');

if (rootElement) {
    if (!rootElement._reactRoot) {
        rootElement._reactRoot = createRoot(rootElement);
    }
    rootElement._reactRoot.render(<App />);
}