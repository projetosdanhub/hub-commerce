// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminVitrine.jsx
// ARQUITETURA: Construtor Drag & Drop com Inspetor de Propriedades
// ============================================================================
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../api'; // Instância do Axios

// --- ÍCONES SVG ---
const Icons = {
    DragHandle: () => <svg className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg>,
    Eye: () => <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.018 10.018 0 014.122-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>,
    Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Spinner: () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
};

// --- DICIONÁRIO DE NOMES AMIGÁVEIS PARA O LOJISTA ---
const blockNames = {
    HeroBanner: "Banner Principal Rotativo",
    CategoryGrid: "Grade de Categorias",
    PromoBanners: "Banners Promocionais Secundários",
    ProductCarousel: "Carrossel de Produtos em Destaque",
};

const AdminVitrine = () => {
    const [blocks, setBlocks] = useState([]);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Carrega a configuração atual da API
    useEffect(() => {
        carregarVitrine();
    }, []);

    const carregarVitrine = async () => {
        try {
            const response = await api.get('/storefront');
            setBlocks(response.data.data);
        } catch (error) {
            console.error("Erro ao carregar vitrine", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler do Drag & Drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setBlocks(items);
    };

    // Alterna visibilidade do bloco (Ocultar/Exibir)
    const toggleVisibility = (id) => {
        setBlocks(blocks.map(block => 
            block.id === id ? { ...block, isVisible: !block.isVisible } : block
        ));
    };

    // Atualiza as propriedades de um bloco selecionado
    const updateBlockProps = (key, value) => {
        setBlocks(blocks.map(block => 
            block.id === selectedBlockId 
                ? { ...block, props: { ...block.props, [key]: value } } 
                : block
        ));
    };

    // Publica a estrutura no banco de dados
    const handlePublicar = async () => {
        setIsSaving(true);
        try {
            await api.post('/storefront/publish', { layout_blocks: blocks });
            alert("Vitrine atualizada com sucesso! A loja pública já reflete as alterações.");
        } catch (error) {
            console.error("Erro ao salvar vitrine", error);
            alert("Ocorreu um erro ao tentar publicar. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    // Encontra o bloco selecionado para renderizar o inspetor correto
    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    if (isLoading) {
        return <div className="p-10 flex justify-center text-sky-500"><Icons.Spinner /></div>;
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* CABEÇALHO DO ESTÚDIO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Construtor da Vitrine</h1>
                    <p className="text-sm text-gray-500 mt-1">Organize os blocos da página inicial e altere seus conteúdos em tempo real.</p>
                </div>
                <button 
                    onClick={handlePublicar} 
                    disabled={isSaving}
                    className="bg-[#111827] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    {isSaving ? <><Icons.Spinner /> Publicando...</> : "Publicar Vitrine na Loja"}
                </button>
            </div>

            {/* ÁREA DE TRABALHO: 2 COLUNAS */}
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* COLUNA ESQUERDA: LISTA DRAG & DROP */}
                <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-800">Ordem dos Blocos (Segure e Arraste)</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#f8fafc]">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="storefront-blocks">
                                {(provided) => (
                                    <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {blocks.map((block, index) => (
                                            <Draggable key={block.id} draggableId={block.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <li 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                                            snapshot.isDragging ? 'bg-sky-50 border-sky-300 shadow-xl' : 
                                                            selectedBlockId === block.id ? 'bg-white border-sky-400 ring-1 ring-sky-200 shadow-md' : 'bg-white border-gray-200 hover:border-sky-200 shadow-sm'
                                                        }`}
                                                        onClick={() => setSelectedBlockId(block.id)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div {...provided.dragHandleProps}>
                                                                <Icons.DragHandle />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900">{blockNames[block.type] || block.type}</span>
                                                                <span className={`text-[11px] font-bold tracking-wider uppercase mt-1 ${block.isVisible ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                    Estado: {block.isVisible ? 'Ativo na Loja' : 'Oculto'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleVisibility(block.id); }} 
                                                                className={`p-2 rounded-lg border transition-colors ${block.isVisible ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100' : 'bg-red-50 border-red-100 hover:bg-red-100'}`}
                                                                title={block.isVisible ? "Ocultar da Loja" : "Mostrar na Loja"}
                                                            >
                                                                {block.isVisible ? <Icons.Eye /> : <Icons.EyeOff />}
                                                            </button>
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>

                {/* COLUNA DIREITA: INSPETOR DE EDIÇÃO */}
                <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                        <Icons.Settings />
                        <h2 className="font-bold text-gray-800">Inspetor de Propriedades</h2>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        {!selectedBlock ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <p className="text-sm font-medium">Selecione um bloco à esquerda para editar seus dados e imagens.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h3 className="text-lg font-black text-sky-900 mb-1">A editar: {blockNames[selectedBlock.type]}</h3>
                                    <p className="text-xs text-gray-500">As alterações aqui são salvas apenas ao clicar em "Publicar Vitrine".</p>
                                </div>

                                {/* RENDERIZAÇÃO DINÂMICA DE INPUTS CONFORME O TIPO DO BLOCO */}
                                
                                {/* Exemplo genérico: Título do Bloco */}
                                {selectedBlock.props.titulo !== undefined && (
                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 block">Título da Seção</label>
                                        <input 
                                            type="text" 
                                            value={selectedBlock.props.titulo} 
                                            onChange={(e) => updateBlockProps('titulo', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 h-12 text-sm focus:border-sky-400 outline-none transition-all shadow-sm" 
                                        />
                                    </div>
                                )}

                                {/* Controle para Banner Hero */}
                                {selectedBlock.type === 'HeroBanner' && (
                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                        <p className="text-xs text-orange-800 font-bold mb-2">Imagens do Carrossel Principal</p>
                                        <p className="text-[11px] text-orange-600 mb-4">No futuro, ligaremos isto à nossa biblioteca de imagens. Por agora, cole o link da imagem.</p>
                                        <input 
                                            type="text" 
                                            placeholder="URL da Imagem Desktop..."
                                            className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-xs focus:border-orange-400 outline-none transition-all shadow-sm mb-2" 
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="URL do Link de Destino..."
                                            className="w-full bg-white border border-orange-200 rounded-lg px-3 py-2 text-xs focus:border-orange-400 outline-none transition-all shadow-sm" 
                                        />
                                    </div>
                                )}

                                {/* Controle para Promo Banners */}
                                {selectedBlock.type === 'PromoBanners' && selectedBlock.props.quantidade !== undefined && (
                                    <div>
                                        <label className="text-[12px] font-bold text-gray-700 mb-2 block">Quantidade de Banners</label>
                                        <select 
                                            value={selectedBlock.props.quantidade}
                                            onChange={(e) => updateBlockProps('quantidade', Number(e.target.value))}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 h-12 text-sm focus:border-sky-400 outline-none cursor-pointer shadow-sm"
                                        >
                                            <option value={1}>1 Banner (Largura Total)</option>
                                            <option value={2}>2 Banners (Lado a Lado)</option>
                                            <option value={3}>3 Banners (Grid)</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVitrine;