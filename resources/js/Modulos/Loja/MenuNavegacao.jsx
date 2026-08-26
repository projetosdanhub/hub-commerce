// ============================================================================
// FICHEIRO: resources/js/Modulos/Loja/NavigationMenu.jsx
// ARQUITETURA: Mega Menu SEO-Friendly (API Connected, UX Delays, UI Premium)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

// --- ÍCONES SVG ---
const ChevronDown = ({ isOpen }) => (
    <svg aria-hidden="true" className={`w-3.5 h-3.5 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-500' : 'text-slate-400 group-hover:text-sky-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
);

const SpinnerSmall = () => (
    <svg aria-hidden="true" className="w-3.5 h-3.5 ml-1 animate-spin text-sky-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const NavigationMenu = () => {
    const navigate = useNavigate();

    // --- ESTADOS LOCAIS ---
    const [dropdownAberto, setDropdownAberto] = useState(null);
    const [navigatingTo, setNavigatingTo] = useState(null);
    const [categoriasBase, setCategoriasBase] = useState([]);

    // --- CONFIGURAÇÕES DE DADOS ---
    const configMenu = {
        alinhamento: 'justify-center', 
        utmGlobal: "?utm_source=menu_topo&utm_medium=organic",
    };

    // 1. Busca a Árvore de Menus Reais da API (já configurado no StorefrontController)
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                // Rota dedicada a trazer APENAS menus ativos e sincronizados
                const res = await api.get('/storefront/menu');
                if (res.data?.data) {
                    const rawMenus = res.data.data;

                    // O Backend já entrega os ativos e filtra filhos de pais inativos.
                    // Agora montamos a estrutura em árvore para facilitar a renderização no frontend.
                    const tree = [];
                    const map = {};

                    // Preenche o map inicial
                    rawMenus.forEach(item => {
                        map[item.id] = { 
                            ...item,
                            dropdown: { links: [] } // Inicia estrutura para receber filhos
                        };
                    });

                    // Atribui os filhos aos pais
                    rawMenus.forEach(item => {
                        if (item.parent_id && map[item.parent_id]) {
                            map[item.parent_id].dropdown.links.push({
                                nome: item.nome,
                                url: item.link || '#',
                                id: item.id
                            });
                        } else if (!item.parent_id) {
                            tree.push(map[item.id]);
                        }
                    });

                    // Se não houver filhos, transformamos dropdown em null para não renderizar a seta indevidamente
                    tree.forEach(pai => {
                        if (pai.dropdown.links.length === 0) {
                            pai.dropdown = null;
                        }
                    });

                    // Adiciona o Início fixo apenas se for do agrado, mas a solicitação dizia "tirando os dados fictícios".
                    // Se o cliente criar um menu "Início" no painel, ele virá do banco.
                    // Portanto, o menu será 100% dinâmico:
                    setCategoriasBase(tree);
                }
            } catch (error) {
                console.error("Erro ao carregar menu da loja", error);
            }
        };
        fetchMenu();
    }, []);

    // --- HANDLER INTELIGENTE DE NAVEGAÇÃO (Com Delay UX) ---
    const handleNavigation = (e, urlCompleta) => {
        e.preventDefault(); 

        if (navigatingTo) return; // Trava contra cliques duplos
        setNavigatingTo(urlCompleta);
        
        // Sweet Spot de UX: 250ms para ver o spinner e dar uma transição elegante
        setTimeout(() => {
            setNavigatingTo(null);
            setDropdownAberto(null);
            navigate(urlCompleta);
        }, 250);
    };

    return (
        <nav aria-label="Navegação Principal" className="w-full relative z-40 bg-white">
            <ul className={`flex items-center gap-8 py-3.5 ${configMenu.alinhamento}`}>
                {categoriasBase.map((item) => {
                    const urlPrincipal = item.link || '#';
                    const urlComUtm = urlPrincipal !== '#' ? `${urlPrincipal}${configMenu.utmGlobal}` : '#';
                    const isEsteItemAberto = dropdownAberto === item.id;
                    const isEsteItemNavegando = navigatingTo === urlComUtm && urlComUtm !== '#';

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
                                onClick={(e) => {
                                    if (urlComUtm !== '#') handleNavigation(e, urlComUtm);
                                    else e.preventDefault();
                                }}
                                aria-expanded={isEsteItemAberto}
                                className={`flex items-center text-[12px] font-black uppercase tracking-widest transition-colors duration-200 ${
                                    isEsteItemAberto 
                                        ? 'text-sky-600' 
                                        : 'text-slate-600 hover:text-sky-600'
                                }`}
                            >
                                {item.nome}
                                
                                {isEsteItemNavegando ? (
                                    <SpinnerSmall />
                                ) : (
                                    item.dropdown && <ChevronDown isOpen={isEsteItemAberto} />
                                )}
                            </a>

                            {/* MEGA MENU (Dropdown Animado Clean) */}
                            {item.dropdown && (
                                <AnimatePresence>
                                    {isEsteItemAberto && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15, scale: 0.98 }} 
                                            animate={{ opacity: 1, y: 0, scale: 1 }} 
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 flex"
                                        >
                                            {/* Triângulo Apontador */}
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-45"></div>
                                            
                                            <div className="relative z-10 flex w-max min-w-[200px]">
                                                {/* Links do Submenu */}
                                                <ul className="flex flex-col py-3 px-2 w-full">
                                                    {item.dropdown.links.map((sub, idx) => {
                                                        const subUrlComUtm = `${sub.url}${configMenu.utmGlobal}`;
                                                        const isSubNavegando = navigatingTo === subUrlComUtm;

                                                        return (
                                                            <li key={idx}>
                                                                <a 
                                                                    href={subUrlComUtm}
                                                                    onClick={(e) => handleNavigation(e, subUrlComUtm)}
                                                                    className="flex items-center justify-between px-4 py-3 text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-sky-600 rounded-xl transition-all group/sublink"
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