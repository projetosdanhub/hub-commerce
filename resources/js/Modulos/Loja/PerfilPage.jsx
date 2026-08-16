// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/PerfilPage.jsx
// ARQUITETURA: Dashboard Completo sem Header/Footer (Geridos pelo app.jsx)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// --- ÍCONES SVG ---
const Icons = {
    User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Map: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Bag: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    Coin: () => <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.98 7.375A2.5 2.5 0 0111.5 5h.025a2.5 2.5 0 012.49 2.125h-1.99a.5.5 0 00-.49-.125H11.5a.5.5 0 000 1h.025a2.5 2.5 0 010 5h-.025a2.5 2.5 0 01-2.49-2.125h1.99a.5.5 0 00.49.125h.01a.5.5 0 000-1H8.98a.5.5 0 000-1h1.5a1.5 1.5 0 100-3H8.98v-.625z" /></svg>,
    Check: () => <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
    Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    Spinner: () => <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Camera: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Pay: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Box: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Truck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
};

const PerfilPage = () => {
    const navigate = useNavigate();

    // --- ESTADOS NAVEGAÇÃO ---
    const [abaAtiva, setAbaAtiva] = useState('perfil');
    const [isLoadingAba, setIsLoadingAba] = useState(false);

    // --- ESTADOS DE DADOS DO CLIENTE ---
    const [perfil, setPerfil] = useState({
        nome: "Sócia Empreendedora", 
        email: "socia@hubcommerce.pt",
        cpf: "12345678900", 
        dataNasc: "1990-05-20", 
        sexo: "Feminino",
        telefone: "11999999999", 
        whatsapp: "11999999999",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
        moedas: 1250, 
        isCpfConfirmado: true, 
        isDataConfirmada: true
    });

    const [isSavingPerfil, setIsSavingPerfil] = useState(false);

    // --- ESTADOS DE ENDEREÇO (ViaCEP) ---
    const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });
    const [isLoadingCep, setIsLoadingCep] = useState(false);

    // --- ESTADOS DE SEGURANÇA (OTP) ---
    const [codigoOTP, setCodigoOTP] = useState(['', '', '', '', '', '']);

    // --- MOCKS DE PEDIDOS ---
    const pedidosMock = [
        { 
            id: "#HUB-9901", data: "15/08/2026", total: 415.90, status: "TRANSPORTE", 
            itens: [{ nome: "Auscultadores Premium", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100", qtd: 1 }] 
        },
        { 
            id: "#HUB-9884", data: "02/08/2026", total: 65.90, status: "ENTREGUE", avaliado: false,
            itens: [{ nome: "Caneca Mágica Personalizada", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100", qtd: 1 }] 
        }
    ];

    // Evita o scroll quebrado ao carregar
    useEffect(() => { 
        if (typeof window !== 'undefined') window.scrollTo(0, 0); 
    }, []);

    // --- HANDLERS E FUNÇÕES ---
    const mudarAba = (aba) => {
        if (abaAtiva === aba) return;
        setIsLoadingAba(true);
        setTimeout(() => { setAbaAtiva(aba); setIsLoadingAba(false); }, 350);
    };

    const handleLogout = () => { 
        localStorage.removeItem('hub_session_time'); 
        navigate('/'); 
    };

    // Máscaras de Segurança Visual (ex: ***.456.789-**)
    const mascaraOcultaCpf = (cpf) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "***.$2.$3-**");
    const mascaraOcultaData = (data) => "**/**/" + data.split('-')[0]; 

    // Upload de Imagem Seguro (2MB Max)
    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { alert("A imagem de perfil não pode ultrapassar 2MB."); return; }
            setPerfil(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
        }
    };

    // Integração ViaCEP
    const handleCepChange = async (e) => {
        const novoCep = e.target.value.replace(/\D/g, '');
        setEndereco(prev => ({ ...prev, cep: novoCep }));

        if (novoCep.length === 8) {
            setIsLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${novoCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setEndereco(prev => ({ ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }));
                } else {
                    alert("CEP não encontrado.");
                }
            } catch (error) { console.error("Erro", error); } 
            finally { setIsLoadingCep(false); }
        }
    };

    // Salvar Perfil Simulado
    const handleSalvarPerfil = (e) => {
        e.preventDefault();
        setIsSavingPerfil(true);
        setTimeout(() => { setIsSavingPerfil(false); alert("Perfil atualizado com sucesso!"); }, 1200);
    };

    // --- COMPONENTE INTERNO: PIPELINE DE PEDIDO ---
    const OrderPipeline = ({ statusAtual }) => {
        const steps = [
            { id: 'PAGAMENTO', label: 'Pagamento', icon: Icons.Pay },
            { id: 'SEPARACAO', label: 'Separação', icon: Icons.Box },
            { id: 'TRANSPORTE', label: 'Em Trânsito', icon: Icons.Truck },
            { id: 'ENTREGUE', label: 'Entregue', icon: Icons.Check }
        ];
        const currentIndex = steps.findIndex(s => s.id === statusAtual);

        return (
            <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto mt-6 mb-2">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700" style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}></div>
                {steps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;
                    const StepIcon = step.icon;
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-500 ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                <StepIcon />
                            </div>
                            <span className={`absolute top-12 text-[10px] font-bold text-center w-24 -ml-7 uppercase tracking-wider ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>{step.label}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full selection:bg-blue-100">
            <Helmet><title>Meu Perfil | HUB Commerce</title><meta name="robots" content="noindex, nofollow" /></Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full flex flex-col lg:flex-row gap-8">
                
                {/* ========================================================= */}
                {/* MENU LATERAL (SIDEBAR) */}
                {/* ========================================================= */}
                <aside className="w-full lg:w-[280px] flex-shrink-0">
                    <nav className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sticky top-28" aria-label="Menu de Utilizador">
                        
                        {/* Perfil Mini & Círculo Animado Verde */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                                    <motion.circle cx="32" cy="32" r="30" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
                                </svg>
                                <img src={perfil.avatar} alt="Seu Perfil" className="w-14 h-14 rounded-full object-cover z-10 border border-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Boas compras,</span>
                                <span className="font-bold text-gray-900 leading-tight truncate">{perfil.nome.split(' ')[0]}</span>
                            </div>
                        </div>

                        {/* Botões do Menu Lateral */}
                        <ul className="flex flex-col gap-2">
                            {[
                                { id: 'perfil', label: 'Meu Perfil', icon: Icons.User },
                                { id: 'enderecos', label: 'Meus Endereços', icon: Icons.Map },
                                { id: 'pedidos', label: 'Minhas Compras', icon: Icons.Bag },
                                { id: 'privacidade', label: 'Privacidade & Senha', icon: Icons.Lock },
                                { id: 'coins', label: 'HUB Coins', icon: Icons.Coin, badge: perfil.moedas }
                            ].map(item => (
                                <li key={item.id}>
                                    <button onClick={() => mudarAba(item.id)} className={`flex items-center w-full gap-3 p-3.5 rounded-xl font-semibold text-[13px] transition-all ${abaAtiva === item.id ? 'bg-sky-50 text-sky-600 shadow-sm border border-sky-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                        <item.icon /> {item.label}
                                        {item.badge && <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] py-0.5 px-2 rounded-full">{item.badge}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3.5 mt-6 rounded-xl font-semibold text-[13px] text-red-500 hover:bg-red-50 transition-colors">
                            <Icons.Logout /> Terminar Sessão
                        </button>
                    </nav>
                </aside>

                {/* ========================================================= */}
                {/* ÁREA DE CONTEÚDO PRINCIPAL (RENDERIZADOR DE ABAS) */}
                {/* ========================================================= */}
                <section className="flex-grow bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sm:p-10 relative overflow-hidden min-h-[600px]">
                    
                    {isLoadingAba && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                            <Icons.Spinner className="text-sky-500 w-8 h-8" />
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        
                        {/* ---------------------------------------------------- */}
                        {/* ABA 1: VISÃO GERAL / MEU PERFIL                      */}
                        {/* ---------------------------------------------------- */}
                        {abaAtiva === 'perfil' && (
                            <motion.div key="perfil" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Meu Perfil</h2>
                                
                                <form onSubmit={handleSalvarPerfil} className="flex flex-col gap-8">
                                    {/* Edição de Foto */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group w-20 h-20 rounded-full border border-gray-200 overflow-hidden cursor-pointer shadow-sm">
                                            <img src={perfil.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Icons.Camera /> <span className="text-[9px] font-bold mt-1">Alterar</span>
                                                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarUpload} />
                                            </label>
                                        </div>
                                        <div className="text-xs text-gray-500"><p>Ganha <strong className="text-orange-500">20 Coins</strong> ao enviar a foto.</p><p>Máximo: 2MB.</p></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label className="text-[12px] font-bold text-gray-700 mb-2 block">Nome Completo</label><input type="text" value={perfil.nome} onChange={(e) => setPerfil({...perfil, nome: e.target.value.replace(/[<>]/g, '')})} className="w-full bg-white border border-gray-200 rounded-xl px-4 h-12 text-sm focus:border-sky-400 outline-none transition-all" required /></div>
                                        <div><label className="text-[12px] font-bold text-gray-700 mb-2 block">E-mail</label><input type="email" value={perfil.email} disabled className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-sm text-gray-500 cursor-not-allowed" /></div>
                                        
                                        {/* Campos Trancados (Segurança Visual) */}
                                        <div>
                                            <label className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5">CPF {perfil.isCpfConfirmado && <span className="text-emerald-500"><Icons.Check /></span>}</label>
                                            <input type="text" value={perfil.isCpfConfirmado ? mascaraOcultaCpf(perfil.cpf) : perfil.cpf} disabled={perfil.isCpfConfirmado} className={`w-full border rounded-xl px-4 h-12 text-sm outline-none ${perfil.isCpfConfirmado ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900 cursor-not-allowed font-medium tracking-widest' : 'bg-white border-gray-200 focus:border-sky-400'}`} />
                                        </div>
                                        <div>
                                            <label className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5">Data de Nascimento {perfil.isDataConfirmada && <span className="text-emerald-500"><Icons.Check /></span>}</label>
                                            <input type="text" value={perfil.isDataConfirmada ? mascaraOcultaData(perfil.dataNasc) : perfil.dataNasc} disabled={perfil.isDataConfirmada} className={`w-full border rounded-xl px-4 h-12 text-sm outline-none ${perfil.isDataConfirmada ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900 cursor-not-allowed font-medium tracking-widest' : 'bg-white border-gray-200 focus:border-sky-400'}`} />
                                        </div>

                                        <div><label className="text-[12px] font-bold text-gray-700 mb-2 block">Telemóvel</label><input type="tel" value={perfil.telefone} onChange={(e) => setPerfil({...perfil, telefone: e.target.value.replace(/[<>]/g, '')})} className="w-full bg-white border border-gray-200 rounded-xl px-4 h-12 text-sm focus:border-sky-400 outline-none transition-all" /></div>
                                        <div><label className="text-[12px] font-bold text-gray-700 mb-2 block">WhatsApp</label><input type="tel" value={perfil.whatsapp} onChange={(e) => setPerfil({...perfil, whatsapp: e.target.value.replace(/[<>]/g, '')})} className="w-full bg-white border border-gray-200 rounded-xl px-4 h-12 text-sm focus:border-sky-400 outline-none transition-all" /></div>
                                    </div>
                                    
                                    <button type="submit" disabled={isSavingPerfil} className="bg-[#111827] text-white font-bold h-12 px-8 rounded-xl hover:bg-gray-800 transition-colors w-full md:w-auto self-end flex items-center justify-center gap-2">
                                        {isSavingPerfil ? 'A Guardar...' : 'Guardar Alterações'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* ABA 2: MINHAS COMPRAS (Pipeline & Avaliações)        */}
                        {/* ---------------------------------------------------- */}
                        {abaAtiva === 'pedidos' && (
                            <motion.div key="pedidos" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">As Minhas Compras</h2>
                                
                                <div className="flex overflow-x-auto gap-2 mb-8 pb-2 custom-scrollbar">
                                    {['Todos', 'A Pagar', 'Preparando', 'Em Trânsito', 'Entregue', 'Cancelado'].map(status => (
                                        <button key={status} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 whitespace-nowrap transition-colors">{status}</button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-6">
                                    {pedidosMock.map((pedido, i) => (
                                        <div key={i} className="border border-gray-200 rounded-[20px] p-5 hover:shadow-md transition-shadow bg-white">
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                    <span className="font-bold text-gray-900">{pedido.id}</span>
                                                    <span className="text-xs text-gray-400 font-medium">{pedido.data}</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wide ${pedido.status === 'ENTREGUE' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
                                                    {pedido.status}
                                                </span>
                                            </div>
                                            
                                            {/* Order Pipeline Component */}
                                            <div className="mb-10 mt-2 hidden sm:block">
                                                <OrderPipeline statusAtual={pedido.status} />
                                            </div>

                                            {pedido.itens.map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-xl">
                                                    <img src={item.img} alt={item.nome} className="w-16 h-16 rounded-xl object-cover border border-gray-100 mix-blend-multiply" />
                                                    <div className="flex flex-col flex-grow text-center sm:text-left">
                                                        <span className="text-sm font-bold text-gray-900">{item.nome}</span>
                                                        <span className="text-xs text-gray-500">Qtd: {item.qtd}</span>
                                                    </div>
                                                    
                                                    {/* Avaliar e Ganhar Coins */}
                                                    {pedido.status === 'ENTREGUE' && !pedido.avaliado && (
                                                        <button className="relative overflow-hidden bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md group/aval w-full sm:w-auto mt-2 sm:mt-0">
                                                            <div className="absolute inset-0 bg-orange-600 transform scale-x-0 origin-left group-hover/aval:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
                                                            <span className="relative z-10 flex items-center justify-center gap-2"><Icons.Coin /> Avaliar & Ganhar</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                                                <span className="text-sm font-medium text-gray-500 mr-2">Total do Pedido:</span>
                                                <span className="text-lg font-black text-gray-900 leading-none">R$ {pedido.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* ABA 3: MEUS ENDEREÇOS (ViaCEP Automático)            */}
                        {/* ---------------------------------------------------- */}
                        {abaAtiva === 'enderecos' && (
                            <motion.div key="enderecos" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Meus Endereços</h2>
                                
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Icons.Map /> Adicionar Novo Endereço</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div>
                                            <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">CEP</label>
                                            <div className="relative">
                                                <input type="text" maxLength={8} placeholder="00000-000" value={endereco.cep} onChange={handleCepChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 h-11 text-sm focus:border-sky-400 outline-none" />
                                                {isLoadingCep && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Icons.Spinner className="text-sky-500" /></div>}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Rua / Logradouro</label>
                                            <input type="text" value={endereco.rua} onChange={e=>setEndereco({...endereco, rua: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 h-11 text-sm outline-none" />
                                        </div>
                                        
                                        <div><label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Número</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 h-11 text-sm outline-none" /></div>
                                        <div><label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Complemento</label><input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-4 h-11 text-sm outline-none" /></div>
                                        <div><label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Bairro</label><input type="text" value={endereco.bairro} onChange={e=>setEndereco({...endereco, bairro: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 h-11 text-sm outline-none" /></div>
                                        
                                        <div className="md:col-span-2"><label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Cidade</label><input type="text" value={endereco.cidade} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 h-11 text-sm text-gray-500" /></div>
                                        <div><label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Estado (UF)</label><input type="text" value={endereco.estado} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 h-11 text-sm text-gray-500" /></div>
                                    </div>
                                    
                                    <button className="mt-5 bg-sky-600 text-white font-bold h-11 px-6 rounded-lg hover:bg-sky-700 transition-colors shadow-sm">Guardar Endereço Principal</button>
                                </div>
                            </motion.div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* ABA 4: PRIVACIDADE & SEGURANÇA (Sistema OTP 6D)      */}
                        {/* ---------------------------------------------------- */}
                        {abaAtiva === 'privacidade' && (
                            <motion.div key="privacidade" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Segurança da Conta</h2>
                                
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 max-w-xl">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Alterar a Palavra-passe</h3>
                                    <p className="text-xs text-gray-500 mb-6">Será enviado um código de 6 dígitos para o seu e-mail de registo para validar a operação de forma segura.</p>
                                    
                                    <div className="flex flex-col gap-4 mb-6">
                                        <input type="password" placeholder="Palavra-passe Atual" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-sm outline-none focus:border-sky-400 focus:bg-white" />
                                        <input type="password" placeholder="Nova Palavra-passe (Mínimo 8, 1 Maiúscula, 1 Número)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-sm outline-none focus:border-sky-400 focus:bg-white" />
                                        <input type="password" placeholder="Confirmar Nova Palavra-passe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-sm outline-none focus:border-sky-400 focus:bg-white" />
                                    </div>

                                    {/* Código OTP de E-mail */}
                                    <div className="bg-sky-50 rounded-xl p-5 mb-8 border border-sky-100">
                                        <label className="text-[11px] font-bold text-sky-800 uppercase tracking-widest mb-3 block text-center">Código OTP (Enviado por E-mail)</label>
                                        <div className="flex justify-center gap-2 sm:gap-3">
                                            {codigoOTP.map((digito, index) => (
                                                <input key={index} type="text" maxLength={1} value={digito} onChange={() => {}} className="w-10 h-12 sm:w-12 sm:h-14 bg-white border border-sky-200 rounded-lg text-center text-lg font-black text-sky-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all shadow-sm" />
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-center text-sky-600 mt-3">Expira em 04:59 <button className="underline font-bold ml-1">Reenviar</button></p>
                                    </div>

                                    <button className="w-full bg-[#111827] text-white font-bold h-14 rounded-xl hover:bg-gray-800 transition-colors shadow-md">Validar e Alterar Segurança</button>
                                </div>
                            </motion.div>
                        )}

                        {/* ---------------------------------------------------- */}
                        {/* ABA 5: HUB COINS (Gamificação)                       */}
                        {/* ---------------------------------------------------- */}
                        {abaAtiva === 'coins' && (
                            <motion.div key="coins" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 rounded-[20px] p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-orange-500/20 mb-8 relative overflow-hidden">
                                    <div className="absolute -right-10 -top-10 opacity-20"><Icons.Coin /></div>
                                    <div className="relative z-10 flex flex-col text-center md:text-left mb-6 md:mb-0">
                                        <span className="text-[11px] font-bold uppercase tracking-widest mb-1 text-orange-100">O Seu Saldo HUB Coins</span>
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <Icons.Coin />
                                            <span className="text-5xl font-black">{perfil.moedas}</span>
                                        </div>
                                        <span className="text-sm mt-2">Valem <strong>R$ {(perfil.moedas / 100).toFixed(2)}</strong> em descontos de Loja.</span>
                                    </div>
                                    <button className="relative z-10 bg-white text-orange-600 font-bold text-sm px-8 py-4 rounded-xl shadow-md hover:scale-105 transition-transform">
                                        Trocar por Cupons
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-4">Maneiras Rápidas de Ganhar Moedas</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center bg-gray-50 hover:bg-white transition-colors">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-gray-600 font-bold text-xl shadow-sm border border-gray-100">Aa</div>
                                        <h4 className="font-bold text-gray-900 mb-2">Avaliação Escrita</h4>
                                        <p className="text-xs text-gray-500">Escreva o que achou do produto com mais de 50 caracteres e ganhe <strong className="text-orange-500">+10 Coins</strong>.</p>
                                    </div>
                                    <div className="border border-orange-200 bg-orange-50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
                                        <div className="absolute -top-4 -right-6 bg-orange-500 text-white text-[9px] font-bold px-8 py-1.5 rotate-45 shadow-sm">RECOMENDADO</div>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-orange-500 shadow-sm border border-orange-100"><Icons.Camera /></div>
                                        <h4 className="font-bold text-gray-900 mb-2">Avaliação com Foto</h4>
                                        <p className="text-xs text-gray-600">Anexe até 3 fotos reais do produto que recebeu em casa e ganhe <strong className="text-orange-500">+25 Coins</strong>!</p>
                                    </div>
                                    <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center bg-gray-50 hover:bg-white transition-colors">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-gray-600 shadow-sm border border-gray-100"><Icons.User /></div>
                                        <h4 className="font-bold text-gray-900 mb-2">Perfil 100%</h4>
                                        <p className="text-xs text-gray-500">Confirme o seu CPF, E-mail e Telemóvel com código de segurança e ganhe <strong className="text-orange-500">+50 Coins</strong>.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                    </AnimatePresence>
                </section>
            </div>
        </div>
    );
};

export default PerfilPage;