import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
    // Estas configurações virão do Painel de Administração do Lojista
    const configBanner = {
        ativo: true,
        largura: 'full', // Opções: 'full' (largura total) ou 'half' (contido numa box)
        tipo: 'carrossel', // Opções: 'fixo' (1 imagem) ou 'carrossel' (até 6 imagens)
        tempoTransicao: 5000, // Tempo de rolagem automática em milissegundos (ex: 5000 = 5s)
        
        // Banners para Desktop
        slidesDesktop: [
            { id: 1, url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80', link: '/categoria/ofertas' },
            { id: 2, url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80', link: '/categoria/moda' },
            { id: 3, url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80', link: '/produto/123' },
        ],
        
        // Banners Específicos para Mobile (Opcional: se o lojista não puser, usa os de desktop)
        slidesMobile: [
            { id: 101, url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=800&h=1000&q=80', link: '/categoria/ofertas' },
            { id: 102, url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&h=1000&q=80', link: '/categoria/moda' },
        ]
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Deteção de Ecrã (Desktop vs Mobile) para escolher a imagem certa e melhorar o SEO/LCP
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Executa na montagem
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Determina que lista de slides usar (Garante que maximo são 6 como pediu)
    let slidesAtuais = isMobile && configBanner.slidesMobile.length > 0 
        ? configBanner.slidesMobile 
        : configBanner.slidesDesktop;
    
    slidesAtuais = slidesAtuais.slice(0, 6); // Limita rigorosamente a 6 banners
    
    // Regra: Só anima se for tipo 'carrossel' e tiver mais de 1 imagem. Se for 'fixo', mostra só a primeira.
    const deveAnimar = configBanner.tipo === 'carrossel' && slidesAtuais.length > 1;

    // Lógica do temporizador do carrossel (Auto-play)
    useEffect(() => {
        if (!deveAnimar) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slidesAtuais.length);
        }, configBanner.tempoTransicao);
        return () => clearInterval(timer);
    }, [deveAnimar, slidesAtuais.length, configBanner.tempoTransicao]);

    if (!configBanner.ativo || slidesAtuais.length === 0) return null;

    // Definição dinâmica de classes baseada na configuração "largura"
    // 'full': Cola ao cabeçalho (sem margem no topo), ocupa o ecrã todo.
    // 'half': Ganha cantos arredondados, fica numa box e tem um espaçamento subtil do cabeçalho (mt-6).
    const containerClasses = configBanner.largura === 'full' 
        ? "w-full h-[55vh] md:h-[65vh] relative overflow-hidden mb-12" // mb-12 dá o espaçamento para os complementos abaixo
        : "w-full max-w-7xl mx-auto px-4 mt-6 h-[40vh] md:h-[60vh] relative overflow-hidden rounded-2xl shadow-sm mb-12";

    return (
        <div className={containerClasses}>
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <Link to={slidesAtuais[currentIndex].link} className="block w-full h-full cursor-pointer" aria-label={`Banner Promocional ${currentIndex + 1}`}>
                        <img 
                            src={slidesAtuais[currentIndex].url} 
                            alt={`Campanha Promocional ${currentIndex + 1}`} 
                            className="w-full h-full object-cover"
                            // Técnica de SEO e Performance: A primeira imagem carrega logo (eager), as restantes esperam (lazy)
                            loading={currentIndex === 0 ? "eager" : "lazy"} 
                        />
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Ocultámos as setas conforme o seu pedido, mantendo apenas os indicadores discretos se for carrossel */}
            {deveAnimar && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                    {slidesAtuais.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                            aria-label={`Mudar para o banner ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroBanner;