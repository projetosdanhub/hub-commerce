import React, { useState, useEffect } from 'react';
import { Icons } from '../Compartilhado/Icones';
import { formatDateBR } from '../Compartilhado/ComponentesUI';
import api from '../../../../api';

export default function AuditoriaProdutos() {
    const [filtroTempo, setFiltroTempo] = useState('7d');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/products/audits');
            if (response.data.status === 'success') {
                setLogs(response.data.data);
            } else {
                setError('Erro ao carregar auditoria.');
            }
        } catch (err) {
            setError('Falha de conexão com a API.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // Filtro simplificado no front-end para o MVP
    const filteredLogs = logs.filter(log => {
        if (filtroTempo === 'Hoje') {
            const today = new Date().toISOString().split('T')[0];
            return log.created_at.startsWith(today);
        }
        if (filtroTempo === '7d') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(log.created_at) >= sevenDaysAgo;
        }
        if (filtroTempo === '30d') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(log.created_at) >= thirtyDaysAgo;
        }
        return true;
    });

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <header className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Icons.History className="w-5 h-5 text-blue-600" /> Auditoria e Logs
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Histórico completo de alterações no catálogo.</p>
                </div>
                
                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                    {['Hoje', '7d', '30d'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFiltroTempo(f)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filtroTempo === f ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {error && (
                <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm flex items-center gap-2">
                    <Icons.AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="py-4 px-6 text-xs font-bold tracking-wider text-slate-500 uppercase">Data / Hora</th>
                            <th className="py-4 px-6 text-xs font-bold tracking-wider text-slate-500 uppercase">Usuário / Ator</th>
                            <th className="py-4 px-6 text-xs font-bold tracking-wider text-slate-500 uppercase">Ação</th>
                            <th className="py-4 px-6 text-xs font-bold tracking-wider text-slate-500 uppercase">Entidade</th>
                            <th className="py-4 px-6 text-xs font-bold tracking-wider text-slate-500 uppercase">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array(4).fill(0).map((_, idx) => (
                                <tr key={idx} className="animate-pulse">
                                    <td className="py-4 px-6">
                                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                        <div className="h-3 bg-slate-100 rounded w-16"></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="h-5 bg-slate-200 rounded w-28 mb-1"></div>
                                        <div className="h-3 bg-slate-100 rounded w-20"></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="h-5 bg-slate-200 rounded w-20"></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="h-4 bg-slate-200 rounded w-full max-w-[250px]"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-slate-500">
                                    Nenhum log encontrado para o período selecionado.
                                </td>
                            </tr>
                        ) : filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{formatDateBR(log.created_at)}</div>
                                    <div className="text-xs text-slate-400">{new Date(log.created_at).toLocaleTimeString('pt-BR')}</div>
                                </td>
                                <td className="py-4 px-6">
                                    {log.admin ? (
                                        <div className="flex flex-col">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {log.admin.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider pl-1">
                                                {log.admin.role || 'Administrador'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                                                Sistema
                                            </span>
                                            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider pl-1">
                                                Automático
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        log.acao === 'Criação' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        log.acao === 'Exclusão' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                        {log.acao}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm font-bold text-slate-800">{log.entidade}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-sm text-slate-600 truncate max-w-[300px]" title={log.detalhes}>{log.detalhes}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
