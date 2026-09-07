// ============================================================================
// FICHEIRO: resources/js/app.jsx
// ARQUITETURA DEFINITIVA: Global Layout com Modais, Tracking e UTMs
// ============================================================================

import './bootstrap';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';

// --- IMPORTAÇÃO DO MOTOR DE TRACKING E API ---
import { 
    initTracking, trackPageView, trackViewItem, trackAddToCart, 
    trackBeginCheckout, trackAddPaymentInfo, trackPurchase 
} from './tracking';
import api from './api';

// --- IMPORTAÇÃO DOS COMPONENTES DA LOJA ---
import Cabecalho from './Modulos/Loja/Cabecalho';
import Rodape from './Modulos/Loja/Rodape';
import VisualizacaoRapidaProduto from './Modulos/Loja/VisualizacaoRapidaProduto';
import CarrinhoLateral from './Modulos/Loja/CarrinhoLateral';
import FavoritosLateral from './Modulos/Loja/FavoritosLateral';

// --- IMPORTAÇÃO DAS PÁGINAS DA LOJA ---
import PaginaInicial from './Modulos/Loja/PaginaInicial';
import DetalheProduto from './Modulos/Loja/DetalheProduto';
import PaginaCarrinho from './Modulos/Loja/PaginaCarrinho';
import PaginaPerfil from './Modulos/Loja/PaginaPerfil';
import PainelAfiliados from './Modulos/Loja/PainelAfiliados';
import PaginaAutenticacao from './Modulos/Loja/PaginaAutenticacao';

// --- IMPORTAÇÃO DOS MÓDULOS ADMIN ---
import AdminLayout from './Modulos/Admin/AdminLayout';
import AdminDashboard from './Modulos/Admin/AdminDashboard';
import AdminOrders from './Modulos/Admin/AdminOrders';
import CategoriasPrincipal from './Modulos/Admin/Categorias/CategoriasPrincipal';
import MenusPrincipal from './Modulos/Admin/Menus/MenusPrincipal';
import AdminProducts from './Modulos/Admin/Produtos/ProdutosPrincipal';
import AdminMarketing from './Modulos/Admin/AdminMarketing';
import AdminCustomers from './Modulos/Admin/AdminCustomers';
import AdminAfiliados from './Modulos/Admin/AdminAfiliados';
import ConstrutorVitrinePrincipal from './Modulos/Admin/ConstrutorVitrine/ConstrutorVitrinePrincipal';
import ConfiguracoesPrincipal from './Modulos/Admin/Configuracoes/ConfiguracoesPrincipal';
import AdminAvaliacoes from './Modulos/Admin/AdminAvaliacoes';
import AdminLogin from './Modulos/Admin/AdminLogin';
import AdminCarriers from './Modulos/Admin/AdminCarriers';
import AdminPixels from './Modulos/Admin/Pixels/PixelsPrincipal';

// Mocks Temporários
const PaginaCategoria = () => <div className="p-20 text-center text-2xl font-bold">Página de Categoria / Departamentos</div>;
const PaginaCheckout = () => <div className="p-20 text-center text-2xl font-bold">Página de Checkout Oficial (Em Breve)</div>;

