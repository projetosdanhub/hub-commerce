import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const localQueryClient = new QueryClient();
import api from '../../api';

// Ícones
const Icons = {
    Plus: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>,
    Edit: ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash: ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Close: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Refresh: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Check: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
    Spinner: ({ className = "w-5 h-5 animate-spin" }) => <svg className={className} viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Drag: ({ className = "w-4 h-4" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg>,
    Menu: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    Layout: ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Layers: ({ className = "w-6 h-6" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    Eye: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
};

// Componente de Notificação
const AnimatedNotification = ({ show, img, status, titulo }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border ${
                    status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                    status === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                    'bg-white border-slate-200 text-slate-800'
                }`}
            >
                {img && <img src={img} alt="Aviso" className="w-8 h-8 rounded-full object-cover" />}
                {!img && status === 'success' && <Icons.Check />}
                {!img && status === 'error' && <Icons.Close />}
                <p className="font-bold text-sm">{titulo}</p>
            </motion.div>
        )}
    </AnimatePresence>
);

const AdminCategoriesContent = () => {
    const queryClient = useQueryClient();
    const [mainTab, setMainTab] = useState('CATEGORIAS GLOBAIS');
    
    // Notificações
    const [notif, setNotif] = useState({ show: false, titulo: '', status: 'success' });
    const showNotif = (titulo, status = 'success') => {
        setNotif({ show: true, titulo, status });
        setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 3000);
    };

    // Modais
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, titulo: '', msg: '', onConfirm: null, actionLabel: 'Confirmar' });
    const [catModal, setCatModal] = useState({ isOpen: false, isNovo: true, data: { nome: '', status: 'ATIVA' }, erro: null });
    const [menuModal, setMenuModal] = useState({ isOpen: false, data: { nome: '', tipo: 'LINK', url: '', menu_id: null }, erro: null });

    // Estado do Mega Menu Builder
    const [menuItems, setMenuItems] = useState([]);
    const [loadingAcao, setLoadingAcao] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Buscas
    const { data: categorias = [], isLoading: isLoadingCat, refetch: refetchCat } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: async () => {
            try {
                const res = await api.get('/admin/categories');
                return res.data.data || [];
            } catch (e) {
                return [];
            }
        }
    });

    const { data: dbMenuItems = [], isLoading: isLoadingMenu, refetch: refetchMenu } = useQuery({
        queryKey: ['adminMegaMenu'],
        queryFn: async () => {
            try {
                const res = await api.get('/admin/menu');
                return res.data || [];
            } catch (e) {
                return [];
            }
        }
    });

    // Sincronizar items do DB para o builder
    useEffect(() => {
        if (dbMenuItems.length > 0) {
            setMenuItems(dbMenuItems.map(item => ({
                id: item.id || Math.random().toString(),
                nome: item.nome,
                parent_id: item.parent_id,
                ativo: item.ativo,
                url: item.url,
                categoria_id: item.categoria_id,
                ordem: item.ordem || 0,
                is_db: true
            })));
        }
    }, [dbMenuItems]);

    // Lógica de Atualização (Refresh) na Aba
    useEffect(() => {
        setIsRefreshing(true);
        Promise.all([refetchCat(), refetchMenu()]).finally(() => setIsRefreshing(false));
    }, [mainTab, refetchCat, refetchMenu]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchCat(), refetchMenu()]);
        setIsRefreshing(false);
        showNotif('Dados atualizados', 'success');
    };

    // Mutações Categoria
    const mutacaoSalvarCat = useMutation({
        mutationFn: async (dados) => {
            if (dados.id) return await api.put(`/admin/categories/${dados.id}`, dados);
            return await api.post('/admin/categories', dados);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
            setCatModal({ isOpen: false, isNovo: true, data: { nome: '', status: 'ATIVA' }, erro: null });
            showNotif('Categoria salva com sucesso!');
        },
        onError: () => showNotif('Erro ao salvar categoria', 'error')
    });

    const mutacaoExcluirCat = useMutation({
        mutationFn: async (id) => await api.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
            showNotif('Categoria excluída!');
        }
    });

    // Mutações Mega Menu
    const salvarMegaMenu = async () => {
        setLoadingAcao('salvar_mega_menu');
        try {
            const formData = new FormData();
            formData.append('items', JSON.stringify(menuItems.map(m => ({
                id: m.is_db ? m.id : null,
                nome: m.nome,
                parent_id: m.parent_id,
                ordem: m.ordem,
                url: m.url,
                categoria_id: m.categoria_id,
                ativo: m.ativo ? 1 : 0
            }))));

            await api.post('/admin/navigation-menus/sync', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotif('Mega Menu publicado com sucesso!');
            refetchMenu();
        } catch (e) {
            showNotif('Erro ao publicar Mega Menu', 'error');
        } finally {
            setLoadingAcao(null);
        }
    };

    // Ações UI
    const handleSalvarCat = () => {
        if (!catModal.data.nome.trim()) {
            setCatModal(prev => ({ ...prev, erro: 'O nome da categoria é obrigatório.' }));
            showNotif('O nome da categoria é obrigatório.', 'error');
            return;
        }
        setCatModal(prev => ({ ...prev, erro: null }));
        mutacaoSalvarCat.mutate(catModal.data);
    };

    const handleSalvarItemMenu = () => {
        if (!menuModal.data.nome.trim()) {
            setMenuModal(prev => ({ ...prev, erro: 'O nome do item é obrigatório.' }));
            showNotif('O nome do item é obrigatório.', 'error');
            return;
        }
        setMenuModal(prev => ({ ...prev, erro: null }));
        
        const data = menuModal.data;
        if (data.id) {
            setMenuItems(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m));
        } else {
            setMenuItems(prev => [...prev, { ...data, id: `tmp_${Date.now()}`, is_db: false, ativo: true, ordem: prev.length }]);
        }
        setMenuModal({ isOpen: false, data: { nome: '', tipo: 'LINK', url: '', menu_id: null }, erro: null });
    };

    const handleExcluirCat = (id) => {
        setConfirmModal({
            isOpen: true,
            titulo: 'Excluir Categoria',
            msg: 'Esta ação não pode ser desfeita. Todos os produtos vinculados poderão ficar sem categoria.',
            actionLabel: 'Excluir',
            onConfirm: () => {
                mutacaoExcluirCat.mutate(id);
                setConfirmModal({ isOpen: false });
            }
        });
    };

    const handleRemoverItemMenu = (id) => {
        setConfirmModal({
            isOpen: true,
            titulo: 'Remover Item do Menu',
            msg: 'Removerá este item e todos os seus sub-menus. Lembre-se de publicar para efetivar a mudança.',
            actionLabel: 'Remover',
            onConfirm: () => {
                // Remover o item e os filhos
                const removerArvore = (parentId) => {
                    setMenuItems(prev => prev.filter(m => m.id !== parentId && m.parent_id !== parentId));
                };
                removerArvore(id);
                setConfirmModal({ isOpen: false });
            }
        });
    };

    // SKELETON: CATEGORIAS & MENU
    const CategoriesSkeleton = () => (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-[120px]">
                        <div className="w-1/2 h-3 bg-slate-200 rounded-full mb-4"></div>
                        <div className="w-1/4 h-8 bg-slate-200 rounded-lg"></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-200 h-[72px]">
                <div className="w-1/3 h-5 bg-slate-200 rounded-full ml-4"></div>
                <div className="w-32 h-10 bg-slate-200 rounded-2xl"></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0">
                        <div className="w-1/3 h-4 bg-slate-200 rounded-full"></div>
                        <div className="w-1/4 h-4 bg-slate-200 rounded-full"></div>
                        <div className="w-20 h-8 bg-slate-200 rounded-xl"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Renderização das Abas
    const renderCategorias = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Dashboard Métricas Interno da Aba */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Icons.Layers /></div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total de Categorias</h3>
                    <p className="text-4xl font-black text-slate-800">{categorias.length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Icons.Check /></div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Categorias Ativas</h3>
                    <p className="text-4xl font-black text-emerald-600">{categorias.filter(c => c.status === 'ATIVA').length}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Icons.Close /></div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Categorias Inativas</h3>
                    <p className="text-4xl font-black text-rose-600">{categorias.filter(c => c.status !== 'ATIVA').length}</p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                <div className="px-4">
                    <h2 className="text-lg font-black text-slate-800">Listagem de Categorias</h2>
                </div>
                <button onClick={() => setCatModal({ isOpen: true, isNovo: true, data: { nome: '', status: 'ATIVA' }, erro: null })} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-sm text-sm">
                    <Icons.Plus /> Nova Categoria
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            <th className="p-5 pl-6">Nome da Categoria</th>
                            <th className="p-5 text-center">Status</th>
                            <th className="p-5 pr-6 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoadingCat ? (
                            <tr><td colSpan="3" className="p-16 text-center text-slate-400 font-bold animate-pulse">Carregando categorias...</td></tr>
                        ) : categorias.length > 0 ? categorias.map(cat => (
                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-5 pl-6 font-bold text-slate-800">{cat.nome}</td>
                                <td className="p-5 text-center">
                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${cat.status === 'ATIVA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {cat.status}
                                    </span>
                                </td>
                                <td className="p-5 pr-6 text-right flex justify-end gap-2">
                                    <button onClick={() => setCatModal({ isOpen: true, isNovo: false, data: cat, erro: null })} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Icons.Edit /></button>
                                    <button onClick={() => handleExcluirCat(cat.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"><Icons.Trash /></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="3" className="p-16 text-center text-slate-400 font-medium">Nenhuma categoria encontrada no banco de dados.</td></tr>}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderMenuBuilder = () => {
        // Árvore Didática de Menus
        const getFilhos = (parentId) => menuItems.filter(m => m.parent_id === parentId).sort((a,b) => a.ordem - b.ordem);
        
        const handleReorder = (parentId, newOrderedFilhos) => {
            setMenuItems(prev => {
                const newItems = [...prev];
                newOrderedFilhos.forEach((filho, index) => {
                    const idx = newItems.findIndex(i => i.id === filho.id);
                    if (idx !== -1) {
                        newItems[idx] = { ...newItems[idx], ordem: index };
                    }
                });
                return newItems;
            });
        };

        const renderFilhos = (parentId, nivel = 0) => {
            const filhos = getFilhos(parentId);
            if (filhos.length === 0) return null;
            
            return (
                <Reorder.Group axis="y" values={filhos} onReorder={(newOrder) => handleReorder(parentId, newOrder)} className={nivel > 0 ? "ml-8 relative" : ""}>
                    {filhos.map((item) => (
                        <Reorder.Item key={item.id} value={item} className="mt-3 relative">
                            {nivel > 0 && <div className="absolute left-[-20px] top-6 w-5 h-px bg-slate-300"></div>}
                            {nivel > 0 && <div className="absolute left-[-20px] top-[-12px] w-px h-full bg-slate-300"></div>}
                            
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group z-10 relative">
                                <div className="flex items-center gap-3">
                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500"><Icons.Drag /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                            {item.nome}
                                            {!item.ativo && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">Inativo</span>}
                                        </h4>
                                        <p className="text-xs text-slate-500">{item.url ? `Link: ${item.url}` : 'Menu Agrupador'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {nivel < 2 && (
                                        <button onClick={() => setMenuModal({ isOpen: true, data: { nome: '', url: '', parent_id: item.id, ativo: true }, erro: null })} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                                            + Sub-menu
                                        </button>
                                    )}
                                    <button onClick={() => setMenuModal({ isOpen: true, data: item, erro: null })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Icons.Edit /></button>
                                    <button onClick={() => handleRemoverItemMenu(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Icons.Trash /></button>
                                    <button onClick={() => setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, ativo: !m.ativo } : m))} className={`p-1.5 rounded-lg transition-colors ${item.ativo ? 'text-slate-400 hover:bg-slate-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                                        <Icons.Eye />
                                    </button>
                                </div>
                            </div>
                            {renderFilhos(item.id, nivel + 1)}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            );
        };

        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                    <div className="px-4">
                        <h2 className="text-lg font-black text-slate-800">Construtor do Mega Menu</h2>
                        <p className="text-sm text-slate-500">Crie a árvore de navegação principal da loja.</p>
                    </div>
                    <button onClick={() => setMenuModal({ isOpen: true, data: { nome: '', url: '', parent_id: null, ativo: true }, erro: null })} className="bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl hover:bg-slate-900 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-sm text-sm">
                        <Icons.Plus /> Menu Principal
                    </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 min-h-[400px]">
                    {menuItems.filter(m => m.parent_id === null).length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 mb-4"><Icons.Layout /></div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum menu criado</h3>
                            <p className="text-slate-500 text-sm max-w-sm">Comece criando um Menu Principal. Você pode adicionar sub-menus dentro dele para criar a estrutura da loja.</p>
                        </div>
                    ) : (
                        <div className="pb-10">
                            {renderFilhos(null)}
                        </div>
                    )}
                </div>

                {/* Salvar Publicação Mega Menu */}
                <div className="flex justify-end p-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <button onClick={salvarMegaMenu} disabled={loadingAcao === 'salvar_mega_menu'} className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-sm disabled:opacity-70 text-sm">
                        {loadingAcao === 'salvar_mega_menu' ? <Icons.Spinner /> : <Icons.Check />} 
                        Confirmar Publicação
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <main className="w-full min-h-screen bg-slate-50/50 pb-20 relative font-sans">
            <Helmet><title>Categorias & Menu | HUB ADMIN</title></Helmet>
            <AnimatedNotification show={notif.show} img={notif.img} status={notif.status} titulo={notif.titulo} />

            {/* HEADER COM MENU SAAS PADRONIZADO */}
            <header className="mb-8 pt-8 px-4 md:px-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Categorias & Menu</h1>
                <p className="text-slate-500 mt-2 font-medium mb-6">Controle as categorias e a árvore de navegação da sua loja.</p>

                <nav className="border-b border-slate-200 mt-6 pb-6 overflow-x-auto no-scrollbar relative w-full flex items-center justify-between" aria-label="Menu Principal">
                    <div className="flex items-center gap-4">
                        <div className="flex overflow-x-auto no-scrollbar bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200/60 w-max max-w-full">
                            {['CATEGORIAS GLOBAIS', 'MEGA MENU'].map(tab => (
                                <button 
                                    type="button" 
                                    key={tab} 
                                    aria-selected={mainTab === tab} 
                                    onClick={() => setMainTab(tab)} 
                                    className={`px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all focus:outline-none ${mainTab === tab ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {tab === 'CATEGORIAS GLOBAIS' && <Icons.Layers className="w-4 h-4" />}
                                        {tab === 'MEGA MENU' && <Icons.Menu className="w-4 h-4" />}
                                        {tab}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <button onClick={handleRefresh} disabled={isRefreshing} className={`bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center`} title="Atualizar Dados">
                            <div className={`${isRefreshing ? 'animate-spin text-blue-600' : ''}`}><Icons.Refresh /></div>
                        </button>
                    </div>
                </nav>
            </header>

            <div className="px-8">
                {isRefreshing ? (
                    <CategoriesSkeleton />
                ) : (
                    <AnimatePresence mode="wait">
                        {mainTab === 'CATEGORIAS GLOBAIS' && <div key="cat">{renderCategorias()}</div>}
                        {mainTab === 'MEGA MENU' && <div key="menu">{renderMenuBuilder()}</div>}
                    </AnimatePresence>
                )}
            </div>

            {/* Modais Globais do Módulo */}
            <AnimatePresence>
                {/* Modal Categoria */}
                {catModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCatModal({ isOpen: false, isNovo: true, data: { nome: '', status: 'ATIVA' }, erro: null })} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg z-10 border border-slate-200">
                            <h3 className="text-2xl font-black mb-2 text-slate-800">{catModal.isNovo ? 'Nova Categoria' : 'Editar Categoria'}</h3>
                            <p className="text-slate-500 text-sm mb-6">Defina as categorias para organizar seus produtos na loja.</p>
                            
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome da Categoria *</label>
                                    <input autoFocus className={`w-full bg-white border ${catModal.erro ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 transition-all shadow-sm`} value={catModal.data.nome} onChange={e => setCatModal({...catModal, data: {...catModal.data, nome: e.target.value}, erro: null})} placeholder="Ex: Roupas Femininas" />
                                    <AnimatePresence>
                                        {catModal.erro && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-rose-500 text-xs mt-2 font-bold">{catModal.erro}</motion.p>}
                                    </AnimatePresence>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Status</label>
                                    <select className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" value={catModal.data.status} onChange={e => setCatModal({...catModal, data: {...catModal.data, status: e.target.value}})}>
                                        <option value="ATIVA">Ativa na Loja</option>
                                        <option value="INATIVA">Inativa / Oculta</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setCatModal({ isOpen: false, isNovo: true, data: { nome: '', status: 'ATIVA' }, erro: null })} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all hover:bg-slate-50">Cancelar</button>
                                <button onClick={handleSalvarCat} disabled={mutacaoSalvarCat.isPending} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-sm flex items-center gap-2">
                                    {mutacaoSalvarCat.isPending ? <><Icons.Spinner /> Salvando...</> : 'Salvar Categoria'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal Item Menu */}
                {menuModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMenuModal({ isOpen: false, data: { nome: '', tipo: 'LINK', url: '', menu_id: null }, erro: null })} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg z-10 border border-slate-200">
                            <h3 className="text-2xl font-black mb-2 text-slate-800">{menuModal.data.id ? 'Editar Item do Menu' : 'Novo Item no Menu'}</h3>
                            <p className="text-slate-500 text-sm mb-6">Configure o nome e para onde este link vai apontar.</p>
                            
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nome de Exibição *</label>
                                    <input autoFocus className={`w-full bg-white border ${menuModal.erro ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 transition-all shadow-sm`} value={menuModal.data.nome || ''} onChange={e => setMenuModal({...menuModal, data: {...menuModal.data, nome: e.target.value}, erro: null})} placeholder="Ex: Vestidos Longos" />
                                    <AnimatePresence>
                                        {menuModal.erro && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-rose-500 text-xs mt-2 font-bold">{menuModal.erro}</motion.p>}
                                    </AnimatePresence>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">URL / Link (Opcional)</label>
                                    <input className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" value={menuModal.data.url || ''} onChange={e => setMenuModal({...menuModal, data: {...menuModal.data, url: e.target.value}})} placeholder="Ex: /categoria/vestidos" />
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Deixe vazio se for apenas um agrupador de sub-menus.</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Hierarquia do Menu</label>
                                    <select 
                                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                        value={menuModal.data.parent_id || ''}
                                        onChange={e => setMenuModal({...menuModal, data: {...menuModal.data, parent_id: e.target.value === '' ? null : e.target.value}})}
                                    >
                                        <option value="">Menu Principal</option>
                                        {menuItems.filter(m => !menuModal.data.id || m.id !== menuModal.data.id).map(m => (
                                            <option key={m.id} value={m.id}>Sub-menu de: {m.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setMenuModal({ isOpen: false, data: { nome: '', tipo: 'LINK', url: '', menu_id: null }, erro: null })} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all hover:bg-slate-50">Cancelar</button>
                                <button onClick={handleSalvarItemMenu} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-sm">
                                    Concluir Item
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal Confirmação Genérica */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmModal({ isOpen: false })} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm relative z-10 border border-slate-200 text-center">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                                <Icons.Trash className="text-rose-500 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">{confirmModal.titulo}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">{confirmModal.msg}</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={confirmModal.onConfirm} className="w-full bg-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-sm hover:bg-rose-700 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm">
                                    {confirmModal.actionLabel}
                                </button>
                                <button onClick={() => setConfirmModal({ isOpen: false })} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl hover:bg-slate-50 transition-all text-sm">
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

const AdminCategories = () => (
    <QueryClientProvider client={localQueryClient}>
        <AdminCategoriesContent />
    </QueryClientProvider>
);

export default AdminCategories;