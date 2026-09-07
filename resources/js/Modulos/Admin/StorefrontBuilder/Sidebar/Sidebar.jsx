import React, { useRef, useState } from 'react';

const blockNames = {
    BannerPrincipal: "Banner Principal",
    GradeCategorias: "Grade de Categorias",
    BannersPromocionais: "Banners Promocionais",
    CarrosselProdutos: "Carrossel de Produtos",
    ListaGradeProdutos: "Lista em Grade de Produtos",
};

const Sidebar = ({ blocks, setBlocks, selectedBlockId, setSelectedBlockId, toggleVisibility }) => {
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        // Required for Firefox
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
        
        // Custom drag image (optional, browsers usually create a decent ghost)
        setTimeout(() => {
            e.target.classList.add('is-dragging');
        }, 0);
    };

    const handleDragEnter = (e, index) => {
        e.preventDefault();
        setDragOverItemIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragLeave = (e) => {
        setDragOverItemIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData("text/plain"));
        
        if (dragIndex === dropIndex || isNaN(dragIndex)) {
            setDragOverItemIndex(null);
            return;
        }

        const newBlocks = [...blocks];
        const draggedItem = newBlocks[dragIndex];
        
        // Remove from old position
        newBlocks.splice(dragIndex, 1);
        // Insert into new position
        newBlocks.splice(dropIndex, 0, draggedItem);
        
        setBlocks(newBlocks);
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('is-dragging');
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    };

    return (
        <div className="cv-panel">
            <div className="cv-panel-header">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <h2 className="cv-panel-title">Ordem dos Blocos</h2>
            </div>
            
            <div className="cv-panel-content cv-scrollable">
                <ul className="cv-block-list">
                    {blocks.map((block, index) => (
                        <li 
                            key={block.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={`cv-block-item ${selectedBlockId === block.id ? 'is-selected' : ''} ${dragOverItemIndex === index ? 'is-drag-over' : ''}`}
                        >
                            <div className="cv-block-info" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <div className="cv-drag-handle" title="Segure para arrastar">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="cv-block-name">{blockNames[block.type] || block.type}</span>
                                    <div className={`cv-block-status ${block.isVisible ? 'cv-status-active' : 'cv-status-inactive'}`}>
                                        {block.isVisible ? 'Ativo' : 'Oculto'}
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    toggleVisibility(block.id); 
                                }}
                                className={`cv-action-btn ${block.isVisible ? 'cv-action-btn-success' : 'cv-action-btn-danger'}`}
                                title={block.isVisible ? "Ocultar da Loja" : "Mostrar na Loja"}
                            >
                                {block.isVisible ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.018 10.018 0 014.122-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                                    </svg>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;