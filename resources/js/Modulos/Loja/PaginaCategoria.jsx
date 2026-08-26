// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/CategoryPage.jsx
// ============================================================================

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import PromoBanners from './PromoBanners';

// Ícones UI
const FilterIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
    </svg>
);
const ChevronRight = () => (
    <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
);

const CategoryPage = () => {
    // 1. Dados da Categoria Ativa (Virão da Base de Dados)
    const configCategoria = {
        nome: "Moda Desportiva",
        slug: "moda-desportiva",
        descricao: "Encontre os melhores ténis, roupas e acessórios para o seu treino com descontos imperdíveis.",
        bannerTopo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&h=300&q=80",
        temFiltros: true
    };

    // 2. Simulação de Banners Promocionais da Categoria (Até 3 banners)
    const bannersCategoria = [
        {
            id: 1, 
            urlImagemDesktop: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=800&h=400&q=80',
            urlImagemMobile: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=800&h=800&q=80',
            linkDestino: '/categoria/ofertas', 
            altSEO: 'Promoção Exclusiva'
        },
        {
            id: 2, 
            urlImagemDesktop: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&h=400&q=80',
            urlImagemMobile: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&h=800&q=80',
            linkDestino: '/categoria/lancamentos', 
            altSEO: 'Lançamentos'
        },
        {
            id: 3, 
            urlImagemDesktop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&h=400&q=80',
            urlImagemMobile: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&h=800&q=80',
            linkDestino: '/categoria/tendencias', 
            altSEO: 'Tendências de Moda'
        }
    ];

    const [precoMax, setPrecoMax] = useState(500);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* OTIMIZAÇÃO DE SEO PARA A CATEGORIA */}
            <Helmet>
                <title>{configCategoria.nome} | HUB Commerce</title>
                <meta name="description" content={configCategoria.descricao} />
                <link rel="canonical" href={`https://loja.com/categoria/${configCategoria.slug}`} />
                <meta property="og:title" content={configCategoria.nome} />
                <meta property="og:description" content={configCategoria.descricao} />
                <meta property="og:url" content={`https://loja.com/categoria/${configCategoria.slug}`} />
            </Helmet>

            <Header />

            {/* Banner Específico da Categoria (Topo) */}
            {configCategoria.bannerTopo && (
                <div className="w-full max-w-7xl mx-auto px-4 mt-6 mb-4">
                    <div className="relative w-full h-[200px] md:h-[250px] rounded-2xl overflow-hidden shadow-sm">
                        <img 
                            src={configCategoria.bannerTopo} 
                            className="w-full h-full object-cover" 
                            alt={`Banner da Categoria ${configCategoria.nome}`} 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <h1 className="text-4xl md:text-5xl font-black text-white text-center px-4">
                                {configCategoria.nome}
                            </h1>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                
                {/* BREADCRUMB (Trilha de Navegação para UX/SEO) */}
                <nav className="flex items-center text-sm text-gray-500 mb-6 mt-2" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Início</Link>
                    <ChevronRight />
                    <span className="text-gray-800 font-medium">{configCategoria.nome}</span>
                </nav>

                <div className="flex flex-col md:flex-row gap-8 mb-16">
                    
                    {/* BARRA LATERAL (Filtros) */}
                    {configCategoria.temFiltros && (
                        <aside className="w-full md:w-64 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-28">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <FilterIcon />
                                    <h3 className="font-bold text-gray-800">Filtros</h3>
                                </div>
                                
                                <div className="mb-6 border-b border-gray-100 pb-6">
                                    <h4 className="font-semibold text-sm text-gray-800 mb-4">Faixa de Preço</h4>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1000" 
                                        value={precoMax} 
                                        onChange={(e) => setPrecoMax(e.target.value)} 
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                                        <span>R$ 0</span>
                                        <span>Até R$ {precoMax}</span>
                                    </div>
                                </div>
                                
                                <button className="w-full bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                                    Limpar Filtros
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* GRELHA PRINCIPAL DOS PRODUTOS DA CATEGORIA */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <span className="text-sm text-gray-500">Mostrando <strong>24</strong> produtos</span>
                            <div className="flex items-center gap-2 text-sm">
                                <label className="text-gray-500 font-medium hidden sm:block">Ordenar por:</label>
                                <select className="border-gray-200 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 p-2 outline-none cursor-pointer bg-transparent">
                                    <option>Mais Populares</option>
                                    <option>Menor Preço</option>
                                    <option>Maior Preço</option>
                                    <option>Lançamentos</option>
                                </select>
                            </div>
                        </div>

                        {/* Utilização do ProductCard para listar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ProductCard produtoId={1} />
                            <ProductCard produtoId={2} />
                            <ProductCard produtoId={3} />
                            <ProductCard produtoId={4} />
                            <ProductCard produtoId={5} />
                            <ProductCard produtoId={6} />
                        </div>
                    </div>
                </div>

                {/* SECÇÃO BANNERS PROMOCIONAIS EXCLUSIVA DA CATEGORIA (Max 3) */}
                <PromoBanners banners={bannersCategoria} maxBanners={3} />

            </main>
            <Footer />
        </div>
    );
};

export default CategoryPage;