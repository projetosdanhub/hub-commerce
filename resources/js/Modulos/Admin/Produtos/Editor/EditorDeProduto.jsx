import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api';
import { Icons } from '../Compartilhado/Icones';
import { PremiumSaveButton, AnimatedNotification } from '../Compartilhado/ComponentesUI';
import { IconButton } from '../../DesignSystem/primitives/IconButton';
import { Badge } from '../../DesignSystem/primitives/Badge';

import AbaGeral from './abas/AbaGeral';
import AbaFichaTecnica from './abas/AbaFichaTecnica';
import AbaEstoque from './abas/AbaEstoque';
import AbaMidia from './abas/AbaMidia';
import AbaVariaveis from './abas/AbaVariaveis';
import AbaFiscal from './abas/AbaFiscal';
import AbaLogistica from './abas/AbaLogistica';
import AbaSeo from './abas/AbaSeo';

export default function EditorDeProduto({ 
    produtoOriginal, 
    onVoltar, 
    onSuccess 
}) {
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(produtoOriginal);
    const [editorTab, setEditorTab] = useState('GERAL');
    const [errosForm, setErrosForm] = useState({});
    const [loadingAcao, setLoadingAcao] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [toast, setToast] = useState({ show: false, status: '', message: '' });

    const hasChanges = JSON.stringify(produtoEmEdicao) !== JSON.stringify(produtoOriginal);

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        try {
            const res = await api.get('/admin/categories');
            if(res.data && res.data.data) {
                setCategorias(res.data.data);
            }
        } catch(e) {
            console.error("Erro ao carregar categorias", e);
        }
    };

    const showToast = (status, message, time = 3000) => {
        setToast({ show: true, status, message });
        if(time > 0) {
            setTimeout(() => setToast({ show: false, status: '', message: '' }), time);
        }
    };

    const salvarProduto = async () => {
        setLoadingAcao('salvar_produto');
        const erros = {};
        if (!produtoEmEdicao.nome.trim()) erros.nome = true;
        
        // Fix for 500 internal server error: Validating categories explicitly
        if (!produtoEmEdicao.categoriaPrincipal) erros.categoriaPrincipal = true;
        
        const pco = parseFloat(produtoEmEdicao.preco);
        if (isNaN(pco) || pco <= 0) erros.preco = true;

        if (Object.keys(erros).length > 0) {
            setErrosForm(erros);
            setEditorTab('GERAL');
            setLoadingAcao(null);
            showToast('error', 'Preencha os campos obrigatórios na aba GERAL.');
            return;
        }

        try {
            const skuFinal = produtoEmEdicao.skuSufixo.trim() === '' ? Math.floor(Math.random() * 10000).toString() : produtoEmEdicao.skuSufixo;
            
            const skusParaValidar = [];
            const skuCompleto = `${produtoEmEdicao.skuRef ? produtoEmEdicao.skuRef + '-' : ''}${skuFinal}`;
            if (skuCompleto !== '-') skusParaValidar.push(skuCompleto);
            if (produtoEmEdicao.variaveis && produtoEmEdicao.variaveis.length > 0) {
                produtoEmEdicao.variaveis.forEach(v => {
                    if (v.sku && v.sku.trim() !== '') skusParaValidar.push(v.sku);
                });
            }

            if (skusParaValidar.length > 0) {
                showToast('loading', 'Validando SKUs...', 0);
                const validRes = await api.post('/admin/products/validate-skus', {
                    skus: skusParaValidar,
                    ignore_product_id: produtoEmEdicao.id || null
                });
                
                if (validRes.data.duplicados && validRes.data.duplicados.length > 0) {
                    showToast('error', `SKUs já existem: ${validRes.data.duplicados.join(', ')}`, 4000);
                    setLoadingAcao(null);
                    return;
                }
            }

            const catSelecionada = categorias.find(c => c.nome === produtoEmEdicao.categoriaPrincipal);
            const catId = catSelecionada ? catSelecionada.id : (categorias.length > 0 ? categorias[0].id : null);
            
            if(!catId) {
                showToast('error', 'Nenhuma categoria válida encontrada no sistema.', 4000);
                setLoadingAcao(null);
                return;
            }

            const payload = new FormData();
            if (produtoEmEdicao.id) payload.append('id', produtoEmEdicao.id);
            payload.append('nome', produtoEmEdicao.nome || '');
            payload.append('categoria_id', catId);
            payload.append('descricao', produtoEmEdicao.descricao || '');
            payload.append('preco', pco);
            if (!isNaN(parseFloat(produtoEmEdicao.precoPromo))) payload.append('preco_promo', parseFloat(produtoEmEdicao.precoPromo));
            payload.append('quantidade_estoque', isNaN(parseFloat(produtoEmEdicao.estoque)) ? 0 : parseFloat(produtoEmEdicao.estoque));
            payload.append('status_vitrine', (produtoEmEdicao.status === 'INATIVO' || (produtoEmEdicao.controlarEstoque && (isNaN(parseFloat(produtoEmEdicao.estoque)) ? 0 : parseFloat(produtoEmEdicao.estoque)) <= 0 && !produtoEmEdicao.preVenda)) ? 'INATIVO' : produtoEmEdicao.status);
            payload.append('sku_ref', produtoEmEdicao.skuRef || '');
            payload.append('sku_sufixo', skuFinal || '');
            payload.append('meta_title', produtoEmEdicao.metaTitle || '');
            payload.append('meta_description', produtoEmEdicao.metaDesc || '');
            payload.append('slug', produtoEmEdicao.slug || '');
            payload.append('controlar_estoque', produtoEmEdicao.controlarEstoque ? 1 : 0);
            payload.append('alerta_estoque', produtoEmEdicao.alertaEstoque || 5);
            payload.append('alerta_moderado', produtoEmEdicao.alertaModerado || 20);
            payload.append('alerta_alto', produtoEmEdicao.alertaAlto || 50);
            payload.append('pre_venda', produtoEmEdicao.preVenda ? 1 : 0);
            payload.append('ficha_tecnica', JSON.stringify(produtoEmEdicao.fichaTecnica || []));
            
            // Campos Fiscais
            payload.append('ncm', produtoEmEdicao.ncm || '');
            payload.append('cest', produtoEmEdicao.cest || '');
            payload.append('gtin', produtoEmEdicao.gtin || '');
            payload.append('origem', produtoEmEdicao.origem || '0');
            payload.append('csosn', produtoEmEdicao.cst || '102');
            payload.append('cst', produtoEmEdicao.cst || '102');
            payload.append('cfop_dentro', produtoEmEdicao.cfop || '');
            payload.append('cfop', produtoEmEdicao.cfop || '');
            payload.append('unidade_medida', produtoEmEdicao.unidade || 'UN');
            payload.append('unidade', produtoEmEdicao.unidade || 'UN');
            if (produtoEmEdicao.icmsPerc !== undefined && produtoEmEdicao.icmsPerc !== '') payload.append('icms_perc', produtoEmEdicao.icmsPerc);
            if (produtoEmEdicao.ipiPerc !== undefined && produtoEmEdicao.ipiPerc !== '') payload.append('ipi_perc', produtoEmEdicao.ipiPerc);
            
            // Dimensões
            if (produtoEmEdicao.peso) payload.append('peso', produtoEmEdicao.peso);
            if (produtoEmEdicao.comp) payload.append('comprimento', produtoEmEdicao.comp);
            if (produtoEmEdicao.largura) payload.append('largura', produtoEmEdicao.largura);
            if (produtoEmEdicao.altura) payload.append('altura', produtoEmEdicao.altura);
            payload.append('agrupavel', produtoEmEdicao.agrupavel ? 1 : 0);
            
            if (produtoEmEdicao.imgObject) {
                payload.append('img', produtoEmEdicao.imgObject);
            }
            if (produtoEmEdicao.videoObject) {
                payload.append('video', produtoEmEdicao.videoObject);
            }
            if (produtoEmEdicao.galeriaObjects && produtoEmEdicao.galeriaObjects.length > 0) {
                produtoEmEdicao.galeriaObjects.forEach((file, index) => {
                    payload.append(`galeria[${index}]`, file);
                });
            }
            if (produtoEmEdicao.variaveis && produtoEmEdicao.variaveis.length > 0) {
                payload.append('variaveis_json', JSON.stringify(produtoEmEdicao.variaveis.map(v => ({...v, img: null}))));
                produtoEmEdicao.variaveis.forEach((v, idx) => {
                    if (v.imgObject) {
                        payload.append(`variaveis_img_${idx}`, v.imgObject);
                    }
                });
            }

            showToast('loading', 'Salvando produto...', 0);
            
            const res = await api.post('/admin/products', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.status === 'success') {
                showToast('success', res.data.message || 'Produto salvo com sucesso!');
                setProdutoEmEdicao(res.data.data);
                onSuccess();
            }
        } catch (e) {
            console.error(e);
            showToast('error', e.response?.data?.message || 'Falha ao salvar produto.', 4000);
        } finally {
            setLoadingAcao(null);
        }
    };

    const handleVoltar = () => {
        if(hasChanges) {
            if(window.confirm('Existem alterações não salvas. Deseja realmente voltar?')) {
                onVoltar();
            }
        } else {
            onVoltar();
        }
    };

    const AbasEditor = ['GERAL', 'FICHA TÉCNICA', 'ESTOQUE', 'MÍDIA', 'VARIAÇÕES', 'FISCAL', 'LOGÍSTICA', 'SEO'];

    return (
        <div className="hub-panel" style={{ overflow: 'hidden' }}>
            <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
            
            <header className="modal-responsive-flex" style={{ display: 'flex', padding: '24px', borderBottom: '1px solid var(--hub-border-subtle)', backgroundColor: 'var(--hub-surface-subtle)', position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(12px)', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <IconButton 
                        icon={Icons.Back} 
                        onClick={handleVoltar} 
                        label="Voltar"
                        style={{ backgroundColor: '#fff', border: '1px solid var(--hub-border-subtle)' }}
                    />
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--hub-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, letterSpacing: '-0.02em' }}>
                            {produtoEmEdicao.isNovo ? 'Novo Produto' : 'Editar Produto'}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <Badge variant={produtoEmEdicao.status === 'ATIVO' ? 'success' : 'neutral'}>
                                {produtoEmEdicao.status}
                            </Badge>
                            {hasChanges && <Badge variant="warning">Alterações não salvas</Badge>}
                        </div>
                    </div>
                </div>
                <div className="modal-responsive-flex" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: 'auto' }}>
                    <PremiumSaveButton onClick={salvarProduto} loading={loadingAcao === 'salvar_produto'} text="Salvar Produto" />
                </div>
            </header>

            <div className="custom-scrollbar" style={{ padding: '24px 24px 0 24px', overflowX: 'auto', borderBottom: '1px solid var(--hub-border-subtle)', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', backgroundColor: 'var(--hub-surface-subtle)', padding: '4px', borderRadius: 'var(--hub-radius-lg)', width: 'max-content', minWidth: '100%', marginBottom: '24px' }}>
                    {AbasEditor.map(aba => (
                        <button 
                            key={aba} 
                            onClick={() => setEditorTab(aba)} 
                            style={{ 
                                position: 'relative', 
                                padding: '10px 20px', 
                                borderRadius: 'var(--hub-radius-md)', 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                transition: 'all 0.2s', 
                                whiteSpace: 'nowrap', 
                                outline: 'none', 
                                flex: 1, 
                                backgroundColor: editorTab === aba ? '#fff' : 'transparent',
                                color: editorTab === aba ? 'var(--hub-primary)' : 'var(--hub-text-secondary)',
                                border: 'none',
                                boxShadow: editorTab === aba ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {aba}
                                {aba === 'GERAL' && Object.keys(errosForm).length > 0 && <div className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--hub-danger)' }}></div>}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '24px', backgroundColor: 'var(--hub-surface)', minHeight: '500px' }}>
                <AnimatePresence mode="wait">
                    <motion.div key={editorTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {editorTab === 'GERAL' && <AbaGeral p={produtoEmEdicao} setP={setProdutoEmEdicao} erros={errosForm} setErros={setErrosForm} categorias={categorias} />}
                        {editorTab === 'FICHA TÉCNICA' && <AbaFichaTecnica p={produtoEmEdicao} setP={setProdutoEmEdicao} />}
                        {editorTab === 'ESTOQUE' && <AbaEstoque p={produtoEmEdicao} setP={setProdutoEmEdicao} />}
                        {editorTab === 'MÍDIA' && <AbaMidia p={produtoEmEdicao} setP={setProdutoEmEdicao} />}
                        {editorTab === 'VARIAÇÕES' && <AbaVariaveis p={produtoEmEdicao} setP={setProdutoEmEdicao} erros={errosForm} setErros={setErrosForm} />}
                        {editorTab === 'FISCAL' && <AbaFiscal p={produtoEmEdicao} setP={setProdutoEmEdicao} />}
                        {editorTab === 'LOGÍSTICA' && <AbaLogistica p={produtoEmEdicao} setP={setProdutoEmEdicao} />}
                        {editorTab === 'SEO' && <AbaSeo p={produtoEmEdicao} setP={setProdutoEmEdicao} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}