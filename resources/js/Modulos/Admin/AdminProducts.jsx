// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminProducts.jsx
// ARQUITETURA: Catálogo Enterprise SaaS Refatorado
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';

import api from '../../api';

// --- Shared Components ---
import { CustomStyles } from './Produtos/Compartilhado/ComponentesUI';

// --- Modulos ---
import DashboardCatalogo from './Produtos/Painel/DashboardCatalogo';
import ListaDeProdutos from './Produtos/Lista/ListaDeProdutos';
import EditorDeProduto from './Produtos/Editor/EditorDeProduto';
import AuditoriaProdutos from './Produtos/Auditoria/AuditoriaProdutos';

class ProductErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ProductErrorBoundary caught an error", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-rose-50 rounded-2xl border border-rose-200">
                    <h2 className="text-xl font-bold text-rose-800 mb-2">Algo deu errado no Catálogo.</h2>
                    <p className="text-rose-600 font-mono text-sm">{this.state.error?.toString()}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700">
                        Recarregar Página
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const defaultProduct = {
    id: null,
    nome: '',
    status: 'INATIVO',
    categoriaPrincipal: '',
    preco: '',
    precoPromo: '',
    estoque: '',
    controlarEstoque: true,
    alertaEstoque: 5,
    alertaModerado: 20,
    alertaAlto: 50,
    skuRef: '',
    skuSufixo: '',
    descricao: '',
    ncm: '', cest: '', gtin: '', origem: '0', csosn: '102', cst: '102',
    cfop: '', cfopDentro: '', unidade: 'UN',
    icmsPerc: '', ipiPerc: '',
    peso: '', comp: '', largura: '', altura: '', agrupavel: false,
    metaTitle: '', metaDesc: '', slug: '',
    galeriaObjects: [],
    preVenda: false,
    isNovo: true
};

const AdminProductsContent = () => {
    const [mainTab, setMainTab] = useState('DASHBOARD'); // DASHBOARD, PRODUTOS, AUDITORIA, EDITOR
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setIsLoading(true);
        try {
            const [resProd, resCat] = await Promise.all([
                api.get('/admin/products'),
                api.get('/admin/categories')
            ]);
            
            if (resProd.data && resProd.data.data) setProdutos(resProd.data.data);
            if (resCat.data && resCat.data.data) setCategorias(resCat.data.data);
        } catch (error) {
            console.error("Erro ao carregar dados", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onEditProduct = (produto) => {
        setProdutoEmEdicao(produto);
        setMainTab('EDITOR');
    };

    const onCreateProduct = () => {
        setProdutoEmEdicao({ ...defaultProduct });
        setMainTab('EDITOR');
    };

    const renderHeader = () => {
        if (mainTab === 'EDITOR') return null; // Editor tem seu próprio header

        return (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-4 sm:px-0">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" /> Gestão de Catálogo
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Gerencie seus produtos, variações, grade de estoque, fiscal e mídia em um hub centralizado.</p>
                </div>
            </div>
        );
    };

    const renderTabs = () => {
        if (mainTab === 'EDITOR') return null; // Não exibe abas principais durante edição

        return (
            <div className="flex overflow-x-auto no-scrollbar bg-slate-100/80 p-1 rounded-xl mb-10 w-max max-w-full border border-slate-200/50 mx-4 sm:mx-0">
                {['DASHBOARD', 'PRODUTOS', 'AUDITORIA'].map(tab => (
                    <button 
                        type="button" 
                        key={tab} 
                        aria-selected={mainTab === tab} 
                        onClick={() => setMainTab(tab)} 
                        className={`relative px-5 py-2.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap outline-none ${mainTab === tab ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        {mainTab === tab && <motion.div layoutId="activeMainTabProducts" className="absolute inset-0 bg-white rounded-xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto pb-16 relative min-h-screen bg-slate-50/50 font-sans selection:bg-blue-200 selection:text-blue-900 pt-8">
            <Helmet>
                <title>Gestão de Catálogo | Hub Commerce</title>
            </Helmet>
            <CustomStyles />
            
            {renderHeader()}
            {renderTabs()}

            <div className="px-4 sm:px-0">
                <AnimatePresence mode="wait">
                    {mainTab === 'DASHBOARD' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <DashboardCatalogo 
                                produtos={produtos} 
                                isRefreshing={isLoading} 
                                abrirEdicaoProduto={onEditProduct} 
                            />
                        </motion.div>
                    )}
                    {mainTab === 'PRODUTOS' && (
                        <motion.div key="produtos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <ListaDeProdutos 
                                produtos={produtos} 
                                categorias={categorias}
                                isRefreshing={isLoading}
                                abrirEdicaoProduto={onEditProduct} 
                                abrirNovoProduto={onCreateProduct} 
                            />
                        </motion.div>
                    )}
                    {mainTab === 'AUDITORIA' && (
                        <motion.div key="auditoria" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <AuditoriaProdutos />
                        </motion.div>
                    )}
                    {mainTab === 'EDITOR' && produtoEmEdicao && (
                        <motion.div key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <EditorDeProduto 
                                produtoOriginal={produtoEmEdicao} 
                                onVoltar={() => setMainTab('PRODUTOS')} 
                                onSuccess={() => carregarDados()} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function AdminProductsWrapper() {
    return (
        <ProductErrorBoundary>
            <AdminProductsContent />
        </ProductErrorBoundary>
    );
}