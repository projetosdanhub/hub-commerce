import React from 'react';

const blockNames = {
    BannerPrincipal: "Banner Principal",
    GradeCategorias: "Grade de Categorias",
    BannersPromocionais: "Banners Promocionais",
    CarrosselProdutos: "Carrossel de Produtos",
    ListaGradeProdutos: "Lista em Grade de Produtos",
};

const InspetorDePropriedades = ({ selectedBlock, updateBlockProps }) => {
    
    if (!selectedBlock) {
        return (
            <div className="cv-panel">
                <div className="cv-panel-header">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="cv-panel-title">Inspetor</h2>
                </div>
                <div className="cv-panel-content cv-inspector-empty">
                    Selecione um bloco à esquerda para editar as suas configurações.
                </div>
            </div>
        );
    }

    // Handlers para facilitar
    const handleChange = (key, value) => {
        updateBlockProps(key, value);
    };

    return (
        <div className="cv-panel">
            <div className="cv-panel-header">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="cv-panel-title">Inspetor: {blockNames[selectedBlock.type] || selectedBlock.type}</h2>
            </div>
            
            <div className="cv-panel-content cv-scrollable">
                <div className="cv-inspector-form">
                    
                    {/* Título Genérico (Se existir na prop) */}
                    {selectedBlock.props.titulo !== undefined && (
                        <div className="cv-field-group">
                            <label className="cv-label">Título da Secção</label>
                            <input 
                                type="text" 
                                className="cv-input"
                                value={selectedBlock.props.titulo}
                                onChange={(e) => handleChange('titulo', e.target.value)}
                                placeholder="Ex: Ofertas da Semana"
                            />
                        </div>
                    )}

                    {/* Editor específico para: BannerPrincipal */}
                    {selectedBlock.type === 'BannerPrincipal' && (
                        <>
                            <div className="cv-field-group">
                                <label className="cv-label">Estilo de Largura</label>
                                <select 
                                    className="cv-select"
                                    value={selectedBlock.props.largura || 'full'}
                                    onChange={(e) => handleChange('largura', e.target.value)}
                                >
                                    <option value="full">Largura Total (Ecrã Inteiro)</option>
                                    <option value="half">Contido (Box com bordas)</option>
                                </select>
                            </div>

                            <div className="cv-field-group">
                                <label className="cv-label">Comportamento</label>
                                <select 
                                    className="cv-select"
                                    value={selectedBlock.props.tipo || 'carrossel'}
                                    onChange={(e) => handleChange('tipo', e.target.value)}
                                >
                                    <option value="carrossel">Carrossel Automático</option>
                                    <option value="fixo">Imagem Fixa</option>
                                </select>
                            </div>

                            <div className="cv-notice-box">
                                <h4 className="cv-notice-title">Gestão de Banners</h4>
                                <p className="cv-notice-text">
                                    A gestão das imagens individuais (Desktop e Mobile) é feita no painel central de Marketing. O Construtor puxa os banners ativos automaticamente.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Editor específico para: GradeCategorias */}
                    {selectedBlock.type === 'GradeCategorias' && (
                        <>
                            <div className="cv-field-group">
                                <label className="cv-label">Estilo Visual</label>
                                <select 
                                    className="cv-select"
                                    value={selectedBlock.props.estilo || 'redondo'}
                                    onChange={(e) => handleChange('estilo', e.target.value)}
                                >
                                    <option value="redondo">Círculos (Estilo APP Shopee/Shein)</option>
                                    <option value="card">Cartões (Retangulares)</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Editor específico para: BannersPromocionais */}
                    {selectedBlock.type === 'BannersPromocionais' && (
                        <>
                            <div className="cv-field-group">
                                <label className="cv-label">Quantidade de Colunas</label>
                                <select 
                                    className="cv-select"
                                    value={selectedBlock.props.quantidade || 2}
                                    onChange={(e) => handleChange('quantidade', Number(e.target.value))}
                                >
                                    <option value={1}>1 Banner (Largo)</option>
                                    <option value={2}>2 Banners (Metade / Metade)</option>
                                    <option value={3}>3 Banners (Grelha)</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Editor específico para: CarrosselProdutos */}
                    {selectedBlock.type === 'CarrosselProdutos' && (
                        <>
                            <div className="cv-field-group">
                                <label className="cv-label">Origem dos Produtos</label>
                                <select 
                                    className="cv-select"
                                    value={selectedBlock.props.colecao || 'destaques'}
                                    onChange={(e) => handleChange('colecao', e.target.value)}
                                >
                                    <option value="destaques">Produtos em Destaque</option>
                                    <option value="novidades">Últimos Adicionados (Novidades)</option>
                                    <option value="ofertas">Ofertas / Com Desconto</option>
                                    <option value="mais_vendidos">Mais Vendidos</option>
                                </select>
                            </div>
                            
                            <div className="cv-field-group">
                                <label className="cv-label">Limite de Produtos</label>
                                <select 
                                    className="cv-select"
                                    value={selectedBlock.props.limite || 8}
                                    onChange={(e) => handleChange('limite', Number(e.target.value))}
                                >
                                    <option value={4}>4 Produtos</option>
                                    <option value={8}>8 Produtos</option>
                                    <option value={12}>12 Produtos</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InspetorDePropriedades;
