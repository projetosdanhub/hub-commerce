import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CarriersIcons, Pagination } from '../Shared/CarriersUI';
import api from '../../../../api';

export default function CarrierDetail({ carrier, onEdit, onBack }) {
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [uploadingOrder, setUploadingOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (carrier && carrier.id) {
            fetchOrders();
        }
    }, [carrier, currentPage, startDate, endDate]);

    const fetchOrders = async () => {
        try {
            setIsLoadingOrders(true);
            const res = await api.get(`/admin/carriers/${carrier.id}/orders?page=${currentPage}&start_date=${startDate}&end_date=${endDate}`);
            if (res.data.status === 'success') {
                setOrders(res.data.data.data || []);
                setLastPage(res.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Erro ao carregar pedidos da transportadora:", error);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleUploadRomaneio = async (e, orderId) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingOrder(orderId);
            const formData = new FormData();
            formData.append('arquivo', file);

            const res = await api.post(`/admin/carriers/orders/${orderId}/romaneio`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.status === 'success') {
                // Atualiza na lista local
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, romaneio_url: res.data.url } : o));
            }
        } catch (error) {
            console.error("Erro no upload do romaneio:", error);
            alert("Erro ao enviar o arquivo.");
        } finally {
            setUploadingOrder(null);
            e.target.value = null; // reset input
        }
    };

    const handleDownloadDocument = async (url, type) => {
        try {
            await api.post('/admin/carriers/audit-download', {
                document_type: type,
                carrier_name: carrier.nome
            });
        } catch (error) {
            console.error("Erro ao registrar download:", error);
        }
        window.open(url, '_blank');
    };

    if (!carrier) return null;

    return (
        <div className="w-full bg-slate-50/50 sm:rounded-[32px] rounded-t-[32px] overflow-hidden flex flex-col min-h-[600px]">
            <header className="p-6 sm:p-8 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"><CarriersIcons.ArrowLeft className="w-5 h-5"/></button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-2 shadow-sm shrink-0">
                            {carrier.imagem ? <img src={carrier.imagem} className="max-w-full max-h-full object-contain mix-blend-multiply" alt=""/> : <CarriersIcons.Truck className="w-6 h-6 text-slate-300"/>}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-800">{carrier.nome}</h2>
                                <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${carrier.status === 'ATIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {carrier.status}
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                Cadastrada em {carrier.created_at ? new Date(carrier.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                            </p>
                        </div>
                    </div>
                </div>
                <button onClick={onEdit} className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2">
                    <CarriersIcons.Edit className="w-4 h-4" /> Editar
                </button>
            </header>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* Alertas - Status Reason */}
                    {carrier.status === 'INATIVA' && carrier.status_reason && (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                            <CarriersIcons.AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-black text-rose-800 uppercase tracking-widest mb-1">Motivo da Inativação</h4>
                                <p className="text-rose-600 font-medium text-sm">{carrier.status_reason}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Estatísticas */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                                <CarriersIcons.Package className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total de Envios</span>
                            <span className="text-4xl font-black text-slate-800">{carrier.pedidos_count || 0}</span>
                        </div>
                        
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                <CarriersIcons.Clock className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Prazo Estimado</span>
                            <span className="text-2xl font-black text-slate-800">{carrier.tempo_entrega || 'N/A'}</span>
                        </div>

                        {/* Veículo (se houver) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 opacity-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
                            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-2 relative z-10">
                                <CarriersIcons.Truck className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest relative z-10">Veículo Vinculado</span>
                            <div className="relative z-10 flex flex-col items-center">
                                {carrier.vehicle_plate ? (
                                    <>
                                        <span className="text-lg font-black text-slate-800 uppercase bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shadow-inner mb-1">{carrier.vehicle_plate}</span>
                                        <span className="text-sm font-bold text-slate-500">{carrier.vehicle_model || 'Modelo não informado'}</span>
                                    </>
                                ) : (
                                    <span className="text-sm font-bold text-slate-400">Nenhum veículo</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Seção Endereço */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CarriersIcons.MapPin className="w-4 h-4 text-slate-400"/> Sede / Coleta
                            </h3>
                            {carrier.cep ? (
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Logradouro</span>
                                        <span className="text-sm font-bold text-slate-800">{carrier.rua || '-'}, {carrier.numero || 'S/N'} {carrier.complemento ? ` - ${carrier.complemento}` : ''}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Bairro</span>
                                            <span className="text-sm font-bold text-slate-800">{carrier.bairro || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Cidade/UF</span>
                                            <span className="text-sm font-bold text-slate-800">{carrier.cidade || '-'} / {carrier.uf || '-'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold block">CEP</span>
                                        <span className="text-sm font-mono font-bold text-slate-800">{carrier.cep}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <span className="text-sm font-bold text-slate-400">Endereço não cadastrado</span>
                                </div>
                            )}
                        </div>

                        {/* Documentos */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CarriersIcons.FileText className="w-4 h-4 text-slate-400"/> Documentos Anexos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'CNH', path: carrier.document_cnh },
                                    { label: 'RG Frente', path: carrier.document_rg_front },
                                    { label: 'RG Verso', path: carrier.document_rg_back }
                                ].map((doc, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border ${doc.path ? 'border-slate-200 bg-slate-50 hover:border-blue-300 cursor-pointer transition-colors' : 'border-dashed border-slate-200 bg-slate-50/50 opacity-60'} flex items-center justify-between group`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                                                <CarriersIcons.FileText className={`w-5 h-5 ${doc.path ? 'text-blue-500' : 'text-slate-300'}`} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{doc.label}</span>
                                        </div>
                                        {doc.path && (
                                            <button 
                                                onClick={() => handleDownloadDocument(doc.path, doc.label)} 
                                                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors"
                                            >
                                                <CarriersIcons.ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Romaneios e Comprovantes */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <CarriersIcons.FileText className="w-4 h-4 text-slate-400"/> Pedidos Despachados & Romaneios
                            </h3>
                            <div className="flex items-center gap-2">
                                <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500 shadow-sm transition-all" />
                                <span className="text-slate-400 text-xs font-bold">até</span>
                                <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-500 shadow-sm transition-all" />
                            </div>
                        </div>
                        
                        {isLoadingOrders ? (
                            <div className="flex justify-center p-8"><CarriersIcons.Spinner className="w-8 h-8 text-blue-500"/></div>
                        ) : orders.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-12 flex flex-col items-center justify-center text-center bg-slate-50/50">
                                <CarriersIcons.Package className="w-12 h-12 text-slate-300 mb-4" />
                                <h4 className="text-base font-black text-slate-700 mb-1">Nenhum envio realizado</h4>
                                <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Os pedidos vinculados a esta transportadora aparecerão aqui para você anexar romaneios ou imagens.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                                            <th className="pb-4 font-bold">Pedido / Rastreio</th>
                                            <th className="pb-4 font-bold">Data</th>
                                            <th className="pb-4 font-bold">Status</th>
                                            <th className="pb-4 font-bold text-right">Ações (Romaneio)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4">
                                                    <span className="font-black text-slate-800 block">#HUB-{order.id}</span>
                                                    <span className="text-xs text-slate-500">{order.tracking_code || 'Sem rastreio'}</span>
                                                </td>
                                                <td className="py-4 text-sm font-bold text-slate-600">{order.created_at}</td>
                                                <td className="py-4">
                                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase tracking-wider border border-slate-200">{order.status}</span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {order.romaneio_url ? (
                                                            <button 
                                                                onClick={() => handleDownloadDocument(order.romaneio_url, `Romaneio do Pedido #${order.id}`)}
                                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5 transition-colors"
                                                            >
                                                                <CarriersIcons.ExternalLink className="w-3.5 h-3.5"/> Ver Arquivo
                                                            </button>
                                                        ) : (
                                                            <label className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors">
                                                                {uploadingOrder === order.id ? <CarriersIcons.Spinner className="w-3.5 h-3.5"/> : <CarriersIcons.Upload className="w-3.5 h-3.5"/>}
                                                                <span>Anexar</span>
                                                                <input 
                                                                    type="file" 
                                                                    className="hidden" 
                                                                    onChange={(e) => handleUploadRomaneio(e, order.id)} 
                                                                    disabled={uploadingOrder === order.id}
                                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!isLoadingOrders && orders.length > 0 && (
                                    <div className="pb-2 pt-6">
                                        <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={setCurrentPage} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
