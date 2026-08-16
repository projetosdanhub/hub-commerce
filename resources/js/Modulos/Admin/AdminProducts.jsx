// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminProducts.jsx
// ARQUITETURA: Catálogo Enterprise (Paginação, Auto-Estoque, Design Clean Premium)
// ============================================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// --- ÍCONES OTIMIZADOS E COMPLETOS ---
const Icons = {
    Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Close: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Copy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Upload: () => <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    Drag: () => <svg className="w-4 h-4 text-slate-400 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8M8 15h8" /></svg>,
    Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Spinner: () => <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Check: () => <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
    Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    Play: () => <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
    Indent: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
    Outdent: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    Up: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>,
    Down: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
    Image: () => <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Calendar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Box: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    Layout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Tag: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
};

// --- CSS GLOBAIS ---
const inputNumberStyle = { WebkitAppearance: 'none', MozAppearance: 'textfield' };
const GlobalStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `}} />
);

// --- COMPONENTES AUXILIARES & TRANSIÇÕES ---
const FadeIn = ({ children, className = "", ...props }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }} className={className} {...props}>
        {children}
    </motion.div>
);

const Tooltip = ({ text }) => (
    <span className="group relative inline-flex items-center ml-1.5 cursor-help align-middle">
        <span className="w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center border border-slate-200 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300 transition-colors">?</span>
        <span className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 text-white text-[11px] p-3 rounded-xl shadow-xl z-[100] transition-all font-normal leading-relaxed text-center pointer-events-none">
            {text}<span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
        </span>
    </span>
);

const AnimatedToggle = ({ label, active, onChange, activeColor = "#3B82F6" }) => {
    return (
        <div className="flex justify-between items-center bg-white border border-slate-200 p-5 rounded-[20px] shadow-sm hover:shadow-md transition-all">
            <span className="text-sm font-bold text-slate-800">{label}</span>
            <button type="button" onClick={() => onChange(!active)} className="relative w-11 h-11 flex items-center justify-center rounded-full outline-none flex-shrink-0 bg-slate-50 border border-slate-200 shadow-inner overflow-hidden">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="20" fill="none" stroke="transparent" strokeWidth="2" />
                    <motion.circle cx="22" cy="22" r="20" fill="none" stroke={active ? activeColor : "transparent"} strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0 }} transition={{ duration: 0.4 }} />
                </svg>
                <AnimatePresence mode="wait">
                    {active ? <motion.div key="1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-blue-500 z-10"><Icons.Check /></motion.div>
                            : <motion.div key="0" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-3 h-3 rounded-full bg-slate-300 z-10" />}
                </AnimatePresence>
            </button>
        </div>
    );
};

const AnimatedProductNotification = ({ show, img, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 20, scale: 1 }} exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 right-4 z-[100] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center gap-4 min-w-[300px]">
                <div className="relative w-12 h-12 flex-shrink-0">
                    <img src={img || 'https://via.placeholder.com/40'} className="absolute inset-0 w-full h-full object-cover rounded-xl" alt="Preview" />
                    <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                        {status === 'loading' ? (
                            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />
                                <motion.circle cx="18" cy="18" r="14" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="88" initial={{ strokeDashoffset: 88 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "linear" }} />
                            </svg>
                        ) : (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500 bg-white rounded-full p-0.5 shadow-sm"><Icons.Check /></motion.div>
                        )}
                    </div>
                </div>
                <div className="pr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status === 'loading' ? 'A Sincronizar...' : 'Concluído'}</p>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{status === 'loading' ? 'Salvando na base' : titulo}</p>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const SaveProgressButton = ({ onClick, loading, text, loadingText, className, disabled, icon: Icon }) => (
    <button onClick={onClick} disabled={loading || disabled} className={`relative overflow-hidden ${className} disabled:opacity-90 disabled:cursor-not-allowed`}>
        {loading && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2, ease: "linear" }} className="absolute left-0 top-0 h-full bg-white/20 z-0" />}
        <span className="relative z-10 flex items-center justify-center gap-2">{loading ? <><Icons.Spinner /> {loadingText}</> : <>{Icon && <Icon />} {text}</>}</span>
    </button>
);


// ============================================================================
// COMPONENTE PRINCIPAL MESTRE
// ============================================================================
const AdminProducts = () => {
    const [mainTab, setMainTab] = useState('DASHBOARD'); 
    const [loadingAcao, setLoadingAcao] = useState(null);
    const [advancedNotif, setAdvancedNotif] = useState({ show: false, img: null, status: 'loading', titulo: '' });

    // --- ESTADOS: DASHBOARD E FILTROS ---
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
    
    const [filtroEstoqueInput, setFiltroEstoqueInput] = useState('');
    const [filtroEstoqueMax, setFiltroEstoqueMax] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setFiltroEstoqueMax(filtroEstoqueInput), 600);
        return () => clearTimeout(timer);
    }, [filtroEstoqueInput]);

    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [periodoFiltro, setPeriodoFiltro] = useState({ inicio: '2026-08-01', fim: '2026-08-31' });

    // --- PAGINAÇÃO ---
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);
    useEffect(() => { setPaginaAtual(1); }, [termoPesquisa, filtroCategoria, filtroEstoqueMax, itensPorPagina]);

    // --- DRAG TO SCROLL (CATEGORIAS) ---
    const carouselRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        if (!carouselRef.current) return;
        setIsDragging(true); setStartX(e.pageX - carouselRef.current.offsetLeft); setScrollLeft(carouselRef.current.scrollLeft);
    };
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
        if (!isDragging || !carouselRef.current) return;
        e.preventDefault(); const x = e.pageX - carouselRef.current.offsetLeft; const walk = (x - startX) * 1.5; 
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    // --- MOCKS: CATEGORIAS E MENUS ---
    const [categorias, setCategorias] = useState([
        { id: 1, nome: "Eletrônicos", img: null, status: "ATIVO" },
        { id: 2, nome: "Acessórios", img: null, status: "ATIVO" },
        { id: 3, nome: "Casa & Cozinha", img: null, status: "ATIVO" },
        { id: 4, nome: "Moda", img: null, status: "OCULTO" }
    ]);
    const [catModal, setCatModal] = useState({ isOpen: false, isNovo: true, data: null });

    const [menuItems, setMenuItems] = useState([
        { id: 101, nome: "Página Inicial", categoriaVinculada: "", depth: 0, banner: null },
        { id: 102, nome: "Eletrônicos", categoriaVinculada: "Eletrônicos", depth: 0, banner: null },
        { id: 103, nome: "Smartphones", categoriaVinculada: "Eletrônicos", depth: 1, banner: null },
        { id: 104, nome: "Acessórios Extras", categoriaVinculada: "Acessórios", depth: 2, banner: null }
    ]);
    const [menuModal, setMenuModal] = useState({ isOpen: false, data: null });

    // --- MOCKS: PRODUTOS ---
    const [produtos, setProdutos] = useState([
        { 
            id: 1, nome: "Smartwatch Pro Max 9", skuRef: "HUB", skuSufixo: "SWM9-PRT", preco: 299.90, precoPromo: 199.90, 
            categoriaPrincipal: "Eletrônicos", categoriasSecundarias: ["Acessórios"], 
            controlarEstoque: true, estoque: 15, alertaEstoque: 20, vendas: 145, receitaGerada: 28985.50, freteGasto: 1200.00, cuponsUsados: 45,
            status: "ATIVO", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100", 
            personalizado: false, preVenda: false, fichaTecnica: [], badges: ["Mais Vendido"], galeria: [], video: null, variaveis: [],
            agrupavel: true, freteVariavel: false, ncm: '8517.62.10', cest: '', origem: '0', csosn: '102', cfopDentro: '5102', cfopFora: '6102', peso: '0.300', altura: '10', largura: '10', comp: '10'
        },
        { 
            id: 2, nome: "Caneca Mágica Família", skuRef: "CUS", skuSufixo: "CAN-FAM", preco: 45.00, precoPromo: null, 
            categoriaPrincipal: "Casa & Cozinha", categoriasSecundarias: [], 
            controlarEstoque: false, estoque: 0, alertaEstoque: 50, vendas: 12, receitaGerada: 540.00, freteGasto: 210.00, cuponsUsados: 2,
            status: "ATIVO", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100", 
            personalizado: true, customTipo: "AMBOS", preVenda: true, prepTempo: "5", prepUnidade: "Dias",
            fichaTecnica: [{ chave: 'Material', valor: 'Cerâmica' }], badges: [], galeria: [], video: null, variaveis: [],
            agrupavel: false, freteVariavel: false, ncm: '6912.00.00', cest: '', origem: '0', csosn: '102', cfopDentro: '5102', cfopFora: '6102', peso: '0.400', altura: '15', largura: '12', comp: '12'
        }
    ]);

    // --- ESTADOS DO EDITOR ---
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
    const [errosForm, setErrosForm] = useState({});
    const [editorTab, setEditorTab] = useState('GERAL');
    const [novoBadge, setNovoBadge] = useState('');
    const [statusModalProd, setStatusModalProd] = useState({ isOpen: false, prod: null }); 

    // --- LÓGICA DE ESTOQUE AUTOMÁTICO (Variações ditam o estoque geral) ---
    useEffect(() => {
        if (produtoEmEdicao && produtoEmEdicao.controlarEstoque && produtoEmEdicao.variaveis?.length > 0) {
            const totalVar = produtoEmEdicao.variaveis.reduce((acc, v) => acc + (parseInt(v.estoque) || 0), 0);
            if (produtoEmEdicao.estoque !== totalVar) {
                setProdutoEmEdicao(prev => ({ ...prev, estoque: totalVar }));
            }
        }
    }, [produtoEmEdicao?.variaveis, produtoEmEdicao?.controlarEstoque]);


    // --- MÉTODOS DE PRODUTOS ---
    const abrirNovoProduto = () => {
        setProdutoEmEdicao({
            id: Date.now(), isNovo: true, nome: '', skuRef: 'HUB', skuSufixo: '', preco: '', precoPromo: '', moeda: 'BRL',
            categoriaPrincipal: '', categoriasSecundarias: [], descricao: '', quickView: '', fichaTecnica: [], badges: [],
            controlarEstoque: true, estoque: 0, alertaEstoque: 10, status: 'ATIVO',
            personalizado: false, customTipo: 'IMAGEM', preVenda: false, prepTempo: '', prepUnidade: 'Dias', freteGratis: false, 
            ncm: '', cest: '', origem: '0', cfopDentro: '', cfopFora: '', csosn: '', cstIpi: '', cstPisCofins: '', 
            agrupavel: true, freteVariavel: false, peso: '', altura: '', largura: '', comp: '',
            variaveis: [], img: null, galeria: [], video: null
        });
        setErrosForm({});
        setEditorTab('GERAL');
        setMainTab('EDITOR');
    };

    const abrirEdicaoProduto = (prod) => {
        setProdutoEmEdicao({ 
            ...prod, 
            badges: prod.badges || [], 
            fichaTecnica: prod.fichaTecnica || [], 
            categoriasSecundarias: prod.categoriasSecundarias || [],
            galeria: prod.galeria || [],
            variaveis: prod.variaveis || [],
            video: prod.video || null,
            prepTempo: prod.prepTempo || '',
            prepUnidade: prod.prepUnidade || 'Dias'
        });
        setErrosForm({});
        setEditorTab('GERAL');
        setMainTab('EDITOR');
    };

    const duplicarProduto = (prod) => {
        const copia = {
            ...prod, id: Date.now(), isNovo: true,
            nome: `${prod.nome} (Cópia)`, skuSufixo: `${prod.skuSufixo}-COPY`,
            vendas: 0, receitaGerada: 0, freteGasto: 0, cuponsUsados: 0,
            status: 'INATIVO', estoque: 0, variaveis: prod.variaveis?.map(v => ({...v, id: Date.now() + Math.random(), estoque: 0})) || []
        };
        setProdutoEmEdicao(copia);
        setErrosForm({});
        setEditorTab('GERAL');
        setMainTab('EDITOR');
    };

    const salvarProduto = () => {
        const erros = {};
        if (!produtoEmEdicao.nome.trim()) erros.nome = true;
        if (!produtoEmEdicao.categoriaPrincipal) erros.categoria = true;
        const pco = parseFloat(produtoEmEdicao.preco);
        if (isNaN(pco) || pco <= 0) erros.preco = true;
        
        if (Object.keys(erros).length > 0) {
            setErrosForm(erros);
            setEditorTab('GERAL');
            alert("Campos obrigatórios pendentes. Verifique os campos a vermelho na aba Geral.");
            return;
        }

        const tituloSucesso = produtoEmEdicao.isNovo ? "Produto criado com sucesso!" : "Produto atualizado com sucesso!";
        setAdvancedNotif({ show: true, img: produtoEmEdicao.img, status: 'loading', titulo: tituloSucesso });
        setLoadingAcao('salvar_produto');

        setTimeout(() => {
            const skuFinal = produtoEmEdicao.skuSufixo.trim() === '' ? Math.floor(Math.random()*10000).toString() : produtoEmEdicao.skuSufixo;
            const p = { 
                ...produtoEmEdicao, skuSufixo: skuFinal,
                estoque: isNaN(parseFloat(produtoEmEdicao.estoque)) ? 0 : parseFloat(produtoEmEdicao.estoque),
                preco: pco, precoPromo: isNaN(parseFloat(produtoEmEdicao.precoPromo)) ? null : parseFloat(produtoEmEdicao.precoPromo)
            };

            // Regras Automáticas de Estoque vs Status
            if (p.status === 'INATIVO') p.estoque = 0;
            if (p.controlarEstoque && p.estoque <= 0 && !p.preVenda) p.status = 'INATIVO';

            if (p.isNovo) setProdutos([{ ...p, isNovo: false, vendas: 0, receitaGerada: 0, freteGasto: 0, cuponsUsados: 0 }, ...produtos]);
            else setProdutos(prev => prev.map(prod => prod.id === p.id ? p : prod));
            
            setAdvancedNotif(prev => ({ ...prev, status: 'success' }));
            setMainTab('PRODUTOS');
            
            setTimeout(() => {
                setLoadingAcao(null);
                setProdutoEmEdicao(null);
                setAdvancedNotif({ show: false, img: null, status: 'loading', titulo: '' });
            }, 500); 
        }, 1500); 
    };

    const deletarProduto = (produto) => {
        if (produto.vendas > 0) {
            if(window.confirm(`ATENÇÃO: Este produto possui ${produto.vendas} vendas registradas.\n\nPara proteger o histórico financeiro, o produto será apenas INATIVADO e o estoque zerado. Confirmar?`)) {
                setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, status: 'INATIVO', estoque: 0 } : p));
            }
        } else {
            if(window.confirm("Produto sem vendas registradas. Deseja excluir permanentemente do banco de dados?")) {
                setProdutos(prev => prev.filter(p => p.id !== produto.id));
            }
        }
    };

    const mudarStatusRapido = (novoStatus) => {
        setProdutos(prev => prev.map(p => {
            if (p.id === statusModalProd.prod.id) {
                let updatedEstoque = p.estoque;
                if (novoStatus === 'INATIVO') updatedEstoque = 0; // Regra: Inativo zera estoque
                return { ...p, status: novoStatus, estoque: updatedEstoque };
            }
            return p;
        }));
        fecharStatusModal();
    };

    // --- MÉTODOS DO EDITOR (INTERAÇÕES) ---
    const addFichaRow = () => setProdutoEmEdicao(p => ({ ...p, fichaTecnica: [...p.fichaTecnica, { chave: '', valor: '' }] }));
    const removeFichaRow = (idx) => setProdutoEmEdicao(p => ({ ...p, fichaTecnica: p.fichaTecnica.filter((_, i) => i !== idx) }));
    const updateFicha = (idx, field, val) => {
        const nf = [...produtoEmEdicao.fichaTecnica];
        nf[idx][field] = val;
        setProdutoEmEdicao({ ...produtoEmEdicao, fichaTecnica: nf });
    };

    const addBadge = () => {
        if(novoBadge.trim()) { setProdutoEmEdicao(p => ({ ...p, badges: [...p.badges, novoBadge.trim()] })); setNovoBadge(''); }
    };

    const toggleCatSecundaria = (cat) => {
        setProdutoEmEdicao(p => {
            const arr = p.categoriasSecundarias;
            if(arr.includes(cat)) return { ...p, categoriasSecundarias: arr.filter(c => c !== cat) };
            if(arr.length < 2) return { ...p, categoriasSecundarias: [...arr, cat] };
            return p;
        });
    };

    const addVariacao = () => {
        setProdutoEmEdicao(p => ({
            ...p, variaveis: [...(p.variaveis || []), { id: Date.now(), tipo: '', nome: '', estoque: 0, sku: '', img: null }]
        }));
    };
    const updateVariacao = (idx, field, val) => {
        const nv = [...produtoEmEdicao.variaveis];
        nv[idx][field] = val;
        setProdutoEmEdicao({ ...produtoEmEdicao, variaveis: nv });
    };
    const removeVariacao = (idx) => {
        setProdutoEmEdicao(p => ({ ...p, variaveis: p.variaveis.filter((_, i) => i !== idx) }));
    };

    // Mídias
    const validateFileSize = (file, maxMB) => {
        if (file.size > maxMB * 1024 * 1024) { alert(`O ficheiro excede o limite de ${maxMB}MB.`); return false; }
        return true;
    };

    const handleCapaUpload = (e) => {
        const file = e.target.files[0];
        if (file && validateFileSize(file, 3)) setProdutoEmEdicao({ ...produtoEmEdicao, img: URL.createObjectURL(file) });
    };
    const handleGaleriaUpload = (e, index) => {
        const file = e.target.files[0];
        if (file && validateFileSize(file, 3)) {
            const novaGaleria = [...produtoEmEdicao.galeria];
            novaGaleria[index] = URL.createObjectURL(file);
            setProdutoEmEdicao({ ...produtoEmEdicao, galeria: novaGaleria });
        }
    };
    const handleVarImageUpload = (e, idx) => {
        const file = e.target.files[0];
        if (file && validateFileSize(file, 3)) {
            const nv = [...produtoEmEdicao.variaveis];
            nv[idx].img = URL.createObjectURL(file);
            setProdutoEmEdicao({ ...produtoEmEdicao, variaveis: nv });
        }
    };
    const removeGaleriaItem = (index) => {
        const novaGaleria = [...produtoEmEdicao.galeria];
        novaGaleria.splice(index, 1);
        setProdutoEmEdicao({ ...produtoEmEdicao, galeria: novaGaleria });
    };
    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file && validateFileSize(file, 6)) setProdutoEmEdicao({ ...produtoEmEdicao, video: URL.createObjectURL(file) });
    };

    // --- MÉTODOS DOS MODAIS (Funções Puras Anti-Remount) ---
    const fecharCatModal = () => setCatModal(prev => ({ ...prev, isOpen: false }));
    const fecharMenuModal = () => setMenuModal(prev => ({ ...prev, isOpen: false }));
    const fecharStatusModal = () => setStatusModalProd(prev => ({ ...prev, isOpen: false }));

    const abrirNovaCat = () => setCatModal({ isOpen: true, isNovo: true, data: { id: Date.now(), nome: '', img: null, status: 'ATIVO' } });
    const editarCat = (cat) => setCatModal({ isOpen: true, isNovo: false, data: { ...cat } });
    
    const handleCatImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && validateFileSize(file, 3)) setCatModal(prev => ({ ...prev, data: { ...prev.data, img: URL.createObjectURL(file) } }));
    };

    const salvarCat = () => {
        if (!catModal.data.nome.trim()) return alert("O nome da categoria é obrigatório.");
        if (catModal.isNovo) setCategorias([...categorias, catModal.data]);
        else setCategorias(categorias.map(c => c.id === catModal.data.id ? catModal.data : c));
        fecharCatModal();
    };

    const editarMenu = (item) => setMenuModal({ isOpen: true, data: { ...item } });
    const handleMenuBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file && validateFileSize(file, 3)) setMenuModal(prev => ({ ...prev, data: { ...prev.data, banner: URL.createObjectURL(file) } }));
    };

    const salvarMenu = () => {
        if (!menuModal.data.nome.trim()) return alert("O Nome de exibição é obrigatório.");
        setMenuItems(menuItems.map(m => m.id === menuModal.data.id ? menuModal.data : m));
        fecharMenuModal();
    };

    const changeMenuDepth = (idx, delta) => {
        const arr = [...menuItems];
        const newVal = arr[idx].depth + delta;
        if (newVal >= 0 && newVal <= 2) { arr[idx].depth = newVal; setMenuItems(arr); }
    };
    const moveMenuItem = (idx, delta) => {
        if (idx + delta < 0 || idx + delta >= menuItems.length) return;
        const arr = [...menuItems];
        const temp = arr[idx]; arr[idx] = arr[idx + delta]; arr[idx + delta] = temp;
        setMenuItems(arr);
    };

    // --- FILTRAGEM E PAGINAÇÃO ---
    const produtosFiltrados = useMemo(() => {
        return produtos.filter(p => {
            const search = termoPesquisa.toLowerCase();
            const fullSku = `${p.skuRef}-${p.skuSufixo}`.toLowerCase();
            const matchBusca = p.nome.toLowerCase().includes(search) || fullSku.includes(search);
            const matchCat = filtroCategoria === 'TODAS' || p.categoriaPrincipal === filtroCategoria;
            const matchEstoque = !filtroEstoqueMax || (p.controlarEstoque && p.estoque <= Number(filtroEstoqueMax));
            return matchBusca && matchCat && matchEstoque;
        });
    }, [produtos, termoPesquisa, filtroCategoria, filtroEstoqueMax]);

    const indexOfLastItem = paginaAtual * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const currentProdutos = produtosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(produtosFiltrados.length / itensPorPagina);


    // ============================================================================
    // RENDER: DASHBOARD
    // ============================================================================
    const renderDashboard = () => {
        const totalVendas = produtos.reduce((acc, p) => acc + p.vendas, 0);
        const totalReceita = produtos.reduce((acc, p) => acc + p.receitaGerada, 0);
        const topSellers = [...produtos].sort((a,b) => b.vendas - a.vendas).slice(0, 10);

        return (
            <FadeIn key="dash" className="space-y-6 pb-10">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Visão Geral e Performance</h2>
                        <p className="text-sm text-slate-500 mt-1">Métricas financeiras do seu catálogo de produtos.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => setIsDateModalOpen(true)} className="flex-1 md:flex-none bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-5 py-3 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <Icons.Calendar /> {periodoFiltro.inicio} a {periodoFiltro.fim}
                        </button>
                        <button onClick={() => alert("Gerando PDF...")} className="flex-1 md:flex-none bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            <Icons.Download /> Baixar Relatório
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-transform">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cadastrados</span>
                        <p className="text-3xl font-black text-slate-800 mt-2">{produtos.length}</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm hover:-translate-y-1 transition-transform">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ativos</span>
                        <p className="text-3xl font-black text-emerald-700 mt-2">{produtos.filter(p=>p.status==='ATIVO').length}</p>
                    </div>
                    <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm hover:-translate-y-1 transition-transform">
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Fora de Estoque</span>
                        <p className="text-3xl font-black text-rose-700 mt-2">{produtos.filter(p=> p.controlarEstoque && p.estoque === 0 && !p.preVenda).length}</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 shadow-sm hover:-translate-y-1 transition-transform">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Por Encomenda</span>
                        <p className="text-3xl font-black text-purple-700 mt-2">{produtos.filter(p=>p.preVenda).length}</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm hover:-translate-y-1 transition-transform">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Unid. Vendidas</span>
                        <p className="text-3xl font-black text-blue-700 mt-2">{totalVendas}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-sm hover:-translate-y-1 transition-transform">
                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Receita (R$)</span>
                        <p className="text-2xl font-black text-white mt-2">R$ {totalReceita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><span className="text-yellow-500">🏆</span> Top 10 Mais Vendidos</h3>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                    <th className="p-4 pl-6 w-16">Rank</th><th className="p-4">Produto</th><th className="p-4 text-center">Vendas</th><th className="p-4 text-center">Cupons</th><th className="p-4 text-right">Frete Gasto</th><th className="p-4 pr-6 text-right">Receita Bruta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {topSellers.map((p, idx) => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 pl-6 font-black text-slate-300 text-xl">{idx + 1}º</td>
                                        <td className="p-4 flex items-center gap-4">
                                            <img src={p.img || 'https://via.placeholder.com/40'} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt=""/>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm line-clamp-1">{p.nome}</span>
                                                <span className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {p.skuRef}-{p.skuSufixo}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center"><span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{p.vendas}</span></td>
                                        <td className="p-4 text-center"><span className="text-xs font-bold text-slate-500">{p.cuponsUsados}</span></td>
                                        <td className="p-4 text-right"><span className="text-xs font-bold text-rose-500">R$ {p.freteGasto.toFixed(2)}</span></td>
                                        <td className="p-4 pr-6 text-right"><span className="font-black text-emerald-600 text-base">R$ {p.receitaGerada.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></td>
                                    </tr>
                                ))}
                                {topSellers.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500 text-sm font-medium">Nenhuma venda registada no período.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </FadeIn>
        );
    };

    // ============================================================================
    // VISÃO 2: CATEGORIAS E MENU 
    // ============================================================================
    const renderCategorias = () => {
        return (
            <FadeIn key="cat" className="pb-10 space-y-8">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-black text-slate-800">Categorias Globais</h2>
                            <p className="text-sm text-slate-500 mt-1">Crie as categorias principais da sua loja. Arraste horizontalmente para ver mais.</p>
                        </div>
                        <button onClick={abrirNovaCat} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"><Icons.Plus /> Nova Categoria</button>
                    </div>
                    
                    <div 
                        ref={carouselRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={`flex gap-5 overflow-x-auto custom-scrollbar pb-6 snap-x snap-mandatory transition-all select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                        {categorias.map(cat => (
                            <div key={cat.id} className="min-w-[280px] max-w-[280px] bg-white rounded-[20px] border border-slate-200 shadow-sm p-5 flex flex-col snap-start hover:border-blue-300 transition-all group pointer-events-auto">
                                <div className="h-32 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                                    {cat.img ? <img src={cat.img} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="" /> : <span className="text-xs font-bold text-slate-400 pointer-events-none">Sem Imagem</span>}
                                </div>
                                <h3 className="font-black text-slate-800 text-lg mb-1">{cat.nome}</h3>
                                <span className={`text-[9px] font-bold px-2 py-1 rounded w-max uppercase tracking-wider mb-4 ${cat.status==='ATIVO'?'bg-emerald-50 text-emerald-600 border border-emerald-100':cat.status==='INATIVO'?'bg-rose-50 text-rose-600 border border-rose-100':'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>{cat.status}</span>
                                
                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); editarCat(cat); }} className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100"><Icons.Edit/></button>
                                    <button onClick={(e) => { e.stopPropagation(); setCategorias(categorias.filter(c=>c.id!==cat.id)); }} className="text-rose-500 bg-rose-50 p-2 rounded-lg hover:bg-rose-100"><Icons.Trash/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-800">Construtor do Mega Menu (Cabeçalho)</h2>
                        <p className="text-sm text-slate-500 mt-1">Organize os links. Recue para criar submenus. Clique em Editar para vincular uma Categoria e um Banner promocional.</p>
                    </div>

                    <div className="space-y-3">
                        {menuItems.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-2 transition-all" style={{ marginLeft: `${item.depth * 3}rem` }}>
                                {item.depth > 0 && <div className="w-6 h-px bg-slate-300 mr-2"></div>}
                                
                                <div className={`flex-1 flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm ${item.depth === 0 ? 'border-l-[6px] border-l-blue-500 bg-slate-50/50' : ''}`}>
                                    <Icons.Drag />
                                    <div className="flex flex-col">
                                        <span className={`font-black text-base ${item.depth === 0 ? 'text-slate-800' : 'text-slate-600'}`}>{item.nome}</span>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-max mt-1 border border-blue-100">
                                            {item.categoriaVinculada ? `🔗 Categoria: ${item.categoriaVinculada}` : `🔗 URL: ${item.link || '/'}`}
                                        </span>
                                    </div>
                                    
                                    <div className="ml-auto flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                        <button onClick={() => editarMenu(item)} className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-2 rounded-lg mr-2 transition-colors shadow-sm">Editar Config.</button>
                                        <button onClick={() => changeMenuDepth(idx, -1)} disabled={item.depth === 0} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-30"><Icons.Outdent/></button>
                                        <button onClick={() => changeMenuDepth(idx, 1)} disabled={item.depth === 2} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-30"><Icons.Indent/></button>
                                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                                        <button onClick={() => moveMenuItem(idx, -1)} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-30"><Icons.Up/></button>
                                        <button onClick={() => moveMenuItem(idx, 1)} disabled={idx === menuItems.length-1} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm rounded-lg disabled:opacity-30"><Icons.Down/></button>
                                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                                        <button onClick={()=>setMenuItems(menuItems.filter(m=>m.id!==item.id))} className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg ml-1"><Icons.Trash/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={()=>setMenuItems([...menuItems, {id:Date.now(), nome:'Novo Link', link: '', categoriaVinculada:'', depth:0, banner: null}])} className="mt-6 text-sm font-bold text-emerald-700 bg-emerald-50 px-6 py-3.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-2 shadow-sm"><Icons.Plus /> Adicionar Novo Item</button>
                </div>
            </FadeIn>
        );
    };

    // ============================================================================
    // VISÃO 3: TABELA DE PRODUTOS
    // ============================================================================
    const renderProdutosList = () => {
        return (
            <FadeIn key="prodlist" className="pb-10">
                <div className="bg-white p-6 rounded-t-3xl border border-b-0 border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-[400px]">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></div>
                        <input type="text" placeholder="Buscar Produto ou SKU..." value={termoPesquisa} onChange={e=>setTermoPesquisa(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
                        <input type="number" placeholder="Estoque Max" value={filtroEstoqueInput} onChange={e=>setFiltroEstoqueInput(e.target.value)} style={inputNumberStyle} className="bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 w-36 outline-none focus:border-blue-500 text-center text-slate-700" />
                        <select value={filtroCategoria} onChange={e=>setFiltroCategoria(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-3.5 outline-none cursor-pointer focus:border-blue-500">
                            <option value="TODAS">Todas Categorias</option>
                            {categorias.map(c=><option key={c.id} value={c.nome}>{c.nome}</option>)}
                        </select>
                        <button onClick={abrirNovoProduto} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                            <Icons.Plus /> Cadastrar Produto
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-y border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                <th className="p-5 pl-8">Produto</th><th className="p-5">SKU & Categoria</th><th className="p-5 text-right">Preço</th><th className="p-5 text-center">Estoque</th><th className="p-5 text-center">Status</th><th className="p-5 pr-8 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentProdutos.map(p => {
                                const valPromo = parseFloat(p.precoPromo);
                                return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors group relative">
                                    <td className="p-5 pl-8 flex items-center gap-4">
                                        <img src={p.img || 'https://via.placeholder.com/40'} className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shadow-sm" alt=""/>
                                        <div>
                                            <span className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors block leading-tight">{p.nome}</span>
                                            {p.personalizado && <span className="text-[9px] bg-yellow-50 text-yellow-700 border border-yellow-200 font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block">Personalizável</span>}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-mono text-xs font-bold text-slate-500 block mb-1">{p.skuRef}-{p.skuSufixo}</span>
                                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{p.categoriaPrincipal}</span>
                                    </td>
                                    <td className="p-5 text-right">
                                        {valPromo > 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[11px] text-slate-400 line-through">R$ {parseFloat(p.preco).toFixed(2)}</span>
                                                <span className="font-black text-emerald-600 text-base">R$ {valPromo.toFixed(2)}</span>
                                            </div>
                                        ) : <span className="font-black text-slate-800 text-base">R$ {parseFloat(p.preco).toFixed(2)}</span>}
                                    </td>
                                    <td className="p-5 text-center text-sm">
                                        {p.preVenda ? <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 uppercase tracking-wider">Encomenda</span> : 
                                        !p.controlarEstoque ? <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-wider">Infinito</span> : 
                                        p.estoque === 0 ? <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 uppercase tracking-wider">Esgotado</span> : 
                                        <span className="font-black text-slate-700">{p.estoque} un</span>}
                                    </td>
                                    <td className="p-5 text-center relative">
                                        <button onClick={() => setStatusModalProd({ isOpen: true, prod: p })} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border hover:shadow-sm transition-all ${p.status==='ATIVO'?'bg-emerald-50 text-emerald-600 border-emerald-200':p.status==='INATIVO'?'bg-rose-50 text-rose-600 border-rose-200':'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                                            {p.status} <span className="ml-1 opacity-50">▾</span>
                                        </button>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => duplicarProduto(p)} className="w-9 h-9 flex items-center justify-center text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm" title="Duplicar Produto"><Icons.Copy /></button>
                                            <button onClick={() => abrirEdicaoProduto(p)} className="w-9 h-9 flex items-center justify-center text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors shadow-sm" title="Editar"><Icons.Edit /></button>
                                            <button onClick={() => deletarProduto(p)} className="w-9 h-9 flex items-center justify-center text-rose-500 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors shadow-sm" title="Excluir"><Icons.Trash /></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            {currentProdutos.length === 0 && <tr><td colSpan="6" className="p-16 text-center text-slate-400 text-base font-medium">Nenhum produto atende aos filtros atuais.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Controles de Paginação no Rodapé */}
                {produtosFiltrados.length > 0 && (
                    <div className="bg-white p-5 rounded-b-3xl border border-t-0 border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-500 gap-4">
                        <div className="flex items-center gap-3">
                            <span>Itens por página:</span>
                            <select value={itensPorPagina} onChange={(e) => setItensPorPagina(Number(e.target.value))} className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer focus:border-blue-500">
                                <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Página {paginaAtual} de {totalPages || 1}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 shadow-sm rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">&lt;</button>
                                <button onClick={() => setPaginaAtual(p => Math.min(totalPages, p + 1))} disabled={paginaAtual === totalPages || totalPages === 0} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-600 shadow-sm rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">&gt;</button>
                            </div>
                        </div>
                    </div>
                )}
            </FadeIn>
        );
    };

    // ============================================================================
    // VISÃO 4: EDITOR DE PRODUTO (FULL PAGE)
    // ============================================================================
    const renderEditor = () => {
        if (!produtoEmEdicao) return null;
        return (
            <FadeIn key="editor" className="pb-20 w-full max-w-6xl mx-auto">
                {/* Header Fixo de Edição */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm mb-8 sticky top-4 z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMainTab('PRODUTOS')} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-sm transition-all flex-shrink-0"><Icons.Back /></button>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 leading-tight">{produtoEmEdicao.isNovo ? 'Cadastrar Novo' : 'Editar'} Produto</h2>
                            {!produtoEmEdicao.isNovo && <p className="text-xs text-slate-500 font-mono font-semibold mt-1">SKU Mestre: {produtoEmEdicao.skuRef}-{produtoEmEdicao.skuSufixo}</p>}
                        </div>
                    </div>
                    <SaveProgressButton onClick={salvarProduto} loading={loadingAcao === 'salvar_produto'} text="Salvar Produto" loadingText="A Salvar..." icon={Icons.Check} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-sm transition-colors w-full sm:w-auto" />
                </div>

                {/* Menu de Abas Internas (7 Abas Independentes e Expandidas) */}
                <div className="flex gap-6 mb-8 overflow-x-auto no-scrollbar border-b border-slate-200 px-2 pb-1">
                    {['GERAL', 'ESTOQUE', 'VARIAÇÕES', 'MÍDIA', 'FISCAL', 'ENVIO', 'EXTRAS'].map(aba => (
                        <button key={aba} onClick={() => setEditorTab(aba)} className={`pb-3 text-sm font-bold uppercase tracking-widest relative whitespace-nowrap transition-colors flex-shrink-0 ${editorTab === aba ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            {aba}
                            {editorTab === aba && <motion.div layoutId="editorTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Conteúdo do Editor */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {editorTab === 'GERAL' && (
                            <motion.div key="geral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className={`bg-white p-8 rounded-3xl border ${errosForm.nome ? 'border-rose-400 shadow-rose-100' : 'border-slate-200'} shadow-sm transition-colors`}>
                                        <label className="text-sm font-bold text-slate-700 block mb-3">Título do Produto *</label>
                                        <input type="text" value={produtoEmEdicao.nome} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, nome: e.target.value})} placeholder="Ex: Tênis Esportivo Run Max Edição Limitada" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white font-semibold text-slate-900 transition-all" />
                                        {errosForm.nome && <p className="text-xs font-bold text-rose-500 mt-2">O título é obrigatório.</p>}
                                    </div>

                                    <div className={`bg-white p-8 rounded-3xl border ${errosForm.preco ? 'border-rose-400 shadow-rose-100' : 'border-slate-200'} shadow-sm flex flex-col md:flex-row gap-8 transition-colors`}>
                                        <div className="flex-1">
                                            <label className="text-sm font-bold text-slate-700 block mb-3">Preço Base (R$) *</label>
                                            <input type="number" min="0" step="0.01" value={produtoEmEdicao.preco} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, preco: e.target.value})} style={inputNumberStyle} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-2xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm font-bold text-emerald-600 block mb-3">Preço Promocional</label>
                                            <input type="number" min="0" step="0.01" value={produtoEmEdicao.precoPromo} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, precoPromo: e.target.value})} style={inputNumberStyle} className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-2xl font-black text-emerald-700 outline-none placeholder-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="0.00" />
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <label className="text-sm font-bold text-slate-700 block mb-3 flex justify-between">Descrição Resumida (Vitrine) <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">MÁX 150 CARACTERES</span></label>
                                        <textarea maxLength="150" rows="2" value={produtoEmEdicao.quickView} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, quickView: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 transition-all"></textarea>
                                        
                                        <label className="text-sm font-bold text-slate-700 block mt-8 mb-3">Descrição Completa</label>
                                        <textarea rows="8" value={produtoEmEdicao.descricao} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, descricao: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed text-slate-800 transition-all"></textarea>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <label className="text-sm font-bold text-slate-700 block mb-3">SKU (Prefixo Editável + Código)</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={produtoEmEdicao.skuRef} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, skuRef: e.target.value.toUpperCase()})} placeholder="HUB" className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-4 text-sm font-mono font-bold text-center text-slate-700 outline-none focus:border-blue-500 transition-all" />
                                            <input type="text" value={produtoEmEdicao.skuSufixo} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, skuSufixo: e.target.value.toUpperCase()})} placeholder="Automático" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-mono font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" />
                                        </div>
                                    </div>
                                    
                                    <div className={`bg-white p-8 rounded-3xl border ${errosForm.categoria ? 'border-rose-400 shadow-rose-100' : 'border-slate-200'} shadow-sm transition-colors`}>
                                        <label className="text-sm font-bold text-slate-700 block mb-3">Categoria Principal *</label>
                                        <select value={produtoEmEdicao.categoriaPrincipal} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, categoriaPrincipal: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm outline-none cursor-pointer font-bold text-slate-800 mb-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                            <option value="">Selecione...</option>
                                            {categorias.map(c=><option key={c.id} value={c.nome}>{c.nome}</option>)}
                                        </select>
                                        {errosForm.categoria && <p className="text-[10px] font-bold text-rose-500 mb-4">Escolha uma categoria principal.</p>}
                                        
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 border-t border-slate-100 pt-5">Categorias Secundárias (Opcional)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categorias.filter(c => c.nome !== produtoEmEdicao.categoriaPrincipal).map(c => {
                                                const isSel = produtoEmEdicao.categoriasSecundarias.includes(c.nome);
                                                return (
                                                    <button key={c.id} onClick={() => toggleCatSecundaria(c.nome)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${isSel ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                                        {c.nome}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="text-sm font-bold text-slate-700">Ficha Técnica</label>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={addFichaRow} className="w-10 h-10 bg-slate-50 text-slate-500 border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:text-blue-600 hover:border-blue-200 transition-colors"><Icons.Plus /></motion.button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {produtoEmEdicao.fichaTecnica.map((ft, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <input type="text" placeholder="Nome (Ex: Marca)" value={ft.chave} onChange={e=>updateFicha(idx, 'chave', e.target.value)} className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-700 transition-all" />
                                                    <input type="text" placeholder="Descrição" value={ft.valor} onChange={e=>updateFicha(idx, 'valor', e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 text-slate-700 transition-all" />
                                                    <button onClick={()=>removeFichaRow(idx)} className="p-3 bg-white text-rose-500 border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors"><Icons.Trash/></button>
                                                </div>
                                            ))}
                                        </div>
                                        {produtoEmEdicao.fichaTecnica.length === 0 && <p className="text-[11px] font-medium text-slate-400 italic text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 mt-2">Clique no + para inserir características.</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {editorTab === 'ESTOQUE' && (
                            <motion.div key="estoque" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-8">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                                        <div className="absolute -left-6 -top-6 w-32 h-32 bg-blue-500 opacity-5 rounded-full blur-2xl pointer-events-none"></div>
                                        <AnimatedToggle label="Controlar Estoque Físico" active={produtoEmEdicao.controlarEstoque} onChange={val => setProdutoEmEdicao({...produtoEmEdicao, controlarEstoque: val})} activeColor="#3B82F6" />
                                    </div>
                                    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500 opacity-5 rounded-full blur-2xl pointer-events-none"></div>
                                        <AnimatedToggle label="Venda Por Encomenda" active={produtoEmEdicao.preVenda} onChange={val => setProdutoEmEdicao({...produtoEmEdicao, preVenda: val})} activeColor="#A855F7" />
                                    </div>
                                </div>

                                {(produtoEmEdicao.preVenda || produtoEmEdicao.personalizado) && (
                                    <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100 shadow-sm">
                                        <label className="text-sm font-bold text-purple-900 block mb-4">Tempo Mínimo de Produção / Envio <Tooltip text="Aparece no carrinho alertando o cliente sobre os dias necessários para produzir/preparar."/></label>
                                        <div className="flex gap-4 sm:w-1/2">
                                            <input type="number" value={produtoEmEdicao.prepTempo} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, prepTempo: e.target.value})} style={inputNumberStyle} placeholder="Ex: 5" className="w-20 text-center bg-white border border-purple-200 rounded-xl px-4 py-3 text-lg font-black text-purple-900 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                                            <select value={produtoEmEdicao.prepUnidade} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, prepUnidade: e.target.value})} className="flex-1 bg-white border border-purple-200 rounded-xl px-4 py-3 text-sm font-bold text-purple-900 outline-none cursor-pointer focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all">
                                                <option value="Dias">Dias Úteis</option>
                                                <option value="Semanas">Semanas</option>
                                                <option value="Meses">Meses</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {produtoEmEdicao.controlarEstoque ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                            <label className="text-sm font-bold text-slate-700 block mb-4">Estoque Físico Disponível</label>
                                            <div className="flex items-center gap-4">
                                                {produtoEmEdicao.variaveis?.length > 0 ? (
                                                    <div className="flex items-center gap-4 w-full">
                                                        <span className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-300 font-black text-2xl flex items-center justify-center cursor-not-allowed">-</span>
                                                        <input type="text" readOnly value={produtoEmEdicao.estoque} className="w-full text-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-black text-slate-400 outline-none cursor-not-allowed" />
                                                        <span className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-300 font-black text-2xl flex items-center justify-center cursor-not-allowed">+</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 w-full">
                                                        <button onClick={()=>setProdutoEmEdicao(p=>({...p, estoque: Math.max(0, p.estoque - 1)}))} className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-2xl hover:bg-slate-50 hover:text-rose-500 transition-colors shadow-sm">-</button>
                                                        <input type="number" min="0" value={produtoEmEdicao.estoque} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, estoque: Math.max(0, Number(e.target.value))})} style={inputNumberStyle} className="w-full text-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-2xl font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                                        <button onClick={()=>setProdutoEmEdicao(p=>({...p, estoque: p.estoque + 1}))} className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-2xl hover:bg-slate-50 hover:text-emerald-500 transition-colors shadow-sm">+</button>
                                                    </div>
                                                )}
                                            </div>
                                            {produtoEmEdicao.variaveis?.length > 0 && <p className="text-[10px] font-bold text-blue-600 bg-blue-50 p-2 rounded-lg mt-4 border border-blue-100 text-center">Calculado com base nas Variações.</p>}
                                        </div>
                                        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 shadow-sm">
                                            <label className="text-sm font-bold text-amber-800 block mb-4">Avisar Baixo Estoque se baixar de:</label>
                                            <input type="number" min="0" value={produtoEmEdicao.alertaEstoque} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, alertaEstoque: e.target.value})} style={inputNumberStyle} className="w-full sm:w-1/2 text-center bg-white border border-amber-200 rounded-2xl px-4 py-4 text-2xl font-black text-amber-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 shadow-sm">
                                        <p className="text-lg font-black text-emerald-800">Estoque Ilimitado (Infinito)</p>
                                        <p className="text-sm text-emerald-700 mt-1">O produto não desconta unidades ao ser vendido e nunca ficará "Esgotado". Ideal para produtos digitais ou sob demanda.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {editorTab === 'VARIAÇÕES' && (
                            <motion.div key="vars" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-5 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800">Grade de Variações</h3>
                                            <p className="text-xs font-medium text-slate-500 mt-1">Crie cores, tamanhos e modelos. Cada um terá o seu próprio estoque, imagem e SKU.</p>
                                        </div>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={addVariacao} className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"><Icons.Plus /></motion.button>
                                    </div>
                                    
                                    {produtoEmEdicao.variaveis && produtoEmEdicao.variaveis.length > 0 ? (
                                        <div className="space-y-4 relative z-10">
                                            {produtoEmEdicao.variaveis.map((varItem, idx) => (
                                                <div key={varItem.id} className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-[20px] relative hover:border-blue-200 transition-colors group/var">
                                                    <label className="w-16 h-16 flex-shrink-0 bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 flex items-center justify-center overflow-hidden group">
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVarImageUpload(e, idx)} />
                                                        {varItem.img ? <img src={varItem.img} className="w-full h-full object-cover" alt="" /> : <Icons.Image className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />}
                                                    </label>
                                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Tipo (Ex: Cor)</label>
                                                            <input type="text" value={varItem.tipo} onChange={e => updateVariacao(idx, 'tipo', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Nome (Ex: Azul)</label>
                                                            <input type="text" value={varItem.nome} onChange={e => updateVariacao(idx, 'nome', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Estoque Físico</label>
                                                            <input type="number" min="0" disabled={!produtoEmEdicao.controlarEstoque} value={produtoEmEdicao.controlarEstoque ? varItem.estoque : ''} onChange={e => updateVariacao(idx, 'estoque', e.target.value)} style={inputNumberStyle} placeholder={produtoEmEdicao.controlarEstoque ? "0" : "Ilimitado"} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 shadow-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">SKU Filho</label>
                                                            <input type="text" value={varItem.sku} onChange={e => updateVariacao(idx, 'sku', e.target.value.toUpperCase())} placeholder="Opcional" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" />
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeVariacao(idx)} className="w-10 h-10 flex items-center justify-center bg-white text-rose-500 rounded-xl hover:bg-rose-50 transition-colors border border-slate-200 flex-shrink-0 absolute -top-3 -right-3 sm:static shadow-sm opacity-0 sm:opacity-100 group-hover/var:opacity-100"><Icons.Trash /></button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[20px] text-center relative z-10">
                                            <p className="text-sm font-bold text-slate-500">Sem variações. O produto será vendido como peça única.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {editorTab === 'MÍDIA' && (
                            <motion.div key="midia" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <label className="text-lg font-black text-slate-800 block mb-2">Arquivos Visuais do Produto (Máx 10 Imagens e 1 Vídeo)</label>
                                <p className="text-xs text-slate-500 mb-8">O primeiro card será a capa oficial da vitrine. Máx 3MB/foto (1:1 ou 3:4) e 6MB/15s para vídeo.</p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                                    <label className="col-span-2 sm:col-span-2 aspect-[4/3] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-blue-300 rounded-3xl cursor-pointer hover:bg-blue-50 transition-colors relative overflow-hidden group shadow-inner">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleCapaUpload} />
                                        {produtoEmEdicao.img ? (
                                            <>
                                                <img src={produtoEmEdicao.img} className="absolute inset-0 w-full h-full object-cover" alt="Capa" />
                                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]"><span className="text-white text-xs font-bold border-2 border-white/50 px-5 py-2.5 rounded-xl shadow-xl">Substituir Capa</span></div>
                                                <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-widest">CAPA</span>
                                            </>
                                        ) : <><Icons.Upload /><span className="text-sm font-black text-blue-700 mt-3">Adicionar Capa Principal</span></>}
                                    </label>
                                    
                                    {[...Array(9)].map((_, i) => (
                                        <label key={i} className="aspect-square flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[20px] cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-colors relative overflow-hidden group">
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGaleriaUpload(e, i)} />
                                            {produtoEmEdicao.galeria && produtoEmEdicao.galeria[i] ? (
                                                <>
                                                    <img src={produtoEmEdicao.galeria[i]} className="absolute inset-0 w-full h-full object-cover" alt="Galeria"/>
                                                    <button type="button" onClick={(e) => { e.preventDefault(); removeGaleriaItem(i); }} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><Icons.Close/></button>
                                                </>
                                            ) : (
                                                <><span className="text-4xl text-slate-300 group-hover:text-blue-400 transition-colors">+</span><span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Galeria</span></>
                                            )}
                                        </label>
                                    ))}

                                    <label className="aspect-square flex flex-col items-center justify-center bg-purple-50 border-2 border-dashed border-purple-200 rounded-[20px] cursor-pointer hover:bg-purple-100 transition-colors relative group overflow-hidden">
                                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                        {produtoEmEdicao.video ? (
                                            <>
                                                <div className="flex flex-col items-center justify-center w-full h-full bg-purple-600 text-white"><Icons.Play /><span className="text-[10px] font-bold mt-2 uppercase tracking-wider">Vídeo Anexado</span></div>
                                                <button type="button" onClick={(e) => { e.preventDefault(); setProdutoEmEdicao({...produtoEmEdicao, video: null}); }} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><Icons.Close/></button>
                                            </>
                                        ) : (
                                            <><span className="text-3xl text-purple-400 group-hover:text-purple-600">▶</span><span className="text-[10px] font-bold text-purple-700 mt-2 text-center uppercase">Adicionar<br/>Vídeo</span></>
                                        )}
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {editorTab === 'FISCAL' && (
                            <motion.div key="fiscal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-5 mb-2 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">Fiscal (Emissão NFe Nacional)</h3>
                                        <p className="text-sm text-slate-500 mt-1">Ativa a emissão de nota com um clique via Certificado A1. Consulte a sua contabilidade.</p>
                                    </div>
                                    <span className="bg-amber-50 text-amber-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">Opcional</span>
                                </div>
                                
                                <div><label className="text-sm font-bold text-slate-700 mb-2 flex items-center">NCM <Tooltip text="Cód de 8 dígitos obrigatório na NFe. Sem pontos."/></label><input type="text" value={produtoEmEdicao.ncm} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, ncm: e.target.value})} placeholder="Ex: 85176210" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" /></div>
                                <div><label className="text-sm font-bold text-slate-700 mb-2 flex items-center">CEST <Tooltip text="Substituição Tributária. Preencha se o produto tiver ST no seu estado."/></label><input type="text" value={produtoEmEdicao.cest} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, cest: e.target.value})} placeholder="Ex: 21.057.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" /></div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center">Origem (ICMS) <Tooltip text="Define se o produto é fabricado no Brasil ou Importado."/></label>
                                    <select value={produtoEmEdicao.origem} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, origem: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800">
                                        <option value="0">0 - Nacional</option><option value="1">1 - Estrangeira (Importação Direta)</option><option value="2">2 - Estrangeira (Mercado Interno)</option><option value="3">3 - Nacional, CI &gt; 40%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center">CSOSN (Simples Nacional) <Tooltip text="Ex: 102 para Revenda de mercadorias sem permissão de crédito."/></label>
                                    <select value={produtoEmEdicao.csosn} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, csosn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800">
                                        <option value="">Selecione o Código Fiscal...</option><option value="101">101 - Com permissão de crédito</option><option value="102">102 - Sem permissão de crédito</option><option value="400">400 - Não tributada</option><option value="500">500 - ICMS cobrado ant. por ST</option>
                                    </select>
                                </div>

                                <div><label className="text-sm font-bold text-slate-700 mb-2 flex items-center">CFOP (Dentro do Estado) <Tooltip text="Ex: 5102 para vendas dentro da sua UF."/></label><input type="text" value={produtoEmEdicao.cfopDentro} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, cfopDentro: e.target.value})} placeholder="5102" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" /></div>
                                <div><label className="text-sm font-bold text-slate-700 mb-2 flex items-center">CFOP (Fora do Estado) <Tooltip text="Ex: 6102 para vendas interestaduais."/></label><input type="text" value={produtoEmEdicao.cfopFora} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, cfopFora: e.target.value})} placeholder="6102" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" /></div>
                            </motion.div>
                        )}

                        {editorTab === 'ENVIO' && (
                            <motion.div key="envio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-5 mb-2">
                                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Icons.Box /> Logística (Pacote Principal)</h3>
                                    <p className="text-sm text-slate-500 mt-1">Essencial para cálculos automáticos de frete na loja (Correios / Melhor Envio).</p>
                                </div>
                                
                                <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-8">
                                    <div className="flex-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 block">Peso (kg) *</label><input type="number" style={inputNumberStyle} placeholder="Ex: 0.500" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                                    <div className="flex-[3]"><label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 block">Dimensões (LxAxC) cm</label><div className="flex gap-4"><input type="number" style={inputNumberStyle} placeholder="Largura" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /><input type="number" style={inputNumberStyle} placeholder="Altura" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /><input type="number" style={inputNumberStyle} placeholder="Comp." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-base font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div></div>
                                </div>

                                <div className="col-span-1 md:col-span-2 mt-4 bg-slate-50 border border-slate-200 p-6 rounded-[20px]">
                                    <AnimatedToggle label="Venda Agrupável no Frete?" active={produtoEmEdicao.agrupavel} onChange={val => setProdutoEmEdicao({...produtoEmEdicao, agrupavel: val})} activeColor="#3B82F6" />
                                    <p className="text-xs font-medium text-slate-500 mt-3 ml-4">Se ativado, a calculadora junta as caixas do cliente (Até ao limite da transportadora) diminuindo o valor do frete.</p>
                                </div>
                            </motion.div>
                        )}

                        {editorTab === 'EXTRAS' && (
                            <motion.div key="extras" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 relative overflow-hidden">
                                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                                    <AnimatedToggle label="Personalizável pelo Cliente" active={produtoEmEdicao.personalizado} onChange={val => setProdutoEmEdicao({...produtoEmEdicao, personalizado: val})} activeColor="#F59E0B" />
                                    <AnimatePresence>
                                        {produtoEmEdicao.personalizado && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-200 pt-6 overflow-hidden relative z-10">
                                                <label className="text-xs font-bold text-amber-700 uppercase block mb-3">O cliente deve enviar (Checkout):</label>
                                                <select value={produtoEmEdicao.customTipo} onChange={e=>setProdutoEmEdicao({...produtoEmEdicao, customTipo: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-700 outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all">
                                                    <option value="IMAGEM">Apenas Imagem (Logotipo / Foto)</option>
                                                    <option value="TEXTO">Apenas Texto (Nomes / Frases)</option>
                                                    <option value="AMBOS">Ambos (Imagem e Texto)</option>
                                                </select>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 relative overflow-hidden">
                                    <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-emerald-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                                    <AnimatedToggle label="Oferecer Frete Grátis (Promoção)" active={produtoEmEdicao.freteGratis} onChange={val => setProdutoEmEdicao({...produtoEmEdicao, freteGratis: val})} activeColor="#10B981" />
                                    
                                    <div className="border-t border-slate-200 pt-6 relative z-10">
                                        <label className="text-sm font-bold text-slate-700 block mb-4">Badges Promocionais (Vitrine)</label>
                                        <div className="flex gap-3 mb-5">
                                            <input type="text" value={novoBadge} onChange={e=>setNovoBadge(e.target.value)} placeholder="Ex: Oferta de Natal" className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold shadow-sm text-slate-800 transition-all" />
                                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={addBadge} className="bg-emerald-500 text-white px-6 rounded-xl text-sm font-bold shadow-sm">Add</motion.button>
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {produtoEmEdicao.badges.map((b, idx) => (
                                                <span key={idx} className="bg-white text-emerald-700 text-xs font-bold px-3.5 py-2 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-sm">
                                                    {b} <button onClick={()=>setProdutoEmEdicao(p=>({...p, badges: p.badges.filter((_,i)=>i!==idx)}))} className="text-emerald-400 hover:text-rose-500 bg-emerald-50 rounded-full p-0.5"><Icons.Close/></button>
                                                </span>
                                            ))}
                                            {produtoEmEdicao.badges.length === 0 && <span className="text-[11px] font-bold text-slate-400 italic">Sem selos promocionais.</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </FadeIn>
        );
    };

    // --- MODAIS GLOBAIS ---
    const renderModaisGlobais = () => (
        <>
            {/* Modal Alterar Status Rapido */}
            <AnimatePresence>
                {statusModalProd.isOpen && statusModalProd.prod && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fecharStatusModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10 border border-slate-200">
                            <h3 className="text-xl font-black text-slate-800 mb-2">Status do Produto</h3>
                            <p className="text-xs text-slate-500 mb-6 truncate">{statusModalProd.prod?.nome}</p>
                            <div className="space-y-3">
                                <button onClick={()=>mudarStatusRapido('ATIVO')} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-300 bg-emerald-50 transition-colors">
                                    <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="font-bold text-emerald-700">Ativo (Visível)</span></div>
                                </button>
                                <button onClick={()=>mudarStatusRapido('OCULTO')} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-yellow-300 bg-yellow-50 transition-colors">
                                    <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span className="font-bold text-yellow-700">Oculto (Via Link)</span></div>
                                </button>
                                <button onClick={()=>mudarStatusRapido('INATIVO')} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-rose-300 bg-rose-50 transition-colors">
                                    <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="font-bold text-rose-700">Inativo (Zera Estoque)</span></div>
                                </button>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button onClick={fecharStatusModal} className="w-full bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Editar Categoria */}
            <AnimatePresence>
                {catModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fecharCatModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-200">
                            <h3 className="text-xl font-black text-slate-800 mb-6">{catModal.isNovo ? 'Nova Categoria' : 'Editar Categoria'}</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <label className="w-24 h-24 flex-shrink-0 bg-slate-50 border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 relative overflow-hidden group">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleCatImageUpload} />
                                        {catModal.data?.img ? (
                                            <>
                                                <img src={catModal.data.img} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><span className="text-white text-[9px] font-bold border border-white px-2 py-1 rounded">Trocar</span></div>
                                            </>
                                        ) : <><Icons.Upload/><span className="text-[9px] font-bold text-blue-600 mt-1">Img (1:1)</span></>}
                                    </label>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 block mb-2">Nome da Categoria *</label>
                                            <input type="text" value={catModal.data?.nome || ''} onChange={e=>setCatModal({...catModal, data:{...catModal.data, nome: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800 transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-3">Status da Vitrine</label>
                                    <div className="flex gap-3">
                                        <button onClick={()=>setCatModal({...catModal, data:{...catModal.data, status: 'ATIVO'}})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${catModal.data?.status === 'ATIVO' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}><div className={`w-2 h-2 rounded-full ${catModal.data?.status === 'ATIVO' ? 'bg-emerald-500' : 'bg-slate-300'}`} />Ativo</button>
                                        <button onClick={()=>setCatModal({...catModal, data:{...catModal.data, status: 'OCULTO'}})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${catModal.data?.status === 'OCULTO' ? 'bg-yellow-50 border-yellow-300 text-yellow-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}><div className={`w-2 h-2 rounded-full ${catModal.data?.status === 'OCULTO' ? 'bg-yellow-500' : 'bg-slate-300'}`} />Oculto</button>
                                        <button onClick={()=>setCatModal({...catModal, data:{...catModal.data, status: 'INATIVO'}})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all ${catModal.data?.status === 'INATIVO' ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}><div className={`w-2 h-2 rounded-full ${catModal.data?.status === 'INATIVO' ? 'bg-rose-500' : 'bg-slate-300'}`} />Inativo</button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                                <button onClick={fecharCatModal} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button onClick={salvarCat} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Salvar Categoria</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Editar Link de Menu */}
            <AnimatePresence>
                {menuModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={fecharMenuModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-200">
                            <h3 className="text-xl font-black text-slate-800 mb-6">Configurar Item do Menu</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-2">Nome de Exibição (Cabeçalho) *</label>
                                    <input type="text" value={menuModal.data?.nome || ''} onChange={e=>setMenuModal({...menuModal, data:{...menuModal.data, nome: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900 transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-2">Vincular a uma Categoria Global</label>
                                    <select value={menuModal.data?.categoriaVinculada || ''} onChange={e=>setMenuModal({...menuModal, data:{...menuModal.data, categoriaVinculada: e.target.value, link: ''}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none font-bold text-blue-700 cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                        <option value="">Sem vínculo (Usar Link Direto Abaixo)</option>
                                        {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                                    </select>
                                </div>
                                {!menuModal.data?.categoriaVinculada && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 block mb-2">Link Direto (URL Personalizada)</label>
                                        <input type="text" placeholder="Ex: /colecao-inverno" value={menuModal.data?.link || ''} onChange={e=>setMenuModal({...menuModal, data:{...menuModal.data, link: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" />
                                    </div>
                                )}
                                {menuModal.data?.depth === 0 && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <label className="text-xs font-bold text-blue-700 block mb-3">Banner Promocional do Mega Menu (Desktop)</label>
                                        <div className="flex gap-4 items-center">
                                            {menuModal.data?.banner && <img src={menuModal.data.banner} className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm" alt="Banner" />}
                                            <div className="flex-1">
                                                <label className="w-full bg-blue-50 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-100 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2">
                                                    <Icons.Upload /> Enviar Arte <input type="file" accept="image/*" className="hidden" onChange={handleMenuBannerUpload} />
                                                </label>
                                                <p className="text-[9px] text-slate-400 mt-2 text-center">Proporção 1:1 ou Retrato (3:4). Máximo 3MB.</p>
                                            </div>
                                            {menuModal.data?.banner && <button onClick={()=>setMenuModal({...menuModal, data:{...menuModal.data, banner: null}})} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors"><Icons.Trash/></button>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                                <button onClick={fecharMenuModal} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                                <button onClick={salvarMenu} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Salvar Link</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Datas */}
            <AnimatePresence>
                {isDateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDateModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10 border border-slate-200">
                            <h3 className="text-xl font-black text-slate-800 mb-6">Filtrar por Período</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-2">Data Inicial *</label>
                                    <input type="date" value={periodoFiltro.inicio} onChange={e=>setPeriodoFiltro({...periodoFiltro, inicio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-2">Data Final *</label>
                                    <input type="date" value={periodoFiltro.fim} onChange={e=>setPeriodoFiltro({...periodoFiltro, fim: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800" />
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button onClick={() => setIsDateModalOpen(false)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-sm hover:bg-blue-700 transition-colors">Aplicar Filtro</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );

    return (
        <div className="w-full min-h-screen bg-slate-50 pb-20 relative font-sans">
            <Helmet><title>Catálogo | HUB ADMIN</title></Helmet>
            <GlobalStyles />
            
            <AnimatedProductNotification show={advancedNotif.show} img={advancedNotif.img} status={advancedNotif.status} titulo={advancedNotif.titulo} />
            
            {/* Renderizar modais no Root Layer para evitar recriação ao mudar estado nos formulários */}
            {renderModaisGlobais()}

            {mainTab !== 'EDITOR' && (
                <div className="mb-6 pt-4 px-4 md:px-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Catálogo</h1>
                    <div className="flex gap-8 border-b border-slate-200 mt-6 overflow-x-auto no-scrollbar">
                        {['DASHBOARD', 'PRODUTOS', 'CATEGORIAS'].map(tab => (
                            <button key={tab} onClick={() => setMainTab(tab)} className={`pb-4 text-sm font-bold uppercase tracking-widest relative whitespace-nowrap transition-colors flex items-center gap-2 ${mainTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'}`}>
                                {tab === 'DASHBOARD' && <Icons.Layout />}
                                {tab === 'PRODUTOS' && <Icons.Box />}
                                {tab === 'CATEGORIAS' && <Icons.Tag />}
                                {tab === 'CATEGORIAS' ? 'Categorias & Menu' : tab}
                                {mainTab === tab && <motion.div layoutId="mainTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500 rounded-t-full" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-4 md:px-8">
                <AnimatePresence mode="wait">
                    {mainTab === 'DASHBOARD' && renderDashboard()}
                    {mainTab === 'PRODUTOS' && renderProdutosList()}
                    {mainTab === 'CATEGORIAS' && renderCategorias()}
                    {mainTab === 'EDITOR' && renderEditor()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminProducts;