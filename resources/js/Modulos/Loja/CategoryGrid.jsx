// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/CategoryGrid.jsx
// ============================================================================

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryGrid = () => {
    const carouselRef = useRef(null);
    const navigate = useNavigate();
    
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // 1. Configurações do Lojista (Painel HQ Admin)
    const config = {
        tituloSecao: "Explore por Categorias",
        mostrarSecao: true,
        estilo: 'card', // Opções: 'redondo' (Estilo Shopee) OU 'card' (Estilo Retangular)
    };

    // 2. Dados das Categorias (Mock - Virão da Base de Dados)
    const categorias = [
        { id: 1, nome: "Eletrónicos", slug: "eletronicos", imagem: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80" },
        { id: 2, nome: "Moda & Acessórios", slug: "moda", imagem: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80" },
        { id: 3, nome: "Casa & Jardim", slug: "casa", imagem: null }, // Teste sem imagem (Gera degradê)
        { id: 4, nome: "Beleza", slug: "beleza", imagem: "https://images.unsplash.com/photo-1522335789203-aabd1fc54c28?w=200&q=80" },
        { id: 5, nome: "Desporto", slug: "desporto", imagem: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&q=80" },
        { id: 6, nome: "Brinquedos", slug: "brinquedos", imagem: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200&q=80" },
        { id: 7, nome: "Livros", slug: "livros", imagem: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&q=80" },
        { id: 8, nome: "Pets", slug: "pets", imagem: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&q=80" },
    ];

    // Deteção de Limites de Scroll (Setas Desktop)
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
        const timeout = setTimeout(checkScrollPosition, 250);
        return () => {
            window.removeEventListener('resize', checkScrollPosition);
            clearTimeout(timeout);
        };
    }, []);

    const scrollByAmount = (amount) => {
        if (carouselRef.current) {
            carouselRef.current.style.scrollSnapType = 'none';
            carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
            setTimeout(() => {
                if(carouselRef.current) {
                    carouselRef.current.style.scrollSnapType = 'x mandatory';
                    checkScrollPosition();
                }
            }, 400);
        }
    };

    // 3. Tracking Pixel e Navegação
    const handleCategoryClick = (categoria) => {
        // Exemplo Metrificação Meta Pixel / Analytics
        // window.fbq('trackCustom', 'ViewCategory', { content_name: categoria.nome, content_category: categoria.slug });
        navigate(`/categoria/${categoria.slug}`);
    };

    // Gerador de fundo degradê caso a imagem falhe ou o lojista não coloque
    const getFallbackGradient = (id) => {
        const cores = [
            'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 
            'from-orange-400 to-rose-400', 'from-purple-400 to-pink-500',
            'from-amber-400 to-orange-500', 'from-cyan-400 to-blue-500'
        ];
        return cores[id % cores.length];
    };

    if (!config.mostrarSecao || categorias.length === 0) return null;

    return (
        <section 
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative group select-none"
            aria-label="Categorias de Produtos"
        >
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-[20px] md:text-[24px] font-bold text-gray-900 tracking-tight">
                    {config.tituloSecao}
                </h2>
            </div>

            {/* Setas Hover (Desktop) */}
            <div className={`absolute top-1/2 left-0 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex ${!canScrollLeft ? 'invisible' : ''}`}>
                <button onClick={() => scrollByAmount(-400)} className="w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer" aria-label="Anterior">
                    <svg className="w-7 h-7 ml-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                </button>
            </div>
            <div className={`absolute top-1/2 right-0 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex ${!canScrollRight ? 'invisible' : ''}`}>
                <button onClick={() => scrollByAmount(400)} className="w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer" aria-label="Próximo">
                     <svg className="w-7 h-7 mr-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            {/* Carrossel de Categorias */}
            <div className="overflow-hidden w-full relative -mx-2 px-2">
                <div 
                    ref={carouselRef} 
                    onScroll={checkScrollPosition}
                    className="flex pb-4 overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-y no-scrollbar"
                    // Gap gerido no elemento filho para controlo matemático preciso das colunas
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style dangerouslySetContent={{__html: `::-webkit-scrollbar { display: none; }`}}></style>
                    
                    {categorias.map((cat) => {
                        
                        // --- ESTILO REDONDO (Shopee / Shein) ---
                        if (config.estilo === 'redondo') {
                            return (
                                <div 
                                    key={cat.id} 
                                    onClick={() => handleCategoryClick(cat)}
                                    // Mobile: 2.5 visíveis (w-[38%] aprox), Desktop: 6 visíveis (w-[16.666%])
                                    className="snap-start flex-shrink-0 flex flex-col items-center cursor-pointer group/cat px-2 w-[calc(45%)] sm:w-[calc(30%)] md:w-[calc(20%)] lg:w-[calc(16.666%)]"
                                >
                                    <div className="w-[85px] h-[85px] sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden shadow-sm border border-gray-100 group-hover/cat:shadow-md group-hover/cat:border-gray-300 transition-all duration-300 flex items-center justify-center bg-gray-50 mb-3">
                                        {cat.imagem ? (
                                            <img src={cat.imagem} alt={cat.nome} loading="lazy" draggable="false" className="w-full h-full object-cover group-hover/cat:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${getFallbackGradient(cat.id)} flex items-center justify-center text-white text-2xl font-bold uppercase`}>
                                                {cat.nome.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-gray-700 font-medium text-[13px] sm:text-[14px] text-center leading-tight line-clamp-2 px-1 group-hover/cat:text-blue-600 transition-colors">
                                        {cat.nome}
                                    </span>
                                </div>
                            );
                        }

                        // --- ESTILO CARD (Retangular Clássico) ---
                        return (
                            <div 
                                key={cat.id} 
                                onClick={() => handleCategoryClick(cat)}
                                // Mobile: 2 visíveis (w-[50%]), Desktop: 6 visíveis (w-[16.666%])
                                className="snap-start flex-shrink-0 cursor-pointer group/cat px-2 w-[calc(50%)] sm:w-[calc(33.333%)] md:w-[calc(25%)] lg:w-[calc(16.666%)]"
                            >
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover/cat:shadow-md transition-all duration-300 flex flex-col h-[130px] sm:h-[160px]">
                                    {/* Imagem Ocupa 70% do Card */}
                                    <div className="h-[70%] w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                                        {cat.imagem ? (
                                            <img src={cat.imagem} alt={cat.nome} loading="lazy" draggable="false" className="w-full h-full object-cover mix-blend-multiply group-hover/cat:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${getFallbackGradient(cat.id)} flex items-center justify-center text-white text-3xl font-bold uppercase`}>
                                                {cat.nome.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    {/* Texto Ocupa 30% do Card */}
                                    <div className="h-[30%] flex items-center justify-center p-2 bg-white">
                                        <span className="text-gray-800 font-semibold text-[12px] sm:text-[14px] text-center truncate w-full group-hover/cat:text-blue-600 transition-colors">
                                            {cat.nome}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;