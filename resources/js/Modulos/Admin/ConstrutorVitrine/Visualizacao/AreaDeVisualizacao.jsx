import React, { useEffect, useRef, useState } from 'react';

const AreaDeVisualizacao = ({ blocks }) => {
    const iframeRef = useRef(null);
    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'

    // Sincroniza os blocos com o iframe via postMessage para preview em tempo real (100% fidelidade)
    const enviarParaIframe = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                { type: 'UPDATE_STOREFRONT_PREVIEW', payload: blocks },
                window.location.origin
            );
        }
    };

    useEffect(() => {
        enviarParaIframe();
    }, [blocks]);

    useEffect(() => {
        const handleIframeReady = (event) => {
            if (event.data?.type === 'STOREFRONT_READY') {
                enviarParaIframe();
            }
        };
        window.addEventListener('message', handleIframeReady);
        return () => window.removeEventListener('message', handleIframeReady);
    }, [blocks]); // Dependemos de blocks caso a loja fique pronta depois de já termos os blocos

    return (
        <div className="cv-preview-container">
            <div className={`cv-device-wrapper ${viewMode === 'desktop' ? 'is-desktop' : ''}`}>
                
                {/* Cabeçalho do Dispositivo (Controles de Visualização) */}
                <div className="cv-device-header">
                    <div className="cv-device-dots">
                        <div className="cv-device-dot"></div>
                        <div className="cv-device-dot"></div>
                        <div className="cv-device-dot"></div>
                    </div>
                    
                    <div className="cv-device-controls">
                        <button 
                            className={`cv-device-btn ${viewMode === 'desktop' ? 'is-active' : ''}`}
                            onClick={() => setViewMode('desktop')}
                            title="Visualização Desktop"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button 
                            className={`cv-device-btn ${viewMode === 'mobile' ? 'is-active' : ''}`}
                            onClick={() => setViewMode('mobile')}
                            title="Visualização Mobile"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Iframe carregando a loja real (Front-end) */}
                <iframe 
                    ref={iframeRef}
                    src="/?preview=true" // Rota da loja com parâmetro de preview
                    className="cv-iframe"
                    title="Pré-visualização da Loja"
                />
            </div>
        </div>
    );
};

export default AreaDeVisualizacao;
