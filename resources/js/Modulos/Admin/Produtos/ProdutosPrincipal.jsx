// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminProducts.jsx
// ARQUITETURA: Catálogo Enterprise SaaS Refatorado (Gravity V2)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, LayoutDashboard, List, History } from 'lucide-react';

import api from '../../../api';

// --- Shared Components / Design System ---
import { CustomStyles } from './Compartilhado/ComponentesUI';
import { PageHeader } from '../DesignSystem/patterns/PageHeader';
import { LocalNavigation } from '../DesignSystem/patterns/LocalNavigation';

// --- Modulos ---
import DashboardCatalogo from './Painel/DashboardCatalogo';
import ListaDeProdutos from './Lista/ListaDeProdutos';
import EditorDeProduto from './Editor/EditorDeProduto';
import AuditoriaProdutos from './Auditoria/AuditoriaProdutos';

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
                <div className="hub-panel" style={{ padding: '32px', margin: '16px', backgroundColor: 'var(--hub-danger-soft)', borderColor: 'rgba(var(--hub-danger-rgb), 0.2)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--hub-danger)', marginBottom: '8px' }}>Algo deu errado no Catálogo.</h2>
                    <p style={{ color: 'rgba(var(--hub-danger-rgb), 0.8)', fontFamily: 'monospace', fontSize: '14px' }}>{this.state.error?.toString()}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="hub-btn"
                        style={{ marginTop: '16px', backgroundColor: 'var(--hub-danger)', color: 'var(--hub-text-on-color)' }}
                    >
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

    const navTabs = [
        { id: 'DASHBOARD', label: 'DASHBOARD', icon: LayoutDashboard },
        { id: 'PRODUTOS', label: 'PRODUTOS', icon: List },
        { id: 'AUDITORIA', label: 'AUDITORIA', icon: History }
    ];

    return (
        <div className="hub-page-container">
            <Helmet>
                <title>Gestão de Catálogo | Hub Commerce</title>
            </Helmet>
            <CustomStyles />
            
            {mainTab !== 'EDITOR' && (
                <>
                    <PageHeader 
                        title="Gestão de Catálogo"
                        description="Gerencie seus produtos, variações, grade de estoque, fiscal e mídia em um hub centralizado."
                        icon={Package}
                    />
                    <LocalNavigation 
                        tabs={navTabs}
                        activeTab={mainTab}
                        onChange={setMainTab}
                    />
                </>
            )}

            <div style={{ width: '100%' }}>
                <AnimatePresence mode="wait">
                    {mainTab === 'DASHBOARD' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15, ease: "easeOut" }}>
                            <DashboardCatalogo 
                                produtos={produtos} 
                                isRefreshing={isLoading} 
                                abrirEdicaoProduto={onEditProduct} 
                            />
                        </motion.div>
                    )}
                    {mainTab === 'PRODUTOS' && (
                        <motion.div key="produtos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15, ease: "easeOut" }}>
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
                        <motion.div key="auditoria" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15, ease: "easeOut" }}>
                            <AuditoriaProdutos />
                        </motion.div>
                    )}
                    {mainTab === 'EDITOR' && produtoEmEdicao && (
                        <motion.div key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15, ease: "easeOut" }}>
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