// ============================================================================
// O ESTRUTURADOR MESTRE: AppContent (Gerencia Layout Global e Estado)
// ============================================================================
const AppContent = () => {
    const location = useLocation();
    
    // O sistema oculta o Header/Footer se estivermos no painel administrativo ou na tela de login
    const isAdmin = location.pathname.startsWith('/admin');
    const isLoginStore = location.pathname === '/login';
    const hideLayout = isAdmin || isLoginStore;

    // --- 0. INICIALIZAÇÃO E RASTREAMENTO GLOBAL (PIXEL / GA4 / UTMS) ---
    useEffect(() => {
        const setupTracking = async () => {
            try {
                const response = await api.get('/tracking');
                if (response.data && response.data.data) {
                    initTracking(response.data.data);
                }
            } catch (error) {
                console.warn("[Tracking] Bloqueado por AdBlock ou falha de rede.");
            }
        };
        
        // Só inicializa o rastreamento se o usuário estiver na loja pública
        if (!isAdmin) {
            setupTracking();
        }
    }, [isAdmin]);

    // Ouvinte de Mudança de Página (Dispara PageView dinâmico do React)
    useEffect(() => {
        if (!isAdmin) {
            // Pequeno delay para garantir que o React montou o DOM (melhora a precisão do GA4)
            const timeoutId = setTimeout(() => {
                trackPageView();
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [location.pathname, location.search, isAdmin]);

    // Ouvinte Global do Motor de Eventos Desacoplado
    useEffect(() => {
        if (isAdmin) return;

        const handleTrackingEvent = (e) => {
            const { event, data } = e.detail;
            switch(event) {
                case 'ViewContent':
                    trackViewItem({ price: data.value, item_id: data.content_ids?.[0] });
                    break;
                case 'AddToCart':
                    trackAddToCart({ price: data.value, item_id: data.content_ids?.[0] }, data.value);
                    break;
                case 'InitiateCheckout':
                    trackBeginCheckout({ value: data.value, items: data.content_ids?.map(id => ({item_id: id})) });
                    break;
                case 'AddPaymentInfo':
                    trackAddPaymentInfo('generic', { value: data.value });
                    break;
                case 'Purchase':
                    trackPurchase({ transaction_id: data.transaction_id, order_id: data.transaction_id, value: data.value }, {});
                    break;
            }
        };

        window.addEventListener('tracker:event', handleTrackingEvent);
        return () => window.removeEventListener('tracker:event', handleTrackingEvent);
    }, [isAdmin]);

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
                <Cabecalho 
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
                    <Route path="/" element={<PaginaInicial onOpenQuickView={handleOpenQuickView} />} />
                    <Route path="/produto/:id" element={<DetalheProduto onAddCart={adicionarAoCarrinho} onOpenQuickView={handleOpenQuickView} />} />
                    <Route path="/carrinho" element={<PaginaCarrinho cartItems={cartItems} setCartItems={setCartItems} onOpenCart={() => setIsCartOpen(true)} favoritesCount={favoritos.length} onOpenFavorites={() => setIsFavoritesOpen(true)} />} />
                    <Route path="/perfil" element={<PaginaPerfil cartCount={totalItems} onOpenCart={() => setIsCartOpen(true)} favoritesCount={favoritos.length} onOpenFavorites={() => setIsFavoritesOpen(true)} />} />
                    <Route path="/afiliados" element={<PainelAfiliados cartCount={totalItems} onOpenCart={() => setIsCartOpen(true)} favoritesCount={favoritos.length} onOpenFavorites={() => setIsFavoritesOpen(true)} />} />
                    <Route path="/checkout" element={<PaginaCheckout cartItems={cartItems} />} />
                    <Route path="/categoria/:slug" element={<PaginaCategoria />} />
                    <Route path="/login" element={<PaginaAutenticacao />} />

                    {/* ROTAS DO HUB ADMIN */}
                    {/* Usando rotas aninhadas (v6) para tirar proveito total do <Outlet /> no AdminLayout */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="pedidos" element={<AdminOrders />} />
                        <Route path="categorias" element={<CategoriasPrincipal />} />
                        <Route path="menus" element={<MenusPrincipal />} />
                        <Route path="produtos" element={<AdminProducts />} />
                        <Route path="marketing" element={<AdminMarketing />} />
                        <Route path="pixels" element={<AdminPixels />} />
                        <Route path="clientes" element={<AdminCustomers />} />
                        <Route path="afiliados" element={<AdminAfiliados />} />
                        <Route path="vitrine" element={<ConstrutorVitrinePrincipal />} />
                        <Route path="configuracoes" element={<ConfiguracoesPrincipal />} />
                        <Route path="avaliacoes" element={<AdminAvaliacoes />} />
                        <Route path="transportadoras" element={<AdminCarriers />} />
                        <Route path="estoque" element={<div className="p-8 text-slate-500">Módulo de Estoque (Em construção)</div>} />
                    </Route>
                    
                    {/* Login do Admin (Fica fora do Layout) */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                </Routes>
            </main>

            {/* ======================================================= */}
            {/* RODAPÉ GLOBAL                                           */}
            {/* ======================================================= */}
            {!hideLayout && <Rodape />}

            {/* ========================================================================= */}
            {/* MODAIS GLOBAIS DA RAIZ (RENDERIZADOS NO FIM PARA SOBREPOR TUDO O RESTO)   */}
            {/* ========================================================================= */}
            <CarrinhoLateral 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
                showNotification={showCartNotification} 
                ultimoAdicionado={ultimoAdicionado} 
                isLogado={true} 
            />

            <FavoritosLateral 
                isOpen={isFavoritesOpen} 
                onClose={() => setIsFavoritesOpen(false)} 
                favoritos={favoritos} 
                onRemoverFavorito={handleRemoverFavorito} 
                onMoverParaCarrinho={handleMoverParaCarrinho} 
                onOpenQuickView={handleOpenQuickView} 
            />

            <VisualizacaoRapidaProduto 
                isOpen={quickViewProdutoId !== false} 
                produtoId={quickViewProdutoId} 
                onClose={handleCloseQuickView} 
                onAddCart={adicionarAoCarrinho} 
            />
            
        </div>
    );
};

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

// ============================================================================
// PONTO DE ENTRADA DO REACT (O HelmetProvider "liga" a funcionalidade para toda a app)
// ============================================================================
const App = () => (
    <HelmetProvider>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </QueryClientProvider>
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