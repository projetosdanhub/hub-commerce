import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../../../api';
import './navigation.css';

// Primitives
import { Button } from '../DesignSystem/primitives/Button';
import { ModalDialog } from '../DesignSystem/patterns/ModalDialog';
import { Badge } from '../DesignSystem/primitives/Badge';

// Icons
import { 
    Plus, 
    Edit2, 
    Trash2, 
    GripVertical, 
    Check, 
    Eye, 
    EyeOff,
    LayoutTemplate
} from 'lucide-react';

const localQueryClient = new QueryClient();

// Tree Item Component
const TreeItem = ({ item, level = 0, getChildren, onEdit, onDelete, onToggleVisibility, onDragStart, onDragOver, onDrop }) => {
    const children = getChildren(item.id);

    return (
        <div>
            <div 
                className="hub-menu-item"
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                onDragOver={(e) => onDragOver(e, item)}
                onDrop={(e) => onDrop(e, item)}
            >
                <div className="hub-menu-item-info">
                    <div className="hub-menu-item-drag-handle">
                        <GripVertical size={18} />
                    </div>
                    <div className="hub-menu-item-details">
                        <div className="hub-menu-item-name">
                            {item.nome}
                            {!item.ativo && <Badge variant="neutral">Inativo</Badge>}
                        </div>
                        <div className="hub-menu-item-url">{item.url ? `Link: ${item.url}` : 'Sub-menu agrupador'}</div>
                    </div>
                </div>
                <div className="hub-menu-item-actions">
                    <Button variant="ghost" size="sm" icon={item.ativo ? Eye : EyeOff} onClick={() => onToggleVisibility(item.id)} title="Alternar Visibilidade" />
                    <Button variant="ghost" size="sm" icon={Edit2} onClick={() => onEdit(item)} title="Editar" />
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onDelete(item.id)} title="Excluir" style={{ color: 'var(--hub-danger)' }} />
                </div>
            </div>
            {children.length > 0 && (
                <div className="hub-menu-children">
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
    const { data: dbItems, refetch: refetchItems } = useQuery({
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
        <main className="hub-menu-page">
            <Helmet><title>Construtor de Menus | HUB ADMIN</title></Helmet>
            
            <header className="hub-menu-header">
                <div>
                  <h1>Construtor de Menus</h1>
                  <p>Crie, edite e organize os menus de navegação da sua loja virtual.</p>
                </div>
            </header>

            <section className="hub-menu-card">
                <header className="hub-menu-card-header">
                    <h2>Seleção de Menu</h2>
                    <div className="hub-menu-select-container">
                        <select 
                            className="hub-menu-select" 
                            value={activeConfigId} 
                            onChange={e => setActiveConfigId(e.target.value)}
                        >
                            <option value="">Selecione um Menu</option>
                            {configs.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                        <Button onClick={() => setConfigModal({ isOpen: true, isEdit: false, data: { id: null, nome: '' } })} icon={Plus}>
                            Criar Menu
                        </Button>
                        {activeConfigId && (
                            <>
                                <Button variant="secondary" onClick={() => {
                                    const c = configs.find(x => x.id.toString() === activeConfigId);
                                    if(c) setConfigModal({ isOpen: true, isEdit: true, data: { id: c.id, nome: c.nome } });
                                }} icon={Edit2}>
                                    Renomear
                                </Button>
                                <Button variant="danger" onClick={() => {
                                    if(confirm('Tem certeza que deseja remover este menu?')) deleteConfigMut.mutate(activeConfigId);
                                }} icon={Trash2}>
                                    Excluir
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                {activeConfigId ? (
                    <div className="hub-menu-builder">
                        <aside className="hub-menu-sidebar">
                            <h3>Adicionar Links</h3>
                            <div className="hub-menu-form-group">
                                <label>Adicionar Novo Item Principal</label>
                                <Button 
                                    variant="secondary" 
                                    icon={Plus} 
                                    style={{ justifyContent: 'center', marginTop: 'var(--hub-space-2)' }}
                                    onClick={() => setItemModal({ isOpen: true, data: { id: null, nome: '', url: '', parent_id: null, ativo: true } })}
                                >
                                    Adicionar ao Menu
                                </Button>
                            </div>
                            
                            <hr style={{ border: 'none', borderTop: '1px solid var(--hub-border-subtle)', margin: 'var(--hub-space-4) 0' }} />
                            
                            <Button 
                                variant="primary" 
                                icon={Check} 
                                style={{ justifyContent: 'center' }}
                                onClick={() => syncItemsMut.mutate()}
                                loading={syncItemsMut.isPending}
                            >
                                Salvar Alterações
                            </Button>
                        </aside>
                        
                        <div className="hub-menu-tree">
                            {menuItems.filter(m => m.parent_id === null).length === 0 ? (
                                <div className="hub-menu-empty">
                                    <LayoutTemplate size={48} strokeWidth={1} />
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
                    <div className="hub-menu-empty" style={{ background: 'var(--hub-surface-hover)', borderRadius: 'var(--hub-radius-xl)' }}>
                        <p>Selecione ou crie um menu para começar a editá-lo.</p>
                    </div>
                )}
            </section>

            {/* Modals via ModalDialog */}
            {configModal.isOpen && (
                <ModalDialog 
                  labelledBy="config-modal-title"
                  onClose={() => setConfigModal({ isOpen: false, isEdit: false, data: { id: null, nome: '' } })}
                >
                  {(requestClose) => (
                    <section className="hub-surface">
                      <header>
                        <h2 id="config-modal-title">{configModal.isEdit ? 'Renomear Menu' : 'Novo Menu'}</h2>
                      </header>
                      <div className="hub-menu-modal-content" style={{ padding: 'var(--hub-space-6)' }}>
                          <div className="hub-menu-form-group">
                              <label>Nome de identificação do menu</label>
                              <input 
                                  className="hub-menu-select"
                                  value={configModal.data.nome} 
                                  onChange={e => setConfigModal(prev => ({...prev, data: {...prev.data, nome: e.target.value}}))} 
                                  autoFocus
                              />
                          </div>
                          <footer className="hub-menu-modal-footer">
                              <Button variant="secondary" onClick={requestClose}>Cancelar</Button>
                              <Button onClick={() => { saveConfigMut.mutate(configModal.data); requestClose(); }}>Salvar</Button>
                          </footer>
                      </div>
                    </section>
                  )}
                </ModalDialog>
            )}

            {itemModal.isOpen && (
                <ModalDialog 
                  labelledBy="item-modal-title"
                  onClose={() => setItemModal({ isOpen: false, data: { id: null, nome: '', url: '', parent_id: null, ativo: true } })}
                >
                  {(requestClose) => (
                    <section className="hub-surface">
                      <header>
                        <h2 id="item-modal-title">{itemModal.data.id ? 'Editar Link' : 'Novo Link'}</h2>
                      </header>
                      <div className="hub-menu-modal-content" style={{ padding: 'var(--hub-space-6)' }}>
                          <div className="hub-menu-form-group">
                              <label>Rótulo do Menu</label>
                              <input 
                                  className="hub-menu-select"
                                  value={itemModal.data.nome} 
                                  onChange={e => setItemModal(prev => ({...prev, data: {...prev.data, nome: e.target.value}}))} 
                                  autoFocus
                              />
                          </div>
                          <div className="hub-menu-form-group">
                              <label>URL (Opcional, deixe vazio para sub-menu agrupador)</label>
                              <input 
                                  className="hub-menu-select"
                                  value={itemModal.data.url || ''} 
                                  onChange={e => setItemModal(prev => ({...prev, data: {...prev.data, url: e.target.value}}))} 
                              />
                          </div>
                          <div className="hub-menu-form-group">
                              <label>Item Pai</label>
                              <select 
                                  className="hub-menu-select"
                                  value={itemModal.data.parent_id || ''}
                                  onChange={e => setItemModal(prev => ({...prev, data: {...prev.data, parent_id: e.target.value === '' ? null : e.target.value}}))}
                              >
                                  <option value="">Nenhum (Raiz)</option>
                                  {menuItems.filter(m => m.id !== itemModal.data.id).map(m => (
                                      <option key={m.id} value={m.id}>{m.nome}</option>
                                  ))}
                              </select>
                          </div>
                          <footer className="hub-menu-modal-footer">
                              <Button variant="secondary" onClick={requestClose}>Cancelar</Button>
                              <Button onClick={() => { handleSaveItem(); requestClose(); }}>Concluir</Button>
                          </footer>
                      </div>
                    </section>
                  )}
                </ModalDialog>
            )}
        </main>
    );
};

const NavigationPage = () => (
    <QueryClientProvider client={localQueryClient}>
        <MenusContent />
    </QueryClientProvider>
);

export default NavigationPage;