// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/PromoBanners.jsx
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente PromoBanners
 * @param {Array} banners - Lista de objetos de banner (urlImagemDesktop, urlImagemMobile, linkDestino, altSEO)
 * @param {Number} maxBanners - Limite máximo de banners a exibir (Normalmente 2 na Home, 3 em Categoria/Produto)
 */
const PromoBanners = ({ banners = [], maxBanners = 2 }) => {
    
    // Se não existirem banners configurados ou ativos, não renderiza a secção
    if (!banners || banners.length === 0) return null;

    // Garante que respeitamos o limite configurado (ex: o lojista adicionou 5 mas a página só suporta 3)
    const numeroBanners = banners.length > maxBanners ? maxBanners : banners.length;
    const bannersAtivos = banners.slice(0, numeroBanners);

    // Ajusta as colunas da grelha (Grid) de forma inteligente consoante a quantidade de banners
    let gridColsClass = "grid-cols-1";
    if (numeroBanners === 2) gridColsClass = "md:grid-cols-2";
    if (numeroBanners >= 3) gridColsClass = "md:grid-cols-3";

    return (
        <section 
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16" 
            aria-label="Banners Promocionais"
        >
            <div className={`grid ${gridColsClass} gap-5 sm:gap-6`}>
                
                {bannersAtivos.map((banner) => (
                    <Link 
                        key={banner.id} 
                        to={banner.linkDestino}
                        className="block w-full overflow-hidden rounded-[20px] shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
                        draggable="false" // Previne comportamento nativo de arrastar links/imagens no browser
                    >
                        {/* SEO & PERFORMANCE: Elemento <picture> 
                            O browser descarrega apenas a imagem certa para o ecrã atual (poupa dados no telemóvel)
                        */}
                        <picture>
                            <source media="(max-width: 767px)" srcSet={banner.urlImagemMobile} />
                            <source media="(min-width: 768px)" srcSet={banner.urlImagemDesktop} />
                            <img 
                                src={banner.urlImagemDesktop} 
                                alt={banner.altSEO} 
                                loading="lazy" // Não bloqueia o carregamento inicial da página
                                draggable="false"
                                className="w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[280px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        </picture>
                    </Link>
                ))}
                
            </div>
        </section>
    );
};

export default PromoBanners;