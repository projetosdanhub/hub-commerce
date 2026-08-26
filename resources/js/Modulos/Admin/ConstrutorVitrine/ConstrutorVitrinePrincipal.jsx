import React, { useState, useEffect } from 'react';
import api from '../../../api'; // Instância do Axios
import './ConstrutorVitrine.css'; // O nosso CSS puro do construtor

// Sub-módulos
import BarraLateral from './Sidebar/BarraLateral';
import AreaDeVisualizacao from './Visualizacao/AreaDeVisualizacao';
import InspetorDePropriedades from './Inspetor/InspetorDePropriedades';

const ConstrutorVitrinePrincipal = () => {
    const [blocks, setBlocks] = useState([]);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Configurações Globais da Loja
    const [activeMenuId, setActiveMenuId] = useState('');
    const [availableMenus, setAvailableMenus] = useState([]);

    // Carrega a configuração atual da API
    useEffect(() => {
        carregarVitrine();
        carregarMenusDisponiveis();
    }, []);

    const carregarMenusDisponiveis = async () => {
        try {
            const res = await api.get('/admin/menu');
            setAvailableMenus(res.data.data || []);
        } catch (e) {
            console.error("Erro ao carregar menus", e);
        }
    };

    const carregarVitrine = async () => {
        try {
            const response = await api.get('/storefront');
            setBlocks(response.data.data || []);
            setActiveMenuId(response.data.active_menu_id || '');
            if (response.data.data && response.data.data.length > 0) {
                setSelectedBlockId(response.data.data[0].id);
            }
        } catch (error) {
            console.error("Erro ao carregar vitrine", error);
            const demoBlocks = [
                { id: '1', type: 'BannerPrincipal', isVisible: true, props: { largura: 'full', tipo: 'carrossel' } },
                { id: '2', type: 'GradeCategorias', isVisible: true, props: { titulo: 'Explore por Categorias', estilo: 'redondo' } },
                { id: '3', type: 'BannersPromocionais', isVisible: true, props: { quantidade: 2 } },
                { id: '4', type: 'CarrosselProdutos', isVisible: true, props: { titulo: 'Novidades', colecao: 'novidades', limite: 8 } }
            ];
            setBlocks(demoBlocks);
            setSelectedBlockId('1');
        } finally {
            setIsLoading(false);
        }
    };

    // Alterna visibilidade do bloco
    const toggleVisibility = (id) => {
        setBlocks(blocks.map(block => 
            block.id === id ? { ...block, isVisible: !block.isVisible } : block
        ));
    };

    // Atualiza propriedades de um bloco
    const updateBlockProps = (key, value) => {
        setBlocks(blocks.map(block => 
            block.id === selectedBlockId 
                ? { ...block, props: { ...block.props, [key]: value } } 
                : block
        ));
    };

    // Publica a estrutura no banco de dados
    const handlePublicar = async () => {
        setIsSaving(true);
        try {
            await api.post('/storefront/publish', { 
                layout_blocks: blocks,
                active_menu_id: activeMenuId || null 
            });
            alert("Vitrine atualizada com sucesso! A loja pública já reflete as alterações.");
            
            // Forçar refresh no iframe se necessário enviando evento específico
            const iframe = document.querySelector('.cv-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'FORCE_RELOAD' }, window.location.origin);
            }
        } catch (error) {
            console.error("Erro ao salvar vitrine", error);
            alert("Ocorreu um erro ao tentar publicar. Verifique o console.");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="cv-container">
            {/* Cabeçalho */}
            <div className="cv-header">
                <div>
                    <h1 className="cv-title">Construtor de Loja</h1>
                    <p className="cv-subtitle">Desenhe a página inicial da sua loja em tempo real. Arraste, edite e publique.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--hub-space-4)' }}>
                    {/* Seleção do Menu Principal */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--hub-space-2)' }}>
                        <span style={{ fontSize: 'var(--hub-text-body-sm)', fontWeight: 'var(--hub-font-weight-bold)', color: 'var(--hub-text-secondary)', textTransform: 'uppercase' }}>
                            Menu Ativo:
                        </span>
                        <select 
                            value={activeMenuId} 
                            onChange={(e) => setActiveMenuId(e.target.value)}
                            style={{ 
                                padding: 'var(--hub-space-2)', 
                                borderRadius: 'var(--hub-radius-md)', 
                                border: '1px solid var(--hub-border-strong)',
                                outline: 'none'
                            }}
                        >
                            <option value="">-- Nenhum --</option>
                            {availableMenus.map(m => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        className="cv-btn-primary"
                        onClick={handlePublicar} 
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                A publicar...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Publicar Loja
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Espaço de Trabalho 3-Colunas */}
            <div className="cv-workspace">
                
                {/* 1. Barra Lateral de Camadas / Blocos */}
                <BarraLateral 
                    blocks={blocks} 
                    setBlocks={setBlocks} 
                    selectedBlockId={selectedBlockId} 
                    setSelectedBlockId={setSelectedBlockId}
                    toggleVisibility={toggleVisibility}
                />

                {/* 2. Área Central de Visualização (Preview Iframe) */}
                <AreaDeVisualizacao blocks={blocks} />

                {/* 3. Inspetor de Propriedades (Edição) */}
                <InspetorDePropriedades 
                    selectedBlock={selectedBlock} 
                    updateBlockProps={updateBlockProps} 
                />

            </div>
        </div>
    );
};

export default ConstrutorVitrinePrincipal;
