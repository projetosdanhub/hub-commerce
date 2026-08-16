// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/HomePage.jsx
// ARQUITETURA: Montra Principal (Home) com o Layout Original Restaurado
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// --- IMPORTAÇÃO DOS COMPONENTES DA LOJA ---
import HeroBanner from './HeroBanner';
import CategoryGrid from './CategoryGrid';
import ProductCard from './ProductCard';
import ProductCardHorizontal from './ProductCardHorizontal';
import PromoBanners from './PromoBanners';

// ============================================================================
// COMPONENTES DA HOME (Carrossel e Lista Horizontal)
// ============================================================================
const ProductCarousel = ({ onOpenQuickView }) => {
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const configLojista = {
        tituloDaSecao: "Novidades da Semana",
        mostrarVerTodos: true,
        linkVerTodos: "/categoria/novidades",
    };

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
                if(carouselRef.current) {
                    carouselRef.current.style.scrollSnapType = 'x mandatory';
                    checkScrollPosition();
                }
            }, 400);
        }
    };

    return (
        <section className="bg-white rounded-[24px] shadow-sm p-4 sm:p-6 md:p-10 relative border border-gray-100 overflow-hidden w-full group mb-16" aria-label={configLojista.tituloDaSecao}>
            <header className="flex justify-between items-end mb-6 sm:mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-[18px] sm:text-[22px] md:text-[26px] font-semibold text-gray-900 tracking-tight">{configLojista.tituloDaSecao}</h2>
                {configLojista.mostrarVerTodos && (
                    <Link to={configLojista.linkVerTodos} className="text-[11px] sm:text-sm font-semibold text-blue-600 hover:text-[#111827] transition-colors flex items-center gap-1 group/link pb-0.5 sm:pb-1">
                        Ver todos
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 transform transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>
                )}
            </header>
            
            <div className={`absolute top-1/2 left-3 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex ${!canScrollLeft ? 'invisible' : ''}`}>
                <button onClick={() => scrollByAmount(-350)} className="w-14 h-14 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all">
                    <svg className="w-8 h-8 ml-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                </button>
            </div>

            <div className={`absolute top-1/2 right-3 transform -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex ${!canScrollRight ? 'invisible' : ''}`}>
                <button onClick={() => scrollByAmount(350)} className="w-14 h-14 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all">
                     <svg className="w-8 h-8 mr-[-2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            <div className="overflow-hidden w-full relative">
                <div ref={carouselRef} onScroll={checkScrollPosition} className="flex gap-3 sm:gap-5 pb-4 px-1 sm:px-2 pt-2 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}}></style>
                    {[1,2,3,4,5,6].map(id => (
                        <div key={id} className="snap-start flex-shrink-0"><ProductCard abrirModal={onOpenQuickView} produtoId={id} /></div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ProductListGrid = ({ onOpenQuickView }) => {
    return (
        <section className="bg-white rounded-[24px] shadow-sm p-6 md:p-10 relative border border-gray-100 w-full mb-16">
            <header className="flex justify-between items-end mb-6 sm:mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-[22px] md:text-[26px] font-semibold text-gray-900 tracking-tight">Mais Desejados</h2>
                <Link to="/categoria/mais-desejados" className="text-[12px] sm:text-sm font-semibold text-emerald-600 hover:text-gray-900 transition-colors flex items-center gap-1 group/link pb-0.5 sm:pb-1">
                    Ver todos
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transform transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </Link>
            </header>
            <div className="flex lg:grid lg:grid-cols-2 gap-4 sm:gap-6 w-full overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-smooth pb-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}}></style>
                {[1,2,3,4].map(id => (
                    <div key={id} className="snap-start flex-shrink-0 lg:flex-shrink w-auto lg:w-full">
                        <ProductCardHorizontal abrirModal={onOpenQuickView} produtoId={id} />
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// COMPONENTE PRINCIPAL: HomePage
// ============================================================================
const HomePage = ({ onOpenQuickView }) => {
    const bannersHome = [
        { id: 1, urlImagemDesktop: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=1200', urlImagemMobile: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=800', linkDestino: '/ofertas' },
        { id: 2, urlImagemDesktop: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1200', urlImagemMobile: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800', linkDestino: '/produto/1' }
    ];

    return (
        <div className="w-full relative">
            <Helmet>
                <title>HUB Commerce | A sua loja de confiança</title>
                <link rel="canonical" href="https://hubcommerce.pt/" />
            </Helmet>
            
            <HeroBanner />
            <CategoryGrid />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ProductCarousel onOpenQuickView={onOpenQuickView} />
            </div>
            <PromoBanners banners={bannersHome} maxBanners={2} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                <ProductListGrid onOpenQuickView={onOpenQuickView} />
            </div>
        </div>
    );
};

export default HomePage;