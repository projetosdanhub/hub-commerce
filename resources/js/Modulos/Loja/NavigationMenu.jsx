// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/NavigationMenu.jsx
// ARQUITETURA: Mega Menu SEO-Friendly c/ UX Delays e Imagens Promocionais
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- ÍCONES ---
const ChevronDown = ({ isOpen }) => (
    <svg 
        className={`w-3.5 h-3.5 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-500' : 'text-gray-400 group-hover:text-sky-500'}`} 
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
);

const SpinnerSmall = () => (
    <svg className="w-3.5 h-3.5 ml-1 animate-spin text-sky-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const NavigationMenu = () => {
    const navigate = useNavigate();

    // --- ESTADOS LOCAIS ---
    const [dropdownAberto, setDropdownAberto] = useState(null);
    const [navigatingTo, setNavigatingTo] = useState(null);

    // --- CONFIGURAÇÕES DE DADOS (Puxado do Painel Lojista) ---
    const configMenu = {
        alinhamento: 'justify-center', // Opções: justify-start, justify-center, justify-end
        utmGlobal: "?utm_source=menu_topo&utm_medium=organic", // Para GA4 e Meta Pixel
        
        itens: [
            { 
                id: 1, 
                nome: "Página Inicial", 
                url: "/", 
                destaque: false, 
                dropdown: null 
            },
            { 
                id: 2, 
                nome: "Departamentos", 
                url: "/categoria/departamentos", 
                destaque: false, 
                dropdown: {
                    links: [
                        { nome: "Eletrónicos Premium", url: "/categoria/eletronicos" },
                        { nome: "Smartphones & Relógios", url: "/categoria/smartphones" },
                        { nome: "Casa e Decoração", url: "/categoria/casa" },
                        { nome: "Moda Sustentável", url: "/categoria/moda" }
                    ],
                    // Promoção Ativa no Mega Menu
                    promo: {
                        ativa: true,
                        imagem: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
                        titulo: "Ofertas Exclusivas",
                        textoBotao: "Ver Coleção",
                        url: "/ofertas"
                    }
                } 
            },
            { 
                id: 3, 
                nome: "Mais Vendidos", 
                url: "/categoria/mais-vendidos", 
                destaque: false, 
                dropdown: null 
            },
            { 
                id: 4, 
                nome: "Saldos Diários", 
                url: "/ofertas", 
                destaque: true, // Pinta o link de vermelho para atrair o olhar
                dropdown: null 
            }
        ]
    };

    // --- HANDLER INTELIGENTE DE NAVEGAÇÃO (Com Delay UX) ---
    const handleNavigation = (e, urlCompleta) => {
        // Previne o recarregamento natural da tag <a>
        e.preventDefault(); 
        
        if (navigatingTo) return; // Evita múltiplos cliques rápidos
        
        setNavigatingTo(urlCompleta);
        
        // 250ms é o "Sweet Spot" de UX para exibir o spinner e dar uma transição elegante
        setTimeout(() => {
            setNavigatingTo(null);
            setDropdownAberto(null);
            navigate(urlCompleta);
        }, 250);
    };

    return (
        <nav aria-label="Navegação Principal" className="w-full relative z-40">
            <ul className={`flex items-center gap-8 py-3.5 ${configMenu.alinhamento}`}>
                {configMenu.itens.map((item) => {
                    const urlComUtm = `${item.url}${configMenu.utmGlobal}`;
                    const isEsteItemAberto = dropdownAberto === item.id;
                    const isEsteItemNavegando = navigatingTo === urlComUtm;

                    return (
                        <li 
                            key={item.id} 
                            className="relative group" 
                            onMouseEnter={() => setDropdownAberto(item.id)} 
                            onMouseLeave={() => setDropdownAberto(null)}
                        >
                            {/* LINK SEO-FRIENDLY */}
                            <a 
                                href={urlComUtm}
                                onClick={(e) => handleNavigation(e, urlComUtm)}
                                className={`flex items-center text-[13px] font-bold tracking-wide transition-colors duration-200 ${
                                    item.destaque 
                                        ? 'text-red-500 hover:text-red-600' 
                                        : isEsteItemAberto 
                                            ? 'text-sky-600' 
                                            : 'text-gray-700 hover:text-sky-600'
                                }`}
                            >
                                {item.nome}
                                {/* Mostra o Spinner se estiver a navegar, caso contrário mostra a seta (se houver dropdown) */}
                                {isEsteItemNavegando ? (
                                    <SpinnerSmall />
                                ) : (
                                    item.dropdown && <ChevronDown isOpen={isEsteItemAberto} />
                                )}
                            </a>

                            {/* MEGA MENU (Dropdown Animado c/ Imagem Promo) */}
                            {item.dropdown && (
                                <AnimatePresence>
                                    {isEsteItemAberto && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15, scale: 0.98 }} 
                                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden z-50 flex"
                                        >
                                            {/* Triângulo Apontador em Cima */}
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>

                                            <div className="relative z-10 flex w-max min-w-[240px]">
                                                {/* Coluna Esquerda: Links do Submenu */}
                                                <ul className="flex flex-col py-4 px-3 min-w-[200px]">
                                                    {item.dropdown.links.map((sub, idx) => {
                                                        const subUrlComUtm = `${sub.url}${configMenu.utmGlobal}`;
                                                        const isSubNavegando = navigatingTo === subUrlComUtm;

                                                        return (
                                                            <li key={idx}>
                                                                <a 
                                                                    href={subUrlComUtm} 
                                                                    onClick={(e) => handleNavigation(e, subUrlComUtm)}
                                                                    className="flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl font-medium transition-all group/sublink"
                                                                >
                                                                    {sub.nome}
                                                                    {isSubNavegando ? (
                                                                        <SpinnerSmall />
                                                                    ) : (
                                                                        <svg className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover/sublink:opacity-100 group-hover/sublink:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                                    )}
                                                                </a>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>

                                                {/* Coluna Direita: Promoção Visual do Lojista */}
                                                {item.dropdown.promo && item.dropdown.promo.ativa && (
                                                    <div className="p-4 bg-gray-50 border-l border-gray-100 w-[220px]">
                                                        <a 
                                                            href={`${item.dropdown.promo.url}${configMenu.utmGlobal}`} 
                                                            onClick={(e) => handleNavigation(e, `${item.dropdown.promo.url}${configMenu.utmGlobal}`)}
                                                            className="block relative h-full w-full rounded-xl overflow-hidden group/promo"
                                                        >
                                                            <img 
                                                                src={item.dropdown.promo.imagem} 
                                                                alt={item.dropdown.promo.titulo} 
                                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/promo:scale-110" 
                                                            />
                                                            {/* Overlay Escuro para Legibilidade */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                                                            
                                                            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-start">
                                                                <span className="text-white font-bold text-[14px] leading-tight mb-2 drop-shadow-md">
                                                                    {item.dropdown.promo.titulo}
                                                                </span>
                                                                <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 hover:bg-white hover:text-sky-600 transition-colors">
                                                                    {navigatingTo === `${item.dropdown.promo.url}${configMenu.utmGlobal}` ? "A carregar..." : item.dropdown.promo.textoBotao}
                                                                </span>
                                                            </div>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default NavigationMenu;