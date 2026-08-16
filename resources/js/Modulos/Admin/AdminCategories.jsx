// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminCategories.jsx
// ARQUITETURA: Gestão de Categorias conectada à API
// UI/UX: Premium Minimal SaaS | Soft Light
// ============================================================================

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

const Icons = {
    Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
};

const AdminCategories = () => {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [categoriaEmEdicao, setCategoriaEmEdicao] = useState({ id: null, nome: '', status: 'ATIVA' });

    // 1. Buscar Categorias da API
    const { data: categorias = [], isLoading } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: async () => {
             const res = await api.get('/admin/categories');
             return res.data.data;
            return []; // Retornando vazio para não quebrar enquanto o Laravel não estiver pronto
        }
    });

    // 2. Salvar/Atualizar Categoria
    const mutacaoSalvar = useMutation({
        mutationFn: async (dados) => await api.post('/admin/categories', dados),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
            setModalOpen(false);
        }
    });

    // 3. Excluir Categoria
    const mutacaoExcluir = useMutation({
        mutationFn: async (id) => await api.delete(`/admin/categories/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['adminCategories'])
    });

    const abrirModalNovo = () => {
        setCategoriaEmEdicao({ id: null, nome: '', status: 'ATIVA' });
        setModalOpen(true);
    };

    const salvarCategoria = () => {
        if(!categoriaEmEdicao.nome) return alert('O nome é obrigatório!');
        // mutacaoSalvar.mutate(categoriaEmEdicao);
        setModalOpen(false); // Simulação temporária
    };

    const excluirCategoria = (id) => {
        if(window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            // mutacaoExcluir.mutate(id);
        }
    };

    return (
        <div className="w-full pb-20 font-sans">
            <Helmet><title>Categorias | HUB ADMIN</title></Helmet>

            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categorias</h1>
                    <p className="text-slate-500 text-sm mt-1">Organize o seu catálogo de produtos.</p>
                </div>
                <button onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors">
                    <Icons.Plus /> Nova Categoria
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative z-0">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            <th className="p-5 pl-6">Nome da Categoria</th>
                            <th className="p-5 text-center">Produtos Cadastrados</th>
                            <th className="p-5 text-center">Status</th>
                            <th className="p-5 pr-6 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-bold animate-pulse">Carregando categorias...</td></tr>
                        ) : categorias.length > 0 ? categorias.map(cat => (
                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-5 pl-6 font-bold text-slate-800">{cat.nome}</td>
                                <td className="p-5 text-center font-medium text-slate-600">{cat.qtd_produtos} un.</td>
                                <td className="p-5 text-center">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${cat.status === 'ATIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {cat.status}
                                    </span>
                                </td>
                                <td className="p-5 pr-6 text-right flex justify-end gap-2">
                                    <button onClick={() => {setCategoriaEmEdicao(cat); setModalOpen(true);}} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Icons.Edit /></button>
                                    <button onClick={() => excluirCategoria(cat.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"><Icons.Trash /></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-medium">Nenhuma categoria encontrada no banco de dados.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10 border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900">{categoriaEmEdicao.id ? 'Editar Categoria' : 'Criar Categoria'}</h3>
                                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700"><Icons.Close /></button>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome</label>
                                    <input type="text" value={categoriaEmEdicao.nome} onChange={e => setCategoriaEmEdicao({...categoriaEmEdicao, nome: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500" placeholder="Ex: Roupas Femininas" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Status</label>
                                    <select value={categoriaEmEdicao.status} onChange={e => setCategoriaEmEdicao({...categoriaEmEdicao, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500">
                                        <option value="ATIVA">Ativa</option>
                                        <option value="INATIVA">Inativa</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button onClick={salvarCategoria} disabled={mutacaoSalvar.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-70">
                                {mutacaoSalvar.isPending ? 'Salvando...' : 'Salvar Categoria'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCategories;