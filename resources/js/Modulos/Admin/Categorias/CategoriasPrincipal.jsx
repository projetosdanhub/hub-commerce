import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../../../api';
import './Categorias.css';

const localQueryClient = new QueryClient();

const Icons = {
    Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Check: () => <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Layers: () => <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
};

const CategoriasContent = () => {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState({ isOpen: false, data: { id: null, nome: '', status: 'ATIVA' }, erro: null });

    const { data: categorias = [], isLoading } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: async () => {
            const res = await api.get('/admin/categories');
            return res.data.data || [];
        }
    });

    const mutacaoSalvarCat = useMutation({
        mutationFn: async (dados) => {
            if (dados.id) return await api.put(`/admin/categories/${dados.id}`, dados);
            return await api.post('/admin/categories', dados);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
            setModal({ isOpen: false, data: { id: null, nome: '', status: 'ATIVA' }, erro: null });
        }
    });

    const mutacaoExcluirCat = useMutation({
        mutationFn: async (id) => await api.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
        }
    });

    const handleSalvar = () => {
        if (!modal.data.nome.trim()) {
            setModal(prev => ({ ...prev, erro: 'O nome da categoria é obrigatório.' }));
            return;
        }
        mutacaoSalvarCat.mutate(modal.data);
    };

    const handleExcluir = (id) => {
        if (confirm('Tem certeza que deseja excluir esta categoria? Produtos sem categoria podem apresentar erros.')) {
            mutacaoExcluirCat.mutate(id);
        }
    };

    return (
        <div className="categorias-container">
            <Helmet><title>Categorias | HUB ADMIN</title></Helmet>
            
            <div className="categorias-header">
                <h1 className="categorias-title">Categorias</h1>
                <p className="categorias-subtitle">Controle as categorias de produtos da sua loja virtual.</p>
            </div>

            <div className="categorias-metrics">
                <div className="categorias-metric-card">
                    <h3 className="categorias-metric-title"><Icons.Layers /> Total</h3>
                    <p className="categorias-metric-value primary">{categorias.length}</p>
                </div>
                <div className="categorias-metric-card">
                    <h3 className="categorias-metric-title"><Icons.Check /> Ativas</h3>
                    <p className="categorias-metric-value success">{categorias.filter(c => c.status === 'ATIVA').length}</p>
                </div>
                <div className="categorias-metric-card">
                    <h3 className="categorias-metric-title"><Icons.Close /> Inativas</h3>
                    <p className="categorias-metric-value danger">{categorias.filter(c => c.status !== 'ATIVA').length}</p>
                </div>
            </div>

            <div className="categorias-toolbar">
                <h2>Listagem de Categorias</h2>
                <button 
                    className="categorias-btn categorias-btn-primary" 
                    onClick={() => setModal({ isOpen: true, data: { id: null, nome: '', status: 'ATIVA' }, erro: null })}
                >
                    <Icons.Plus /> Nova Categoria
                </button>
            </div>

            <div className="categorias-table-container">
                <table className="categorias-table">
                    <thead>
                        <tr>
                            <th>Nome da Categoria</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: 'var(--hub-space-8)' }}>Carregando...</td></tr>
                        ) : categorias.length > 0 ? categorias.map(cat => (
                            <tr key={cat.id}>
                                <td style={{ fontWeight: 'var(--hub-font-weight-bold)' }}>{cat.nome}</td>
                                <td>
                                    <span className={`categorias-badge ${cat.status === 'ATIVA' ? 'categorias-badge-active' : 'categorias-badge-inactive'}`}>
                                        {cat.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="categorias-actions">
                                        <button className="categorias-action-btn edit" onClick={() => setModal({ isOpen: true, data: cat, erro: null })}>
                                            <Icons.Edit />
                                        </button>
                                        <button className="categorias-action-btn delete" onClick={() => handleExcluir(cat.id)}>
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="3" style={{ textAlign: 'center', padding: 'var(--hub-space-8)' }}>Nenhuma categoria encontrada.</td></tr>}
                    </tbody>
                </table>
            </div>

            {modal.isOpen && (
                <div className="categorias-modal-overlay" onClick={() => setModal({ isOpen: false, data: { id: null, nome: '', status: 'ATIVA' }, erro: null })}>
                    <div className="categorias-modal" onClick={e => e.stopPropagation()}>
                        <div className="categorias-modal-header">
                            <h3>{modal.data.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                            <p>Organize os seus produtos de forma eficiente.</p>
                        </div>
                        
                        <div className="categorias-form-group">
                            <label>Nome da Categoria *</label>
                            <input 
                                className="categorias-input"
                                value={modal.data.nome} 
                                onChange={e => setModal(prev => ({...prev, data: {...prev.data, nome: e.target.value}, erro: null}))} 
                                autoFocus
                            />
                            {modal.erro && <p className="categorias-error">{modal.erro}</p>}
                        </div>

                        <div className="categorias-form-group">
                            <label>Status</label>
                            <select 
                                className="categorias-input"
                                value={modal.data.status} 
                                onChange={e => setModal(prev => ({...prev, data: {...prev.data, status: e.target.value}}))}
                            >
                                <option value="ATIVA">Ativa</option>
                                <option value="INATIVA">Inativa</option>
                            </select>
                        </div>

                        <div className="categorias-modal-footer">
                            <button className="categorias-btn categorias-btn-secondary" onClick={() => setModal({ isOpen: false, data: { id: null, nome: '', status: 'ATIVA' }, erro: null })}>Cancelar</button>
                            <button className="categorias-btn categorias-btn-primary" onClick={handleSalvar} disabled={mutacaoSalvarCat.isPending}>
                                {mutacaoSalvarCat.isPending ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CategoriasPrincipal = () => (
    <QueryClientProvider client={localQueryClient}>
        <CategoriasContent />
    </QueryClientProvider>
);

export default CategoriasPrincipal;
