import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    // Estes dados (cores, links, visibilidade) virão do Painel Admin (Laravel) no futuro
    const footerConfig = {
        bgColor: 'bg-gray-900', // Configurável no painel
        textColor: 'text-gray-300',
        mostrarRedesSociais: true,
        linksUteis: [
            { nome: 'Políticas de Privacidade', url: '/privacidade' },
            { nome: 'Política de Frete', url: '/frete' },
            { nome: 'Reembolso e Devoluções', url: '/reembolso' },
            { nome: 'Suporte', url: '/suporte' }
        ],
        redesAtivas: ['instagram', 'facebook', 'whatsapp'] // Ex: se retirar 'facebook', ele some
    };

    return (
        <footer className={`${footerConfig.bgColor} ${footerConfig.textColor} py-12 mt-12`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Coluna 1: Sobre a Loja */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">HUB<span className="text-blue-500">Commerce</span></h3>
                        <p className="text-sm">
                            A sua loja virtual completa, segura e rápida. Encontre os melhores produtos com a melhor experiência de compra.
                        </p>
                    </div>

                    {/* Coluna 2: Links Úteis */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Links Úteis</h4>
                        <ul className="space-y-2">
                            {footerConfig.linksUteis.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.url} className="text-sm hover:text-blue-400 transition-colors">
                                        {link.nome}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Coluna 3: Redes Sociais */}
                    {footerConfig.mostrarRedesSociais && (
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-4">Siga-nos</h4>
                            <div className="flex space-x-4">
                                {footerConfig.redesAtivas.includes('instagram') && (
                                     <a href="#" className="hover:text-pink-500 transition-colors">Insta</a> // Substituiremos por ícones SVG reais depois
                                )}
                                {footerConfig.redesAtivas.includes('facebook') && (
                                     <a href="#" className="hover:text-blue-500 transition-colors">Face</a>
                                )}
                                {footerConfig.redesAtivas.includes('whatsapp') && (
                                     <a href="#" className="hover:text-green-500 transition-colors">Whats</a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-xs">
                    &copy; {new Date().getFullYear()} HUB Commerce. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
};

export default Footer;