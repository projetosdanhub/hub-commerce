import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../../../api';
import './Menus.css';

const localQueryClient = new QueryClient();

// SVG Icons
const Icons = {
    Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
    Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
    Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
    Drag: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"/></svg>,
    Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
    Eye: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    Layout: () => <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
};

// Tree Item Component
const TreeItem = ({ item, level = 0, getChildren, onEdit, onDelete, onToggleVisibility, onDragStart, onDragOver, onDrop }) => {
    const children = getChildren(item.id);

    return (
        <div>
            <div 
                className="menus-item"
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                onDragOver={(e) => onDragOver(e, item)}
                onDrop={(e) => onDrop(e, item)}
            >
                <div className="menus-item-info">
                    <div className="menus-item-drag-handle">
                        <Icons.Drag />
                    </div>
                    <div className="menus-item-details">
                        <div className="menus-item-name">
                            {item.nome}
                            {!item.ativo && <span className="menus-item-badge">Inativo</span>}
                        </div>
                        <div className="menus-item-url">{item.url ? `Link: ${item.url}` : 'Sub-menu agrupador'}</div>
                    </div>
                </div>
                <div className="menus-item-actions">
                    <button className="menus-item-action" onClick={() => onToggleVisibility(item.id)} title="Alternar Visibilidade">
                        <Icons.Eye />
                    </button>
                    <button className="menus-item-action" onClick={() => onEdit(item)} title="Editar">
                        <Icons.Edit />
                    </button>
                    <button className="menus-item-action delete" onClick={() => onDelete(item.id)} title="Excluir">
                        <Icons.Trash />
                    </button>
                </div>
            </div>
            {children.length > 0 && (
                <div className="menus-children">
                    {children.map(child => (
                        <TreeItem 
                            key={child.id}
                            item={child}
                            level={level + 1}
                            getChildren={getChildren}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleVisibility={onToggleVisibility}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const MenusContent = () => {
    const queryClient = useQueryClient();
    const [activeConfigId, setActiveConfigId] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    
    // UI States
    const [configModal, setConfigModal] = useState({ isOpen: false, isEdit: false, data: { id: null, nome: '' } });
    const [itemModal, setItemModal] = useState({ isOpen: false, data: { id: null, nome: '', url: '', parent_id: null, ativo: true } });
    const [draggedItem, setDraggedItem] = useState(null);

    // Fetch Configs
    const { data: configs = [] } = useQuery({
        queryKey: ['menuConfigs'],
        queryFn: async () => {
            const res = await api.get('/admin/menu');
            return res.data.data || [];
        }
    });

    // Auto-select first config
    useEffect(() => {
        if (configs.length > 0 && !activeConfigId) {
            setActiveConfigId(configs[0].id.toString());
        }
    }, [configs, activeConfigId]);

    // Fetch Items for active config
    const { data: dbItems = [], refetch: refetchItems } = useQuery({
        queryKey: ['menuItems', activeConfigId],
        queryFn: async () => {
            if (!activeConfigId) return [];
            const res = await api.get(`/admin/menu/${activeConfigId}/items`);
            return res.data.data || [];
        },
        enabled: !!activeConfigId
    });

    useEffect(() => {
        if (dbItems) {
            setMenuItems(dbItems.map(item => ({
                id: item.id || `db_${Math.random()}`,
                nome: item.nome,
                parent_id: item.parent_id,
                ativo: item.ativo,
                url: item.link, // DB stores as link
                ordem: item.ordem || 0,
                is_db: true
            })));
        }
    }, [dbItems]);

    // Mutations for Configs
    const saveConfigMut = useMutation({
        mutationFn: async (data) => {
            if (data.id) return await api.put(`/admin/menu/${data.id}`, { nome: data.nome });
            return await api.post('/admin/menu', { nome: data.nome });
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries(['menuConfigs']);
            setConfigModal({ isOpen: false, isEdit: false, data: { id: null, nome: '' } });
            if (res.data && res.data.data && res.data.data.id) {
                setActiveConfigId(res.data.data.id.toString());
            }
        }
    });

    const deleteConfigMut = useMutation({
        mutationFn: async (id) => await api.delete(`/admin/menu/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['menuConfigs']);
            setActiveConfigId('');
            setMenuItems([]);
        }
    });

    // Mutations for Items Sync
    const syncItemsMut = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('items', JSON.stringify(menuItems.map((m, i) => ({
                id: m.is_db ? m.id : null,
                nome: m.nome,
                parent_id: m.parent_id,
                ordem: i,
                link: m.url,
                ativo: m.ativo ? 1 : 0,
                depth: m.parent_id ? 1 : 0 // Simplified depth
            }))));

            return await api.post(`/admin/menu/${activeConfigId}/sync`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            refetchItems();
            alert('Menu sincronizado e salvo com sucesso!');
        }
    });

    // Drag and Drop Handlers
    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image setting can be added here if needed
    };

    const handleDragOver = (e, item) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e, targetItem) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.id === targetItem.id) return;
        
        // Very simplified reordering logic
        // Ideally we check if dropping on a parent or sibling
        // For this MVP, we just place it after the targetItem
        
        setMenuItems(prev => {
            const items = [...prev];
            const draggedIdx = items.findIndex(i => i.id === draggedItem.id);
            const targetIdx = items.findIndex(i => i.id === targetItem.id);
            
            if (draggedIdx === -1 || targetIdx === -1) return prev;
            
            // Re-assign parent_id to match target's parent_id (so they become siblings)
            items[draggedIdx].parent_id = items[targetIdx].parent_id;

            // Move in array
            const [removed] = items.splice(draggedIdx, 1);
            const newTargetIdx = items.findIndex(i => i.id === targetItem.id); // recalculate index
            items.splice(newTargetIdx + 1, 0, removed);
            
            return items;
        });
        
        setDraggedItem(null);
    };

    const handleSaveItem = () => {
        if (!itemModal.data.nome.trim()) return;
        
        if (itemModal.data.id) {
            setMenuItems(prev => prev.map(m => m.id === itemModal.data.id ? { ...m, ...itemModal.data } : m));
        } else {
            setMenuItems(prev => [...prev, { ...itemModal.data, id: `tmp_${Date.now()}`, is_db: false }]);
        }
        setItemModal({ isOpen: false, data: { id: null, nome: '', url: '', parent_id: null, ativo: true } });
    };

    const getChildren = (parentId) => menuItems.filter(m => m.parent_id === parentId);

    return (
        <div className="menus-container">
            <Helmet><title>Construtor de Menus | HUB ADMIN</title></Helmet>
            
            <div className="menus-header">
                <h1 className="menus-title">Construtor de Menus</h1>
                <p className="menus-subtitle">Crie, edite e organize os menus de navegação da sua loja virtual.</p>
            </div>

            <div className="menus-card">
                <div className="menus-card-header">
                    <h2 className="menus-card-title">Seleção de Menu</h2>
                    <div className="menus-select-container">
                        <select 
                            className="menus-select" 
                            value={activeConfigId} 
                            onChange={e => setActiveConfigId(e.target.value)}
                        >
                            <option value="">Selecione um Menu</option>
                            {configs.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                        <button className="menus-btn menus-btn-primary" onClick={() => setConfigModal({ isOpen: true, isEdit: false, data: { id: null, nome: '' } })}>
                            <Icons.Plus /> Criar Menu
                        </button>
                        {activeConfigId && (
                            <>
                                <button className="menus-btn menus-btn-secondary" onClick={() => {
                                    const c = configs.find(x => x.id.toString() === activeConfigId);
                                    if(c) setConfigModal({ isOpen: true, isEdit: true, data: { id: c.id, nome: c.nome } });
                                }}>
                                    <Icons.Edit />
                                </button>
                                <button className="menus-btn menus-btn-danger" onClick={() => {
                                    if(confirm('Tem certeza que deseja remover este menu?')) deleteConfigMut.mutate(activeConfigId);
                                }}>
                                    <Icons.Trash />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {activeConfigId ? (
                    <div className="menus-builder">
                        <div className="menus-sidebar">
                            <h3>Adicionar Links</h3>
                            <div className="menus-form-group">
                                <label>Adicionar Novo Item Principal</label>
                                <button 
                                    className="menus-btn menus-btn-secondary" 
                                    style={{ justifyContent: 'center', marginTop: 'var(--hub-space-2)' }}
                                    onClick={() => setItemModal({ isOpen: true, data: { id: null, nome: '', url: '', parent_id: null, ativo: true } })}
                                >
                                    <Icons.Plus /> Adicionar ao Menu
                                </button>
                            </div>
                            
                            <hr style={{ border: 'none', borderTop: '1px solid var(--hub-border-subtle)', margin: 'var(--hub-space-4) 0' }} />
                            
                            <button 
                                className="menus-btn menus-btn-primary" 
                                style={{ justifyContent: 'center' }}
                                onClick={() => syncItemsMut.mutate()}
                                disabled={syncItemsMut.isPending}
                            >
                                <Icons.Check /> {syncItemsMut.isPending ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                        
                        <div className="menus-tree">
                            {menuItems.filter(m => m.parent_id === null).length === 0 ? (
                                <div className="menus-empty">
                                    <Icons.Layout />
                                    <p>O menu está vazio. Adicione itens pela barra lateral.</p>
                                </div>
                            ) : (
                                <div>
                                    {getChildren(null).map(item => (
                                        <TreeItem 
                                            key={item.id} 
                                            item={item} 
                                            getChildren={getChildren} 
                                            onEdit={(i) => setItemModal({ isOpen: true, data: i })}
                                            onDelete={(id) => setMenuItems(prev => prev.filter(m => m.id !== id && m.parent_id !== id))}
                                            onToggleVisibility={(id) => setMenuItems(prev => prev.map(m => m.id === id ? { ...m, ativo: !m.ativo } : m))}
                                            onDragStart={handleDragStart}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="menus-empty" style={{ background: 'var(--hub-surface-hover)', borderRadius: 'var(--hub-radius-xl)' }}>
                        <p>Selecione ou crie um menu para começar a editá-lo.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {configModal.isOpen && (
                <div className="menus-modal-overlay" onClick={() => setConfigModal({ isOpen: false, isEdit: false, data: { id: null, nome: '' } })}>
                    <div className="menus-modal" onClick={e => e.stopPropagation()}>
                        <h3>{configModal.isEdit ? 'Renomear Menu' : 'Novo Menu'}</h3>
                        <div className="menus-form-group">
                            <label>Nome de identificação do menu</label>
                            <input 
                                className="menus-input"
                                value={configModal.data.nome} 
                                onChange={e => setConfigModal(prev => ({...prev, data: {...prev.data, nome: e.target.value}}))} 
                                autoFocus
                            />
                        </div>
                        <div className="menus-modal-actions">
                            <button className="menus-btn menus-btn-secondary" onClick={() => setConfigModal({ isOpen: false, isEdit: false, data: { id: null, nome: '' } })}>Cancelar</button>
                            <button className="menus-btn menus-btn-primary" onClick={() => saveConfigMut.mutate(configModal.data)}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {itemModal.isOpen && (
                <div className="menus-modal-overlay" onClick={() => setItemModal({ isOpen: false, data: { id: null, nome: '', url: '', parent_id: null, ativo: true } })}>
                    <div className="menus-modal" onClick={e => e.stopPropagation()}>
                        <h3>{itemModal.data.id ? 'Editar Link' : 'Novo Link'}</h3>
                        <div className="menus-form-group">
                            <label>Rótulo do Menu</label>
                            <input 
                                className="menus-input"
                                value={itemModal.data.nome} 
                                onChange={e => setItemModal(prev => ({...prev, data: {...prev.data, nome: e.target.value}}))} 
                                autoFocus
                            />
                        </div>
                        <div className="menus-form-group">
                            <label>URL (Opcional, deixe vazio para sub-menu agrupador)</label>
                            <input 
                                className="menus-input"
                                value={itemModal.data.url || ''} 
                                onChange={e => setItemModal(prev => ({...prev, data: {...prev.data, url: e.target.value}}))} 
                            />
                        </div>
                        <div className="menus-form-group">
                            <label>Item Pai</label>
                            <select 
                                className="menus-input"
                                value={itemModal.data.parent_id || ''}
                                onChange={e => setItemModal(prev => ({...prev, data: {...prev.data, parent_id: e.target.value === '' ? null : e.target.value}}))}
                            >
                                <option value="">Nenhum (Raiz)</option>
                                {menuItems.filter(m => m.id !== itemModal.data.id).map(m => (
                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="menus-modal-actions">
                            <button className="menus-btn menus-btn-secondary" onClick={() => setItemModal({ isOpen: false, data: { id: null, nome: '', url: '', parent_id: null, ativo: true } })}>Cancelar</button>
                            <button className="menus-btn menus-btn-primary" onClick={handleSaveItem}>Concluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MenusPrincipal = () => (
    <QueryClientProvider client={localQueryClient}>
        <MenusContent />
    </QueryClientProvider>
);

export default MenusPrincipal;
