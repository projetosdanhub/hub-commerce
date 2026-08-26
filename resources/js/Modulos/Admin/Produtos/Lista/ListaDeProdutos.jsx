import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../Compartilhado/Icones';
import { FadeIn } from '../Compartilhado/ComponentesUI';

const ProductsSkeleton = () => (
    <div className="animate-pulse space-y-4 p-5">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-lg"></div>
                    <div className="space-y-2">
                        <div className="h-5 w-48 bg-slate-200 rounded"></div>
                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    </div>
                </div>
                <div className="hidden md:block h-4 w-24 bg-slate-100 rounded"></div>
                <div className="hidden md:block h-4 w-16 bg-slate-100 rounded"></div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        ))}
    </div>
);

export default function ListaDeProdutos({ 
    produtos, 
    categorias,
    isRefreshing, 
    abrirEdicaoProduto,
    abrirNovoProduto 
}) {
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [itensPorPagina, setItensPorPagina] = useState(10);
    const [paginaAtual, setPaginaAtual] = useState(1);

    // Reseta paginação quando o filtro muda
    useEffect(() => { setPaginaAtual(1); }, [termoPesquisa, filtroCategoria, filtroStatus, itensPorPagina]);

    const produtosFiltrados = useMemo(() => {
        return produtos.filter(p => {
            const search = termoPesquisa.toLowerCase();
            const fullSku = `${p.skuRef}-${p.skuSufixo}`.toLowerCase();
            const matchBusca = p.nome.toLowerCase().includes(search) || fullSku.includes(search);
            const matchCat = filtroCategoria === 'TODAS' || p.categoriaPrincipal === filtroCategoria;
            let matchStatus = true;
            if (filtroStatus === 'ATIVO') matchStatus = p.status === 'ATIVO';
            if (filtroStatus === 'INATIVO') matchStatus = p.status === 'INATIVO';
            if (filtroStatus === 'ESGOTADO') matchStatus = p.controlarEstoque && p.estoque === 0 && !p.preVenda;
            if (filtroStatus === 'ENCOMENDA') matchStatus = p.preVenda === true;
            
            return matchBusca && matchCat && matchStatus;
        });
    }, [produtos, termoPesquisa, filtroCategoria, filtroStatus]);

    const indexOfLastItem = paginaAtual * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const currentProdutos = produtosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(produtosFiltrados.length / itensPorPagina);

    return (
        <FadeIn key="prodlist" className="pb-24 relative">
            <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl overflow-hidden flex flex-col z-0 relative">
                <header className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-t-xl">
                    <div className="relative w-full md:w-[400px] group/search">
                        <label htmlFor="busca-produto" className="sr-only">Buscar Produto</label>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-500 transition-colors"><Icons.Search className="w-4 h-4" /></div>
                        <input id="busca-produto" type="text" placeholder="Buscar Produto ou SKU..." value={termoPesquisa} onChange={e => setTermoPesquisa(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-slate-800" />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto flex-col md:flex-row">
                        <select value={itensPorPagina} onChange={(e) => setItensPorPagina(Number(e.target.value))} className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all">
                            <option value={10}>10 por página</option>
                            <option value={20}>20 por página</option>
                            <option value={50}>50 por página</option>
                            <option value={100}>100 por página</option>
                        </select>
                        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all max-w-[200px] truncate">
                            <option value="TODAS">Todas Categorias</option>
                            {categorias.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                        </select>
                        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all max-w-[200px] truncate">
                            <option value="TODOS">Status: Todos</option>
                            <option value="ATIVO">Ativo</option>
                            <option value="INATIVO">Inativo</option>
                            <option value="ESGOTADO">Esgotado</option>
                            <option value="ENCOMENDA">Por Encomenda</option>
                        </select>
                    </div>
                </header>

                <div className="p-0 overflow-x-auto custom-scrollbar">
                    {isRefreshing ? (
                        <ProductsSkeleton />
                    ) : currentProdutos.length > 0 ? (
                        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-[1000px]">
                            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Produto & SKU</th>
                                    <th className="px-6 py-4 text-center">Categoria</th>
                                    <th className="px-6 py-4 text-right">Preço</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Estoque</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentProdutos.map(p => {
                                    const valPromo = parseFloat(p.precoPromo);
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => abrirEdicaoProduto(p)}>
                                            <td className="px-6 py-4 flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                    {p.img ? <img src={p.img} className="w-full h-full object-cover" alt="" /> : <Icons.Image className="w-5 h-5 text-slate-300" />}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-900 text-sm truncate w-56 block group-hover:text-blue-600 transition-colors">{p.nome}</span>
                                                    <span className="text-xs text-slate-500 mt-0.5">{p.skuRef}-{p.skuSufixo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-medium text-slate-900 text-sm">{p.categoriaPrincipal || 'Sem Categoria'}</span>
                                                    {p.categoriasSecundarias && p.categoriasSecundarias.length > 0 && (
                                                        <span className="text-xs font-medium text-slate-500 mt-0.5">+ {p.categoriasSecundarias.length} extras</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {valPromo > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-slate-400 line-through">R$ {parseFloat(p.preco).toFixed(2)}</span>
                                                        <span className="font-semibold text-emerald-600 text-sm">R$ {valPromo.toFixed(2)}</span>
                                                    </div>
                                                ) : <span className="font-semibold text-slate-900 text-sm">R$ {parseFloat(p.preco).toFixed(2)}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    {p.status === 'INATIVO' ? <span className="px-3 py-1 inline-flex items-center justify-center text-[11px] font-semibold rounded-full border shadow-sm bg-slate-50 text-slate-500 border-slate-200">INATIVO</span> : p.status === 'OCULTO' ? <span className="px-3 py-1 inline-flex items-center justify-center text-[11px] font-semibold rounded-full border shadow-sm bg-amber-50 text-amber-600 border-amber-200">OCULTO</span> : <span className="px-3 py-1 inline-flex items-center justify-center text-[11px] font-semibold rounded-full border shadow-sm bg-emerald-50 text-emerald-600 border-emerald-200">ATIVO</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {p.preVenda ? <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">Encomenda</span> : (p.controlarEstoque ? (p.estoque === 0 ? <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">Esgotado</span> : p.estoque <= (p.alertaEstoque || 5) ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">{p.estoque} (Baixo)</span> : <span className="text-sm font-semibold text-slate-700">{p.estoque} un</span>) : <span className="text-xs font-medium text-slate-400">Infinito</span>)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-4">
                                <Icons.Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhum produto encontrado</h3>
                            <p className="text-sm text-slate-500 max-w-sm mb-6">Não encontramos produtos com os filtros atuais. Limpe a busca ou crie um novo produto.</p>
                            <div className="flex gap-4">
                                {(termoPesquisa !== '' || filtroCategoria !== 'TODAS' || filtroStatus !== 'TODOS') && (
                                    <button onClick={() => { setTermoPesquisa(''); setFiltroCategoria('TODAS'); setFiltroStatus('TODOS'); }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm">
                                        Limpar Filtros
                                    </button>
                                )}
                                <button onClick={abrirNovoProduto} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 text-sm flex items-center gap-2">
                                    <Icons.Plus className="w-4 h-4" /> Novo Produto
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <footer className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-xl">
                        <span className="text-sm font-medium text-slate-500">Página {paginaAtual} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-colors shadow-sm">
                                <Icons.ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPaginaAtual(p => Math.min(totalPages, p + 1))} disabled={paginaAtual === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-colors shadow-sm">
                                <Icons.ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </FadeIn>
    );
}
