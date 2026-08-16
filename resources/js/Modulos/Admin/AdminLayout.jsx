// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminLayout.jsx
// PAINEL ADMINISTRATIVO: Layout Premium Clean (Soft Light Mode)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, ShoppingCart, Users, Star } from 'lucide-react';
import AdminLogin from './AdminLogin'; // IMPORTAÇÃO DA TELA DE LOGIN

// =========================================================
// ÍCONES SVG NATIVOS (Clean & Minimalistas)
// =========================================================
const Icons = {
    Star: ({ className }) => <Star className={className} strokeWidth={2} />,
    Dashboard: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Relatorios: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    Orders: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    Faturamento: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Products: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Categorias: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    Estoque: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>,
    Calculator: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Customers: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Afiliados: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    Marketing: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A2.001 2.001 0 016 12h5a2 2 0 012 2v3.5a2 2 0 01-2 2H6c-.53 0-1.04-.21-1.414-.586l-1.414-1.414A2 2 0 013 16.293V15c0-.53.21-1.04.586-1.414z" /></svg>,
    Vitrine: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    Config: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Logout: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    Menu: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    Close: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Search: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Bell: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    Globe: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    ChevronLeft: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
    UserCircle: ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

// CSS Customizado para a Scrollbar do Menu (Sem setas, cinza claro, azul no hover)
const ScrollbarStyle = () => (
    <style dangerouslySetInnerHTML={{__html: `
        .sidebar-scroll::-webkit-scrollbar { width: 5px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; transition: background 0.3s ease; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #3B82F6; } 
        .sidebar-scroll::-webkit-scrollbar-thumb:active { background: #2563EB; }
        .sidebar-scroll::-webkit-scrollbar-button { display: none; } 
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
    `}} />
);

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Estados do Layout
    const [token, setToken] = useState(localStorage.getItem('hub_admin_token'));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Estado de encolher menu
    
    // Refresh Key para Forçar Remontagem e Atualização dos Dados
    const [refreshKey, setRefreshKey] = useState(Date.now());
    
    // Fechar menu mobile ao trocar de rota
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Estado para a Logo do Painel (Pode ser atualizada via API futuramente)
    const [logoUrl, setLogoUrl] = useState(null); 

    // =========================================================
    // ESTRUTURA DO MENU COMPLETO E CATEGORIZADO
    // =========================================================
    const menuGroups = [
        {
            title: "Visão Geral",
            items: [
                { label: 'Dashboard', path: '/admin', icon: Icons.Dashboard, exact: true },
                { label: 'Relatórios', path: '/admin/relatorios', icon: Icons.Relatorios },
            ]
        },
        {
            title: "Vendas",
            items: [
                { label: 'Pedidos', path: '/admin/pedidos', icon: Icons.Orders },
                { label: 'Faturamento', path: '/admin/faturamento', icon: Icons.Faturamento },
            ]
        },
        {
            title: "Catálogo",
            items: [
                { label: 'Produtos', path: '/admin/produtos', icon: Icons.Products },
                { label: 'Categorias', path: '/admin/categorias', icon: Icons.Categorias },
                { label: 'Precificadora', path: '/admin/precificadora', icon: Icons.Calculator }, // NOVO ITEM AQUI
                { label: 'Estoque', path: '/admin/estoque', icon: Icons.Estoque },
            ]
        },
        {
            title: "Pessoas",
            items: [
                { label: 'Clientes', path: '/admin/clientes', icon: Icons.Customers },
                { label: 'Afiliados', path: '/admin/afiliados', icon: Icons.Afiliados },
                { label: 'Avaliações', path: '/admin/avaliacoes', icon: Icons.Star } 
            ]
        },
        {
            title: "Marketing",
            items: [
                { label: 'Campanhas', path: '/admin/marketing', icon: Icons.Marketing },
                { label: 'Vitrine da Loja', path: '/admin/vitrine', icon: Icons.Vitrine },
            ]
        },
        {
            title: "Sistema",
            items: [
                { label: 'Configurações', path: '/admin/configuracoes', icon: Icons.Config },
            ]
        }
    ];

    const isPathActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    const handleLogout = () => {
        localStorage.removeItem('hub_admin_token');
        setToken(null);
        navigate('/admin');
    };

    const handleMenuClick = () => {
        // Atualiza a key forçando o React Router e os componentes filhos a buscarem os dados mais recentes
        setRefreshKey(Date.now());
        setIsMobileMenuOpen(false);
    };

    // PROTEÇÃO GLOBAL DE ROTAS (Segurança Master)
    if (!token) {
        return <AdminLogin onLoginSuccess={(newToken) => {
            localStorage.setItem('hub_admin_token', newToken);
            setToken(newToken);
        }} />;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
            <ScrollbarStyle />
            
            {/* ========================================================= */}
            {/* 1. SIDEBAR DESKTOP & MOBILE                               */}
            {/* ========================================================= */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-sm flex flex-col h-full 
                transform transition-all duration-300 ease-in-out md:static md:translate-x-0 md:flex-shrink-0
                ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
                ${!isMobileMenuOpen ? (isSidebarCollapsed ? 'md:w-20' : 'md:w-64') : 'w-64'}
            `}>
                
                {/* Botão de Encolher/Expandir (Visível só no Desktop) */}
                <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-400 hover:text-blue-600 hover:border-blue-300 z-50 hidden md:flex transition-colors"
                >
                    {isSidebarCollapsed ? <Icons.ChevronRight className="w-4 h-4"/> : <Icons.ChevronLeft className="w-4 h-4"/>}
                </button>

                {/* Logo & Marca (Topo da Sidebar) */}
                <div className={`h-16 flex items-center px-5 border-b border-slate-100 flex-shrink-0 overflow-hidden ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
                    <div className={`flex items-center w-full ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                        {/* Imagem Customizada ou 'H' Padrão */}
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-contain flex-shrink-0" />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-sm flex-shrink-0">
                                H
                            </div>
                        )}
                        
                        <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                            <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">HUB Commerce</h1>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">Admin Premium</span>
                        </div>
                    </div>
                    {/* Botão fechar mobile */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400 hover:bg-slate-100 rounded-md">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>

                {/* Corpo do Menu com a Scrollbar Customizada */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll p-4 space-y-6">
                    {menuGroups.map((group, index) => (
                        <div key={index}>
                            <h3 className={`px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 transition-all duration-300 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden mb-0 text-center' : 'opacity-100'}`}>
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isPathActive(item);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            title={isSidebarCollapsed ? item.label : ""} // Mostra tooltip nativo ao passar o mouse se estiver encolhido
                                            onClick={handleMenuClick}
                                            className={`
                                                flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                                ${isSidebarCollapsed ? 'justify-center px-0 mx-auto w-12' : 'px-3'}
                                                ${active 
                                                    ? 'bg-blue-50/80 text-blue-700 shadow-sm border border-blue-100' 
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                                                }
                                            `}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
                                            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                                {item.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rodapé da Sidebar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
                    <a 
                        href="/" 
                        target="_blank" 
                        title="Ver Loja Online"
                        rel="noopener noreferrer" 
                        className={`flex items-center gap-2 w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-colors overflow-hidden ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-center px-3'}`}
                    >
                        <Icons.Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                            Ver Loja Online
                        </span>
                    </a>
                </div>
            </aside>

            {/* Overlay Mobile */}
            {isMobileMenuOpen && (
                <div 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
                />
            )}

            {/* ========================================================= */}
            {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (Header + Páginas)          */}
            {/* ========================================================= */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
                
                {/* Header Superior Premium Clean */}
                <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 flex items-center justify-between z-20">
                    
                    {/* Botão Menu Mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 mr-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                    >
                        <Icons.Menu className="w-5 h-5" />
                    </button>

                    {/* Barra de Busca (Desktop) */}
                    <div className="hidden md:flex items-center w-96 relative">
                        <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Buscar pedidos, clientes, produtos..." 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                    </div>

                    {/* Ações da Direita */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                        
                        {/* Notificações */}
                        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                            <Icons.Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                        {/* Dropdown de Perfil */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none pr-2"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs border border-blue-200">
                                    AD
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-semibold text-slate-700 leading-tight">Administrador</p>
                                    {/* Link Direto no botão de texto para o painel de perfil */}
                                    <Link to="/admin/perfil" onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(false); }} className="text-[11px] text-blue-500 font-medium hover:underline">
                                        Ver perfil
                                    </Link>
                                </div>
                                <svg className="w-4 h-4 text-slate-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50 animate-fadeIn">
                                    <div className="px-4 py-2 border-b border-slate-100 mb-1 lg:hidden">
                                        <p className="text-sm font-semibold text-slate-800">Administrador</p>
                                        <p className="text-xs text-slate-500">admin@hubcommerce.com</p>
                                    </div>
                                    
                                    {/* Botão preparado para a página de perfil */}
                                    <Link 
                                        to="/admin/perfil" 
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        <Icons.UserCircle className="w-4 h-4" /> Meu Perfil
                                    </Link>

                                    <Link 
                                        to="/admin/configuracoes" 
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        <Icons.Config className="w-4 h-4" /> Configurações
                                    </Link>
                                    
                                    <div className="border-t border-slate-100 mt-1 pt-1">
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                                        >
                                            <Icons.Logout className="w-4 h-4" /> Sair do Painel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ========================================================= */}
                {/* 3. OUTLET (Onde as páginas carregam dinamicamente)        */}
                {/* ========================================================= */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
                    {/* Renderiza os componentes filhos. O atributo 'key' garante o refetch visual ao trocar de tela no menu lateral. */}
                    {children || <Outlet key={refreshKey} />}
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;