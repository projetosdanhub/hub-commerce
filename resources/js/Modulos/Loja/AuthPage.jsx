// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/AuthPage.jsx
// ARQUITETURA: Login/Registo Transitivo com Framer Motion e "Lembrar-me"
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// --- ÍCONES SVG ---
const Icons = {
    Mail: () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Lock: () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    User: () => <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Spinner: () => <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

const AuthPage = () => {
    const navigate = useNavigate();
    
    // --- ESTADOS DA INTERFACE ---
    // isLogin === true mostra o formulário de Entrar. false mostra o de Registo.
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // --- ESTADOS DO FORMULÁRIO ---
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [lembrarMe, setLembrarMe] = useState(false);

    // Efeito para carregar dados salvos ao iniciar a página
    useEffect(() => {
        const emailSalvo = localStorage.getItem('hub_saved_email');
        if (emailSalvo) {
            setEmail(emailSalvo);
            setLembrarMe(true);
        }
    }, []);

    // --- HANDLERS DE SUBMISSÃO ---
    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Lógica de "Lembrar de Mim" (Guarda o e-mail no LocalStorage)
        if (lembrarMe) {
            localStorage.setItem('hub_saved_email', email);
        } else {
            localStorage.removeItem('hub_saved_email');
        }

        // Simulação de chamada à API com Delay Mágico de UX
        setTimeout(() => {
            setIsLoading(false);
            // Salva a sessão simulada
            localStorage.setItem('hub_session_time', Date.now().toString());
            // Se o e-mail for do lojista, redireciona para o admin, senão para o perfil
            if (email.includes('admin')) {
                navigate('/admin');
            } else {
                navigate('/perfil');
            }
        }, 1500);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert("Conta criada com sucesso! Ganhou +50 HUB Coins.");
            setIsLogin(true); // Redireciona para o login após o registo
        }, 1500);
    };

    // Variantes de Animação para o Painel Deslizante (Desktop)
    const overlayVariants = {
        login: { x: '0%', borderRadius: '0 24px 24px 0' },
        register: { x: '-100%', borderRadius: '24px 0 0 24px' }
    };

    const textVariants = {
        login: { opacity: 1, x: 0 },
        register: { opacity: 0, x: -50 }
    };

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-4 selection:bg-sky-100">
            <Helmet>
                <title>{isLogin ? 'Entrar' : 'Criar Conta'} | HUB Commerce</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            {/* Botão de Voltar Opcional */}
            <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
                <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <Icons.ArrowLeft /> Voltar à Loja
                </Link>
            </div>

            {/* CONTAINER PRINCIPAL (Cartão com largura máxima) */}
            <div className="relative w-full max-w-4xl h-[650px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex shadow-sky-900/10 border border-gray-100">
                
                {/* ======================================================== */}
                {/* 1. PAINEL DE LOGIN (Fica à Esquerda por padrão)           */}
                {/* ======================================================== */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isLogin ? 'opacity-100 z-20' : 'opacity-0 z-0 pointer-events-none md:translate-x-full'}`}>
                    <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col items-center text-center">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Bem-vindo de volta</h2>
                        <p className="text-sm text-gray-500 mb-8">Insira os seus dados para aceder à sua conta.</p>

                        <div className="w-full space-y-4 mb-6">
                            <div className="relative flex items-center">
                                <Icons.Mail />
                                <input 
                                    type="email" 
                                    placeholder="O seu e-mail" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3.5 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-200 outline-none transition-all absolute inset-0 pl-12" 
                                />
                            </div>
                            <div className="relative flex items-center mt-4">
                                <Icons.Lock />
                                <input 
                                    type="password" 
                                    placeholder="Palavra-passe" 
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3.5 focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-200 outline-none transition-all absolute inset-0 pl-12" 
                                />
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between mb-8 mt-12 px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative w-4 h-4 flex items-center justify-center rounded border border-gray-300 group-hover:border-sky-500 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={lembrarMe}
                                        onChange={(e) => setLembrarMe(e.target.checked)}
                                        className="appearance-none absolute inset-0 w-full h-full cursor-pointer peer" 
                                    />
                                    {lembrarMe && <svg className="w-3 h-3 text-sky-500 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                                <span className="text-xs font-semibold text-gray-600 group-hover:text-sky-600 transition-colors">Lembrar de mim</span>
                            </label>
                            <a href="#" className="text-xs font-bold text-sky-600 hover:underline">Esqueceu a senha?</a>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#111827] text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <><Icons.Spinner /> A Entrar...</> : 'Entrar na Conta'}
                        </button>

                        {/* Apenas visível em Mobile (substitui o painel animado) */}
                        <div className="mt-8 md:hidden text-sm text-gray-500">
                            Ainda não tem conta? <button type="button" onClick={() => setIsLogin(false)} className="font-bold text-sky-600">Criar agora</button>
                        </div>
                    </form>
                </div>

                {/* ======================================================== */}
                {/* 2. PAINEL DE REGISTO (Fica à Direita por padrão)          */}
                {/* ======================================================== */}
                <div className={`absolute top-0 right-0 w-full md:w-1/2 h-full flex items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${!isLogin ? 'opacity-100 z-20 md:-translate-x-full' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <form onSubmit={handleRegister} className="w-full max-w-sm flex flex-col items-center text-center">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Criar Nova Conta</h2>
                        <p className="text-sm text-gray-500 mb-8">Junte-se a nós e comece a ganhar HUB Coins hoje.</p>

                        <div className="w-full space-y-4 mb-8">
                            <div className="relative flex items-center">
                                <Icons.User />
                                <input type="text" placeholder="O seu Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3.5 focus:border-sky-500 outline-none transition-all absolute inset-0 pl-12" />
                            </div>
                            <div className="relative flex items-center mt-4">
                                <Icons.Mail />
                                <input type="email" placeholder="O seu melhor E-mail" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3.5 focus:border-sky-500 outline-none transition-all absolute inset-0 pl-12" />
                            </div>
                            <div className="relative flex items-center mt-4">
                                <Icons.Lock />
                                <input type="password" placeholder="Crie uma Palavra-passe forte" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-3.5 focus:border-sky-500 outline-none transition-all absolute inset-0 pl-12" />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-sky-600 text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-sky-600/30 hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <><Icons.Spinner /> A Criar...</> : 'Criar Conta e Ganhar +50 Coins'}
                        </button>

                        {/* Apenas visível em Mobile */}
                        <div className="mt-8 md:hidden text-sm text-gray-500">
                            Já possui uma conta? <button type="button" onClick={() => setIsLogin(true)} className="font-bold text-sky-600">Entrar aqui</button>
                        </div>
                    </form>
                </div>

                {/* ======================================================== */}
                {/* 3. PAINEL DE OVERLAY ANIMADO (O que desliza por cima)     */}
                {/* Apenas visível em Ecrãs Grandes (md:block)                */}
                {/* ======================================================== */}
                <motion.div 
                    className="hidden md:block absolute top-0 right-0 w-1/2 h-full z-50 bg-gradient-to-br from-[#111827] via-slate-800 to-sky-900 shadow-2xl overflow-hidden"
                    variants={overlayVariants}
                    initial="login"
                    animate={isLogin ? "login" : "register"}
                    transition={{ type: "spring", stiffness: 60, damping: 14 }}
                >
                    {/* Elementos Decorativos de Fundo */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-transparent to-transparent"></div>
                    
                    <div className="w-full h-full flex items-center justify-center text-white text-center p-12 relative z-10">
                        
                        {/* Conteúdo que aparece quando está no formulário de Login */}
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div 
                                    key="overlay-login"
                                    initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-4xl font-black mb-4">Ainda não é Cliente?</h2>
                                    <p className="text-slate-300 font-medium text-sm leading-relaxed mb-8 max-w-[280px]">
                                        Registe-se em menos de 1 minuto, acumule HUB Coins e tenha acesso a descontos exclusivos da loja.
                                    </p>
                                    <button 
                                        onClick={() => setIsLogin(false)}
                                        className="border-2 border-white/30 bg-white/10 hover:bg-white hover:text-slate-900 font-bold px-10 py-3.5 rounded-full transition-all tracking-wide"
                                    >
                                        Criar a Minha Conta
                                    </button>
                                </motion.div>
                            ) : (
                                /* Conteúdo que aparece quando está no formulário de Registo */
                                <motion.div 
                                    key="overlay-register"
                                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-4xl font-black mb-4">Já é Cliente VIP?</h2>
                                    <p className="text-slate-300 font-medium text-sm leading-relaxed mb-8 max-w-[280px]">
                                        Que bom tê-lo de volta! Faça o login para aceder ao seu painel de encomendas, cupons e histórico.
                                    </p>
                                    <button 
                                        onClick={() => setIsLogin(true)}
                                        className="border-2 border-white/30 bg-white/10 hover:bg-white hover:text-slate-900 font-bold px-10 py-3.5 rounded-full transition-all tracking-wide"
                                    >
                                        Fazer Login
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default AuthPage;