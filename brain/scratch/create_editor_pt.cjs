const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', '..', 'resources', 'js', 'Modulos', 'Admin', 'Produtos', 'Editor');
const tabsDir = path.join(baseDir, 'abas');

if (!fs.existsSync(tabsDir)) {
    fs.mkdirSync(tabsDir, { recursive: true });
}

const productEditorContent = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../../api';
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
            const skuCompleto = \`\${produtoEmEdicao.skuRef ? produtoEmEdicao.skuRef + '-' : ''}\${skuFinal}\`;
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
                    showToast('error', \`SKUs já existem: \${validRes.data.duplicados.join(', ')}\`, 4000);
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
                    payload.append(\`galeria[\${index}]\`, file);
                });
            }
            if (produtoEmEdicao.variaveis && produtoEmEdicao.variaveis.length > 0) {
                payload.append('variaveis_json', JSON.stringify(produtoEmEdicao.variaveis.map(v => ({...v, img: null}))));
                produtoEmEdicao.variaveis.forEach((v, idx) => {
                    if (v.imgObject) {
                        payload.append(\`variaveis_img_\${idx}\`, v.imgObject);
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
                        <Icons.ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {produtoEmEdicao.isNovo ? 'Novo Produto' : 'Editar Produto'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={\`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border \${produtoEmEdicao.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}\`}>
                                <div className={\`w-1.5 h-1.5 rounded-full \${produtoEmEdicao.status === 'ATIVO' ? 'bg-emerald-500' : 'bg-slate-400'}\`}></div>
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
                            className={\`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap outline-none flex-1 \${editorTab === aba ? 'text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}\`}
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
}`;

fs.writeFileSync(path.join(baseDir, 'EditorDeProduto.jsx'), productEditorContent, 'utf8');

const geralTabContent = `import React from 'react';
import { Icons } from '../../Compartilhado/Icones';

export default function AbaGeral({ p, setP, erros, setErros, categorias }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Informações Básicas</h3>
                    <div className="space-y-4">
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Nome do Produto *
                            </label>
                            <input 
                                type="text" 
                                value={p.nome} 
                                onChange={e => { setErros({...erros, nome: false}); setP({...p, nome: e.target.value}); }} 
                                placeholder="Ex: Cadeira Ergônomica..."
                                className={\`w-full bg-slate-50/50 border \${erros.nome ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'} rounded-xl px-5 py-3.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:ring-4 focus:border-blue-400 transition-all shadow-sm\`} 
                            />
                            {erros.nome && <span className="text-[10px] text-rose-500 font-bold mt-1 block">O nome é obrigatório</span>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="group/input">
                                <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                    SKU Principal (Mestre)
                                </label>
                                <div className="flex">
                                    <div className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-4 py-3.5 text-sm font-bold text-slate-500 flex items-center shadow-sm">
                                        <input type="text" value={p.skuRef} onChange={e => setP({...p, skuRef: e.target.value.toUpperCase()})} placeholder="REF" className="w-16 bg-transparent outline-none text-center" />
                                        <span>-</span>
                                    </div>
                                    <input type="text" value={p.skuSufixo} onChange={e => setP({...p, skuSufixo: e.target.value.toUpperCase()})} placeholder="SUFIXO (Automático se vazio)" className="flex-1 min-w-0 bg-slate-50/50 border border-slate-200 rounded-r-xl px-5 py-3.5 text-sm font-mono font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="group/input">
                                <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                    Status
                                </label>
                                <select value={p.status} onChange={e => setP({...p, status: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10">
                                    <option value="ATIVO">ATIVO - Visível na loja</option>
                                    <option value="INATIVO">INATIVO - Oculto</option>
                                </select>
                            </div>
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Categoria Principal *
                            </label>
                            <select 
                                value={p.categoriaPrincipal} 
                                onChange={e => { setErros({...erros, categoriaPrincipal: false}); setP({...p, categoriaPrincipal: e.target.value}); }}
                                className={\`w-full bg-slate-50/50 border \${erros.categoriaPrincipal ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'} rounded-xl px-5 py-3.5 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:ring-4 focus:border-blue-400 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10\`}
                            >
                                <option value="">Selecione uma categoria...</option>
                                {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                            </select>
                            {erros.categoriaPrincipal && <span className="text-[10px] text-rose-500 font-bold mt-1 block">Selecione a categoria</span>}
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Descrição Completa
                            </label>
                            <textarea 
                                value={p.descricao} 
                                onChange={e => setP({...p, descricao: e.target.value})} 
                                rows="6" 
                                placeholder="Descreva os detalhes, características e diferenciais do produto..."
                                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-sm resize-y min-h-[120px]" 
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Preço</h3>
                    <div className="space-y-4">
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Preço de Venda *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold text-sm">R$</span>
                                </div>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0"
                                    value={p.preco} 
                                    onChange={e => { setErros({...erros, preco: false}); setP({...p, preco: e.target.value}); }} 
                                    className={\`w-full bg-slate-50/50 border \${erros.preco ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'} rounded-xl pl-10 pr-4 py-3.5 text-base font-black text-slate-800 outline-none focus:bg-white focus:ring-4 focus:border-blue-400 transition-all shadow-sm\`} 
                                />
                            </div>
                            {erros.preco && <span className="text-[10px] text-rose-500 font-bold mt-1 block">Preço inválido</span>}
                        </div>
                        <div className="group/input">
                            <label className="text-[10px] font-bold text-slate-500 group-focus-within/input:text-blue-600 uppercase block mb-1.5 transition-colors">
                                Preço Promocional (Opcional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-emerald-500 font-bold text-sm">R$</span>
                                </div>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0"
                                    value={p.precoPromo} 
                                    onChange={e => setP({...p, precoPromo: e.target.value})} 
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-base font-black text-emerald-600 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-sm placeholder:text-emerald-300 placeholder:font-medium" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}`;
fs.writeFileSync(path.join(tabsDir, 'AbaGeral.jsx'), geralTabContent, 'utf8');

const emptyTabContent = `import React from 'react';

export default function TAB_NAME({ p, setP }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[300px]">
            <p className="text-slate-500 font-medium">Conteúdo da aba TAB_NAME em construção...</p>
        </div>
    );
}`;

const tabs = ["FichaTecnica", "Estoque", "Midia", "Variaveis", "Fiscal", "Logistica", "Seo"];
tabs.forEach(tab => {
    fs.writeFileSync(path.join(tabsDir, 'Aba' + tab + '.jsx'), emptyTabContent.replace(/TAB_NAME/g, 'Aba' + tab), 'utf8');
});
