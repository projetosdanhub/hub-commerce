// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/AfiliadosDashboard.jsx
// ARQUITETURA: Sem Header/Footer (Geridos globalmente pelo app.jsx)
// ============================================================================

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const AfiliadosDashboard = () => {
    // --- DADOS MOCK (Serão alimentados pela API real depois) ---
    const afiliado = {
        saldo: 450.50, 
        cliques: 1240, 
        vendas: 18, 
        conversao: "1.4%",
        linkUnico: "https://hubcommerce.pt/ref/socia99"
    };

    const produtosComissionados = [
        { id: 1, nome: "Auscultadores Bluetooth Premium", comissao: "15%", ganho: "R$ 52,50", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80" },
        { id: 2, nome: "Caneca Mágica Personalizada", comissao: "20%", ganho: "R$ 13,18", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100&q=80" }
    ];

    // Garante que a página carrega sempre no topo
    useEffect(() => {
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(afiliado.linkUnico);
        alert("Link copiado com sucesso! Agora é só partilhar.");
    };

    return (
        <div className="w-full">
            <Helmet>
                <title>Painel de Afiliado | HUB Commerce</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
                
                {/* CABEÇALHO DO DASHBOARD */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Painel de Afiliados</h1>
                        <p className="text-gray-500 mt-1">Recomende os nossos produtos e ganhe comissões reais a cada venda.</p>
                    </div>
                    <button className="bg-[#111827] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:bg-gray-800 transition-colors">
                        Solicitar Saque (Pix)
                    </button>
                </div>

                {/* MÉTRICAS PRINCIPAIS (Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-[20px] p-6 border border-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.05)] border-l-4 border-l-emerald-500">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Saldo Disponível</span>
                        <h3 className="text-3xl font-black text-gray-900">R$ {afiliado.saldo.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total de Cliques</span>
                        <h3 className="text-3xl font-black text-gray-900">{afiliado.cliques}</h3>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Vendas Realizadas</span>
                        <h3 className="text-3xl font-black text-gray-900">{afiliado.vendas}</h3>
                    </div>
                    <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Taxa de Conversão</span>
                        <h3 className="text-3xl font-black text-emerald-600">{afiliado.conversao}</h3>
                    </div>
                </div>

                {/* ÁREA DE LINK DE INDICAÇÃO */}
                <div className="bg-sky-50 border border-sky-100 rounded-[24px] p-6 sm:p-8 mb-10 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                    <div className="flex-grow w-full">
                        <span className="text-[12px] font-bold text-sky-700 uppercase tracking-wider mb-2 block flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            O Seu Link de Indicação (Global)
                        </span>
                        <input 
                            type="text" 
                            readOnly 
                            value={afiliado.linkUnico} 
                            className="w-full bg-white border border-sky-200 text-sky-900 rounded-xl px-4 h-14 font-medium outline-none focus:ring-2 focus:ring-sky-200 transition-all" 
                        />
                    </div>
                    <button 
                        onClick={handleCopyLink} 
                        className="w-full md:w-auto h-14 bg-sky-600 text-white font-bold px-8 rounded-xl shadow-md hover:bg-sky-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        Copiar Link
                    </button>
                </div>

                {/* TABELA DE COMISSÕES */}
                <h2 className="text-xl font-bold text-gray-900 mb-6">Últimas Comissões Geradas</h2>
                <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 uppercase tracking-wider">
                                    <th className="p-5 font-bold">Produto Vendido</th>
                                    <th className="p-5 font-bold text-center">A sua Comissão (%)</th>
                                    <th className="p-5 font-bold text-right">Ganho Real</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosComissionados.map(prod => (
                                    <tr key={prod.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <img src={prod.img} alt={prod.nome} className="w-12 h-12 rounded-xl object-cover border border-gray-100 mix-blend-multiply bg-white" />
                                                <span className="font-bold text-sm text-gray-900">{prod.nome}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-md border border-sky-100">
                                                {prod.comissao}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right font-black text-emerald-600 text-lg">
                                            {prod.ganho}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AfiliadosDashboard;