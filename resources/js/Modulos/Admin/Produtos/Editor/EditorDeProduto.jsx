import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../api';
import { Icons } from '../Compartilhado/Icones';
import { PremiumSaveButton, AnimatedNotification } from '../Compartilhado/ComponentesUI';

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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <AnimatedNotification show={toast.show} status={toast.status} titulo={toast.message} />
            
            <header className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={handleVoltar} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors shadow-sm">
                        <Icons.Back className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {produtoEmEdicao.isNovo ? 'Novo Produto' : 'Editar Produto'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${produtoEmEdicao.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${produtoEmEdicao.status === 'ATIVO' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                {produtoEmEdicao.status}
                            </span>
                            {hasChanges && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">Alterações não salvas</span>}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <PremiumSaveButton onClick={salvarProduto} loading={loadingAcao === 'salvar_produto'} text="Salvar Produto" />
                </div>
            </header>

            <div className="p-4 sm:p-6 pb-0 overflow-x-auto hide-scroll border-b border-slate-100 bg-white">
                <div className="flex bg-slate-100/70 p-1.5 rounded-2xl w-max min-w-full">
                    {AbasEditor.map(aba => (
                        <button 
                            key={aba} 
                            onClick={() => setEditorTab(aba)} 
                            className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap outline-none flex-1 ${editorTab === aba ? 'text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            {editorTab === aba && <motion.div layoutId="activeEditorTab" className="absolute inset-0 bg-white rounded-xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                            <span className="relative z-10 flex items-center gap-2">
                                {aba}
                                {aba === 'GERAL' && Object.keys(errosForm).length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50/30 min-h-[500px]">
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