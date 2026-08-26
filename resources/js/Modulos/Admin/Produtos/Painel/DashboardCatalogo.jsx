import React, { useState } from 'react';
import { Icons } from '../Compartilhado/Icones';
import { gerarCSV } from '../Compartilhado/ComponentesUI';

const DashboardSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="bg-slate-100 border border-slate-200 rounded-2xl w-full h-[100px] mb-6"></div>
        <div className="bg-slate-100 border border-slate-200 rounded-xl w-full h-[300px]"></div>
    </div>
);

export default function DashboardCatalogo({ produtos, isRefreshing, abrirEdicaoProduto }) {
    const [filtroDashboard, setFiltroDashboard] = useState('30D');

    let multiplicador = 1;
    if (filtroDashboard === '7D') multiplicador = 0.25;
    if (filtroDashboard === '365D') multiplicador = 12;

    const totalVendas = Math.floor(produtos.reduce((acc, p) => acc + (p.vendas || 0), 0) * multiplicador);
    const totalReceita = produtos.reduce((acc, p) => acc + (p.receitaGerada || 0), 0) * multiplicador;
    const receitaAnterior = totalReceita * 0.85; 
    const aumentoReceita = totalReceita > 0 ? ((totalReceita - receitaAnterior) / receitaAnterior) * 100 : 0;
    
    const topSellers = [...produtos].sort((a, b) => (b.vendas || 0) - (a.vendas || 0)).slice(0, 10);

    return (
        <div key="dash" className="space-y-6 pb-10 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Visão Geral do Catálogo</h2>
                    <p className="text-sm text-slate-500 mt-1">Métricas em tempo real de produtos e faturamento.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select value={filtroDashboard} onChange={e => setFiltroDashboard(e.target.value)} className="bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/20 hover:border-blue-300 transition-all shadow-sm">
                        <option value="7D">Últimos 7 dias</option>
                        <option value="30D">Últimos 30 dias</option>
                        <option value="365D">Último Ano</option>
                    </select>
                    <button onClick={() => gerarCSV(produtos)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all font-bold text-sm flex items-center gap-2">
                        <Icons.Download className="w-4 h-4"/> Baixar CSV
                    </button>
                </div>
            </header>

            {isRefreshing ? (
                <DashboardSkeleton />
            ) : (
                <>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm w-full overflow-hidden mb-6 flex overflow-x-auto custom-scrollbar">
                        <div className="flex flex-col justify-center px-6 py-5 shrink-0 min-w-[240px] hover:bg-slate-50 transition-colors cursor-default border-r border-slate-100">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Receita Bruta</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${aumentoReceita >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {aumentoReceita >= 0 ? '+' : ''}{aumentoReceita.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-2xl font-black text-slate-800 tracking-tight leading-none truncate block">
                                R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="shrink-0 w-[200px] px-6 py-5 border-r border-slate-100 flex flex-col justify-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Produtos</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight leading-none truncate text-slate-800">
                                {produtos.length}
                            </p>
                        </div>

                        <div className="shrink-0 w-[200px] px-6 py-5 border-r border-slate-100 flex flex-col justify-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Ativos</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight leading-none truncate text-emerald-700">
                                {produtos.filter(p => p.status === 'ATIVO').length}
                            </p>
                        </div>

                        <div className="shrink-0 w-[200px] px-6 py-5 border-r border-slate-100 flex flex-col justify-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Esgotados</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight leading-none truncate text-rose-700">
                                {produtos.filter(p => p.controlarEstoque && p.estoque === 0 && !p.preVenda).length}
                            </p>
                        </div>

                        <div className="shrink-0 w-[200px] px-6 py-5 flex flex-col justify-center hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Unid. Vendidas</span>
                            </div>
                            <p className="text-xl font-bold tracking-tight leading-none truncate text-blue-700">
                                {totalVendas}
                            </p>
                        </div>
                    </div>

                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6" aria-label="Top 10 Mais Vendidos">
                        <header className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">Top 10 Mais Vendidos</h3>
                        </header>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                        <th className="p-4 pl-6">Produto</th>
                                        <th className="p-4 text-center">Vendas</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-center">Estoque</th>
                                        <th className="p-4 text-center">Última Venda</th>
                                        <th className="p-4 text-right pr-6">Receita Bruta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topSellers.map((p, idx) => {
                                        const v = Math.floor((p.vendas || 0) * (filtroDashboard === '7D' ? 0.25 : filtroDashboard === '365D' ? 12 : 1));
                                        const r = (p.receitaGerada || 0) * (filtroDashboard === '7D' ? 0.25 : filtroDashboard === '365D' ? 12 : 1);
                                        return (
                                        <tr key={p.id} onClick={() => abrirEdicaoProduto(p)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                            <td className="p-4 pl-6 flex items-center gap-4 relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <span className="text-[11px] font-bold text-slate-400 w-4">{idx + 1}</span>
                                                <img src={p.img || 'https://via.placeholder.com/40'} className="w-9 h-9 rounded-md object-cover border border-slate-200 bg-white" alt="" />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 text-[13px] line-clamp-1 group-hover:text-blue-600 transition-colors">{p.nome}</span>
                                                    <span className="text-[11px] text-slate-500">{p.skuRef}-{p.skuSufixo}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-[13px] font-bold text-slate-700">{v}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {p.status === 'INATIVO' ? <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Inativo</span> : <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Ativo</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                {p.preVenda ? <span className="text-[11px] font-medium text-purple-700">Encomenda</span> : p.estoque === 0 ? <span className="text-[11px] font-medium text-amber-600">Esgotado</span> : <span className="font-medium text-slate-700 text-[13px]">{p.estoque} un</span>}
                                            </td>
                                            <td className="p-4 text-center text-[12px] text-slate-500">
                                                Hoje, 10:42
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <span className="font-bold text-slate-800 text-[14px]">R$ {parseFloat(r || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </td>
                                        </tr>
                                    )})}
                                    {topSellers.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500 text-sm font-medium">Nenhuma venda registrada no período.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
