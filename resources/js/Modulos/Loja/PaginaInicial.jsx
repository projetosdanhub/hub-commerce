// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/HomePage.jsx
// ARQUITETURA: Motor de Renderização Dinâmica (Headless UI)
// OTIMIZAÇÕES: SEO, Acessibilidade (a11y), Core Web Vitals e Pixel Ready
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import api from '../../api'; // Instância do Axios

// --- IMPORTAÇÃO DOS BLOCOS DA LOJA ---
import BannerPrincipal from './BannerPrincipal';
import GradeCategorias from './GradeCategorias';
import CartaoProduto from './CartaoProduto';
import CartaoProdutoHorizontal from './CartaoProdutoHorizontal';
import BannersPromocionais from './BannersPromocionais';

// ============================================================================
// ESCUDO TOTAL (ERROR BOUNDARY)
// Evita a "Tela Branca da Morte". Se um bloco falhar, ele é isolado e ocultado.
// ============================================================================
class BlockErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error(`[HUB Commerce] Falha ao renderizar bloco da vitrine:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Em produção, falha silenciosamente (retorna nulo) para não quebrar o layout do cliente
            return null; 
        }
        return this.props.children;
    }
}

// ============================================================================
// COMPONENTES INTERNOS DA HOME (Carrossel e Lista Horizontal)
// ============================================================================
const CarrosselProdutos = ({ titulo = "Novidades da Semana", linkVerTodos = "/categoria/novidades", onOpenQuickView }) => {
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [produtos, setProdutos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                // TODO: passar params.category_id se este bloco for configurado para uma categoria específica
                const response = await api.get('/storefront/products');
                if (response.data && response.data.data && response.data.data.data) {
                    setProdutos(response.data.data.data); // O retorno é paginado
                }
            } catch (error) {
                console.error("Erro ao carregar produtos do carrossel:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProdutos();
    }, []);

    const checkScrollPosition = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        window.addEventListener('resize', checkScrollPosition);
        return () => window.removeEventListener('resize', checkScrollPosition);
    }, []);

    const scrollByAmount = (amount) => {
        if (carouselRef.current) {
            carouselRef.current.style.scrollSnapType = 'none';
            carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
            setTimeout(() => {
                if (carouselRef.current) {
                    carouselRef.current.style.scrollSnapType = 'x mandatory';
                    checkScrollPosition();
                }
            }, 400);
        }
    };

    return (
        <section className="bg-white rounded-[24px] shadow-sm p-4 sm:p-6 md:p-10 relative border border-gray-100 overflow-hidden w-full group mb-12" aria-labelledby="carousel-title">
            <header className="flex justify-between items-end mb-6 sm:mb-8 border-b border-gray-100 pb-4">
                <h2 id="carousel-title" className="text-[18px] sm:text-[22px] md:text-[26px] font-semibold text-gray-900 tracking-tight">{titulo}</h2>
                {linkVerTodos && (
                    <Link to={linkVerTodos} className="text-[11px] sm:text-sm font-semibold text-sky-600 hover:text-[#111827] transition-colors flex items-center gap-1 group/link pb-0.5 sm:pb-1" aria-label={`Ver todos os itens de ${titulo}`}>
                        Ver todos
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 transform transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                )}
            </header>
            
            {/* Setas de Navegação Acessíveis */}
            <div className={`absolute top-1/2 left-3 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex ${!canScrollLeft ? 'invisible' : ''}`}>
                <button onClick={() => scrollByAmount(-350)} aria-label="Rolar para a esquerda" className="w-14 h-14 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-sky-600 hover:scale-105 transition-all">
                    <svg className="w-8 h-8 ml-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                </button>
            </div>
            <div className={`absolute top-1/2 right-3 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex ${!canScrollRight ? 'invisible' : ''}`}>
                <button onClick={() => scrollByAmount(350)} aria-label="Rolar para a direita" className="w-14 h-14 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-sky-600 hover:scale-105 transition-all">
                    <svg className="w-8 h-8 mr-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            <div className="overflow-hidden w-full relative">
                <div ref={carouselRef} onScroll={checkScrollPosition} className="flex gap-3 sm:gap-5 pb-4 px-1 sm:px-2 pt-2 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}}></style>
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(id => (
                            <div key={id} className="snap-start flex-shrink-0">
                                <div className="w-[180px] h-[300px] bg-gray-100 rounded-[20px] animate-pulse"></div>
                            </div>
                        ))
                    ) : produtos.map(produto => (
                        <div key={produto.id} className="snap-start flex-shrink-0">
                            <CartaoProduto abrirModal={onOpenQuickView} produto={produto} produtoId={produto.id} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ListaGradeProdutos = ({ titulo = "Mais Desejados", onOpenQuickView }) => {
    const [produtos, setProdutos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                // Passa is_featured=1 como exemplo, você pode parametrizar pelo props
                const response = await api.get('/storefront/products?is_featured=1');
                if (response.data && response.data.data && response.data.data.data) {
                    setProdutos(response.data.data.data.slice(0, 4)); // Limita a 4 para grade
                }
            } catch (error) {
                console.error("Erro ao carregar lista de grade:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProdutos();
    }, []);

    return (
        <section className="bg-white rounded-[24px] shadow-sm p-6 md:p-10 relative border border-gray-100 w-full mb-12" aria-labelledby="grid-title">
            <header className="flex justify-between items-end mb-6 sm:mb-8 border-b border-gray-100 pb-4">
                <h2 id="grid-title" className="text-[22px] md:text-[26px] font-semibold text-gray-900 tracking-tight">{titulo}</h2>
            </header>
            <div className="flex lg:grid lg:grid-cols-2 gap-4 sm:gap-6 w-full overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-smooth pb-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}}></style>
                {isLoading ? (
                    [1, 2, 3, 4].map(id => (
                        <div key={id} className="snap-start flex-shrink-0 lg:flex-shrink w-[280px] lg:w-full h-[120px] bg-gray-100 rounded-[20px] animate-pulse"></div>
                    ))
                ) : produtos.map(produto => (
                    <div key={produto.id} className="snap-start flex-shrink-0 lg:flex-shrink w-auto lg:w-full">
                        <CartaoProdutoHorizontal abrirModal={onOpenQuickView} produto={produto} produtoId={produto.id} />
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// DICIONÁRIO DE COMPONENTES (Mapeia a String da API para o Componente React)
// ============================================================================
const blockDictionary = {
    BannerPrincipal: BannerPrincipal,
    GradeCategorias: GradeCategorias,
    BannersPromocionais: BannersPromocionais,
    CarrosselProdutos: CarrosselProdutos,
    ListaGradeProdutos: ListaGradeProdutos
};

// ============================================================================
// COMPONENTE PRINCIPAL: HomePage
// ============================================================================
const PaginaInicial = ({ onOpenQuickView }) => {
    const [layoutBlocks, setLayoutBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- SETUP DE TRACKING (PIXEL / GA4 / UTMs) ---
    useEffect(() => {
        // 1. Captura e persistência de parâmetros de campanha (UTMs)
        const params = new URLSearchParams(window.location.search);
        if (params.has('utm_source')) {
            sessionStorage.setItem('hub_session_utms', window.location.search);
        }

        // 2. Disparo base para Google Analytics (GA4) e Meta Pixel
        // Nota: O try/catch previne quebra caso os scripts ainda não estejam no header
        try {
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'page_view', { page_title: 'Home - HUB Commerce', page_location: window.location.href });
            }
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'PageView');
            }
        } catch (error) {
            console.warn("Analytics/Pixel não detectado ainda.");
        }
    }, []);

    // --- CONSUMO DA API PARA RENDERIZAR A VITRINE ---
    useEffect(() => {
        // Verifica se está rodando dentro do iframe do construtor
        const params = new URLSearchParams(window.location.search);
        const isPreview = params.get('preview') === 'true';

        const handleMessage = (event) => {
            // Segurança: Opcionalmente verificar event.origin se necessário
            if (event.data?.type === 'UPDATE_STOREFRONT_PREVIEW') {
                setLayoutBlocks(event.data.payload || []);
                setIsLoading(false);
            }
        };

        if (isPreview) {
            window.addEventListener('message', handleMessage);
            // Avisa o painel pai que a loja está pronta, se necessário
            if (window.parent) {
                window.parent.postMessage({ type: 'STOREFRONT_READY' }, '*');
            }
        }

        const fetchStorefront = async () => {
            if (isPreview) return; // Se for preview, espera o postMessage
            
            try {
                // Endpoint preparado no passo anterior
                const response = await api.get('/storefront');
                if (response.data && response.data.data) {
                    setLayoutBlocks(response.data.data);
                }
            } catch (error) {
                console.error("Erro ao carregar layout da vitrine:", error);
                // Fallback de segurança para não deixar a loja vazia em caso de falha de rede extrema
                setLayoutBlocks([
                    { id: 'fb-1', type: 'BannerPrincipal', isVisible: true, props: {} },
                    { id: 'fb-2', type: 'GradeCategorias', isVisible: true, props: {} }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStorefront();

        return () => {
            if (isPreview) {
                window.removeEventListener('message', handleMessage);
            }
        };
    }, []);

    // --- OTIMIZAÇÃO DE CARREGAMENTO (Skeleton para o Lighthouse / LCP) ---
    if (isLoading) {
        return (
            <div className="w-full min-h-screen animate-pulse p-4">
                <div className="w-full h-[50vh] bg-gray-200 rounded-2xl mb-8"></div>
                <div className="max-w-7xl mx-auto flex gap-4 overflow-hidden mb-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-[150px] h-[150px] bg-gray-200 rounded-full flex-shrink-0"></div>)}
                </div>
            </div>
        );
    }

    return (
        <main className="w-full relative" role="main">
            {/* OTIMIZAÇÃO DE SEO E CANONICALS */}
            <Helmet>
                <title>HUB Commerce | A sua loja de confiança</title>
                <meta name="description" content="Descubra as melhores ofertas e produtos de alta qualidade na HUB Commerce. Compre com segurança, entrega rápida e atendimento premium." />
                <link rel="canonical" href={window.location.origin} />
                <meta property="og:title" content="HUB Commerce | A sua loja de confiança" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.origin} />
            </Helmet>
            
            {/* MOTOR DE RENDERIZAÇÃO DINÂMICA (HEADLESS) */}
            {layoutBlocks.filter(block => block.isVisible).map((block) => {
                const Componente = blockDictionary[block.type];

                if (!Componente) {
                    console.warn(`[HUB Commerce] Componente não encontrado no dicionário: ${block.type}`);
                    return null;
                }

                // Injeta as funções globais (como abrir modal do carrinho) automaticamente nos blocos que precisarem
                const propsInjetadas = {
                    ...block.props,
                    onOpenQuickView: onOpenQuickView
                };

                // Wrapper de largura para componentes que não são full-width nativamente
                const isFullWidth = block.type === 'BannerPrincipal' || block.type === 'GradeCategorias';

                return (
                    <BlockErrorBoundary key={block.id}>
                        {isFullWidth ? (
                            <Componente {...propsInjetadas} />
                        ) : (
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <Componente {...propsInjetadas} />
                            </div>
                        )}
                    </BlockErrorBoundary>
                );
            })}
        </main>
    );
};

export default PaginaInicial;