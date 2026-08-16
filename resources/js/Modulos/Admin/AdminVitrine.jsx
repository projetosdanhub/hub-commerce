// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminVitrine.jsx
// ARQUITETURA: Construtor de Tema e Gestão de Vitrine (Banners & Layout)
// ============================================================================

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// --- ÍCONES SVG ---
const Icons = {
    Image: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Palette: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    Layout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Save: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
};

// Componente Interno: Switch Toggle estilo iOS
const ToggleSwitch = ({ ativo, onChange, label }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <button 
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${ativo ? 'bg-emerald-500' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={ativo}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ativo ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const AdminVitrine = () => {
    const [abaAtiva, setAbaAtiva] = useState('banners'); // 'banners', 'estilo', 'layout'
    const [isSaving, setIsSaving] = useState(false);

    // --- MOCK: CONFIGURAÇÕES DE BANNERS ---
    const [heroBanners, setHeroBanners] = useState([
        { id: 1, titulo: "Saldos de Inverno", imagemDesktop: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200", imagemMobile: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600", link: "/categoria/ofertas", ativo: true },
        { id: 2, titulo: "Novos Eletrónicos", imagemDesktop: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=1200", imagemMobile: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=600", link: "/categoria/eletronicos", ativo: true }
    ]);

    // --- MOCK: CONFIGURAÇÕES DE ESTILO (TEMA) ---
    const [tema, setTema] = useState({
        corPrincipal: '#0ea5e9', // Ex: Sky-500
        temaCabecalho: 'claro', // 'claro' ou 'escuro'
        estiloBotoes: 'arredondado', // 'arredondado', 'quadrado', 'pilula'
        mostrarTopBar: true,
        textoTopBar: "🚚 Frete Grátis para todo o país em compras acima de R$ 200!"
    });

    // --- MOCK: CONFIGURAÇÕES DE LAYOUT DA HOME ---
    const [secoesHome, setSecoesHome] = useState({
        mostrarCategorias: true,
        mostrarNovidades: true,
        mostrarPromoBanners: true,
        mostrarMaisDesejados: true,
        mostrarNewsletter: true
    });

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Aparência e Vitrine atualizadas com sucesso!");
        }, 1000);
    };

    return (
        <div className="w-full">
            <Helmet><title>Aparência & Vitrine | HUB ADMIN</title></Helmet>

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vitrine & Aparência</h1>
                    <p className="text-gray-500 text-sm mt-1">Personalize as cores, banners e a estrutura da sua loja.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-70"
                >
                    {isSaving ? "A Guardar..." : <><Icons.Save /> Publicar Alterações</>}
                </button>
            </div>

            {/* SELETOR DE ABAS */}
            <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                <button onClick={() => setAbaAtiva('banners')} className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 whitespace-nowrap ${abaAtiva === 'banners' ? 'text-sky-600' : 'text-gray-400 hover:text-gray-900'}`}>
                    <Icons.Image /> Banners Principais
                    {abaAtiva === 'banners' && <motion.div layoutId="aba-vitrine" className="absolute bottom-0 left-0 right-0 h-[3px] bg-sky-500 rounded-t-full" />}
                </button>
                <button onClick={() => setAbaAtiva('estilo')} className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 whitespace-nowrap ${abaAtiva === 'estilo' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-900'}`}>
                    <Icons.Palette /> Cores & Estilo
                    {abaAtiva === 'estilo' && <motion.div layoutId="aba-vitrine" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-500 rounded-t-full" />}
                </button>
                <button onClick={() => setAbaAtiva('layout')} className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 whitespace-nowrap ${abaAtiva === 'layout' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-900'}`}>
                    <Icons.Layout /> Layout da Home
                    {abaAtiva === 'layout' && <motion.div layoutId="aba-vitrine" className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-t-full" />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {/* ========================================================= */}
                {/* ABA 1: BANNERS PRINCIPAIS (Hero)                          */}
                {/* ========================================================= */}
                {abaAtiva === 'banners' && (
                    <motion.div key="banners" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        
                        <div className="flex justify-between items-center bg-sky-50 border border-sky-100 p-4 rounded-[16px]">
                            <div>
                                <h3 className="font-bold text-sky-900">Carrossel Principal (Home)</h3>
                                <p className="text-xs text-sky-700 mt-0.5">Recomendamos imagens com 1920x600px para PC e 800x800px para Mobile.</p>
                            </div>
                            <button className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-sm">
                                <Icons.Plus /> Novo Banner
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {heroBanners.map((banner, idx) => (
                                <div key={banner.id} className="bg-white border border-gray-200 rounded-[20px] shadow-sm overflow-hidden flex flex-col group">
                                    <div className="relative h-40 bg-gray-100">
                                        <img src={banner.imagemDesktop} alt="Banner" className="w-full h-full object-cover" />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded shadow-sm ${banner.ativo ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                                                {banner.ativo ? 'Ativo' : 'Oculto'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="mb-4">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase">Título Interno</label>
                                            <input type="text" value={banner.titulo} onChange={() => {}} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-sky-500 mt-1" />
                                        </div>
                                        <div className="mb-5">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase">Link de Destino</label>
                                            <input type="text" value={banner.link} onChange={() => {}} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-sky-600 font-medium outline-none focus:border-sky-500 mt-1" />
                                        </div>
                                        <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-4">
                                            <div className="flex gap-2">
                                                <button className="text-[11px] font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded hover:bg-sky-100 transition-colors">Trocar Imagens</button>
                                            </div>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors p-1"><Icons.Trash /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ========================================================= */}
                {/* ABA 2: CORES E ESTILO (Construtor de Tema)                */}
                {/* ========================================================= */}
                {abaAtiva === 'estilo' && (
                    <motion.div key="estilo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Bloco 1: Cores da Marca */}
                            <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Icons.Palette /> Identidade Visual</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 block">Cor Principal (Botões e Links)</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                value={tema.corPrincipal} 
                                                onChange={e => setTema({...tema, corPrincipal: e.target.value})}
                                                className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                                            />
                                            <input 
                                                type="text" 
                                                value={tema.corPrincipal.toUpperCase()} 
                                                onChange={e => setTema({...tema, corPrincipal: e.target.value})}
                                                className="w-32 bg-gray-50 border border-gray-200 rounded-lg h-12 px-3 text-sm font-bold text-gray-700 outline-none uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 block">Estilo dos Botões e Cartões</label>
                                        <div className="flex gap-3">
                                            <button onClick={() => setTema({...tema, estiloBotoes: 'quadrado'})} className={`flex-1 py-3 border-2 text-sm font-bold transition-all ${tema.estiloBotoes === 'quadrado' ? 'border-purple-500 text-purple-700 bg-purple-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Quadrado</button>
                                            <button onClick={() => setTema({...tema, estiloBotoes: 'arredondado'})} className={`flex-1 py-3 border-2 rounded-xl text-sm font-bold transition-all ${tema.estiloBotoes === 'arredondado' ? 'border-purple-500 text-purple-700 bg-purple-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Arredondado</button>
                                            <button onClick={() => setTema({...tema, estiloBotoes: 'pilula'})} className={`flex-1 py-3 border-2 rounded-full text-sm font-bold transition-all ${tema.estiloBotoes === 'pilula' ? 'border-purple-500 text-purple-700 bg-purple-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Pílula</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 block">Tema do Cabeçalho (Menu)</label>
                                        <div className="flex gap-3">
                                            <button onClick={() => setTema({...tema, temaCabecalho: 'claro'})} className={`flex-1 py-3 border-2 rounded-xl text-sm font-bold transition-all ${tema.temaCabecalho === 'claro' ? 'border-purple-500 text-purple-700 bg-purple-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Claro (Branco)</button>
                                            <button onClick={() => setTema({...tema, temaCabecalho: 'escuro'})} className={`flex-1 py-3 border-2 rounded-xl text-sm font-bold bg-gray-900 transition-all ${tema.temaCabecalho === 'escuro' ? 'border-purple-500 text-white shadow-lg' : 'border-transparent text-gray-300 hover:bg-gray-800'}`}>Escuro (Preto)</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco 2: Barra de Anúncios Topo */}
                            <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">Barra de Anúncios (Top Bar)</h3>
                                
                                <div className="space-y-6">
                                    <ToggleSwitch 
                                        label="Ativar Top Bar na Loja" 
                                        ativo={tema.mostrarTopBar} 
                                        onChange={() => setTema({...tema, mostrarTopBar: !tema.mostrarTopBar})} 
                                    />
                                    
                                    {tema.mostrarTopBar && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                            <label className="text-[12px] font-bold text-gray-700 mb-2 block">Texto do Anúncio</label>
                                            <input 
                                                type="text" 
                                                value={tema.textoTopBar} 
                                                onChange={e => setTema({...tema, textoTopBar: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-all" 
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2">Dica: Use Emojis para chamar mais a atenção.</p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ========================================================= */}
                {/* ABA 3: LAYOUT DA HOME (Interruptores)                     */}
                {/* ========================================================= */}
                {abaAtiva === 'layout' && (
                    <motion.div key="layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 shadow-sm max-w-3xl">
                            <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2"><Icons.Layout /> Estrutura da Página Inicial</h3>
                            <p className="text-sm text-gray-500 mb-8">Ligue ou desligue as secções para montar a montra perfeita. As alterações são aplicadas instantaneamente após guardar.</p>
                            
                            <div className="space-y-2">
                                <ToggleSwitch 
                                    label="1. Grelha de Categorias Principais" 
                                    ativo={secoesHome.mostrarCategorias} 
                                    onChange={() => setSecoesHome({...secoesHome, mostrarCategorias: !secoesHome.mostrarCategorias})} 
                                />
                                <ToggleSwitch 
                                    label="2. Carrossel de Novidades da Semana" 
                                    ativo={secoesHome.mostrarNovidades} 
                                    onChange={() => setSecoesHome({...secoesHome, mostrarNovidades: !secoesHome.mostrarNovidades})} 
                                />
                                <ToggleSwitch 
                                    label="3. Banners Promocionais Intermédios" 
                                    ativo={secoesHome.mostrarPromoBanners} 
                                    onChange={() => setSecoesHome({...secoesHome, mostrarPromoBanners: !secoesHome.mostrarPromoBanners})} 
                                />
                                <ToggleSwitch 
                                    label="4. Grid de Produtos Mais Desejados" 
                                    ativo={secoesHome.mostrarMaisDesejados} 
                                    onChange={() => setSecoesHome({...secoesHome, mostrarMaisDesejados: !secoesHome.mostrarMaisDesejados})} 
                                />
                                <ToggleSwitch 
                                    label="5. Captura de E-mails (Newsletter no Rodapé)" 
                                    ativo={secoesHome.mostrarNewsletter} 
                                    onChange={() => setSecoesHome({...secoesHome, mostrarNewsletter: !secoesHome.mostrarNewsletter})} 
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminVitrine;