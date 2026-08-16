// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/AdminConfig.jsx
// ARQUITETURA: Configurações de Pagamento (Single-Active) e Frete (Melhor Envio)
// ============================================================================

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// --- ÍCONES SVG ---
const Icons = {
    CreditCard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Truck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    Store: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    CheckCircle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Close: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Save: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    Spinner: () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
};

const AdminConfig = () => {
    // --- ESTADOS DO MÓDULO ---
    const [abaAtiva, setAbaAtiva] = useState('pagamentos'); // 'pagamentos', 'frete', 'loja'
    const [isSaving, setIsSaving] = useState(false);

    // --- ESTADOS DE PAGAMENTO (Single-Active) ---
    // Apenas um gateway pode estar ativo de cada vez
    const [gatewayAtivo, setGatewayAtivo] = useState('mercadopago'); 
    const [gatewayConfigurando, setGatewayConfigurando] = useState(null); // Qual gateway está aberto no Drawer
    const [credenciaisTemporarias, setCredenciaisTemporarias] = useState({ publicKey: '', accessToken: '' });

    const gateways = [
        { id: 'mercadopago', nome: 'Mercado Pago', cor: 'bg-blue-500', logoText: 'MP' },
        { id: 'pagarme', nome: 'Pagar.me', cor: 'bg-purple-600', logoText: 'P.M' },
        { id: 'stripe', nome: 'Stripe', cor: 'bg-indigo-500', logoText: 'ST' },
        { id: 'infinity', nome: 'Infinity Pay', cor: 'bg-slate-900', logoText: 'INF' },
    ];

    // --- ESTADOS DE FRETE (Melhor Envio) ---
    const [configFrete, setConfigFrete] = useState({
        token: 'eyJhbGciOiJIUzI1NiIsInR...',
        cep: '01001-000',
        rua: 'Praça da Sé',
        numero: '123',
        complemento: 'Sala 4',
        bairro: 'Sé',
        cidade: 'São Paulo',
        estado: 'SP'
    });

    // --- HANDLERS ---
    const abrirConfigGateway = (gateway) => {
        setCredenciaisTemporarias({ publicKey: '', accessToken: '' }); // Limpa o form
        setGatewayConfigurando(gateway);
    };

    const SincronizarEAtivarGateway = () => {
        setIsSaving(true);
        setTimeout(() => {
            setGatewayAtivo(gatewayConfigurando.id);
            setGatewayConfigurando(null);
            setIsSaving(false);
            alert(`Sincronizado! ${gatewayConfigurando.nome} é agora o seu gateway principal.`);
        }, 1200); // Efeito de sincronização
    };

    const salvarConfiguracoesGerais = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Configurações atualizadas e sincronizadas com sucesso!");
        }, 1000);
    };

    return (
        <div className="w-full">
            <Helmet><title>Configurações Gerais | HUB ADMIN</title></Helmet>

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Configurações Gerais</h1>
                    <p className="text-gray-500 text-sm mt-1">Gira os pagamentos, integrações logísticas e dados da loja.</p>
                </div>
                {abaAtiva !== 'pagamentos' && (
                    <button 
                        onClick={salvarConfiguracoesGerais} 
                        disabled={isSaving}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-70"
                    >
                        {isSaving ? <><Icons.Spinner /> Guardar...</> : <><Icons.Save /> Guardar Alterações</>}
                    </button>
                )}
            </div>

            {/* SELETOR DE ABAS */}
            <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                <button onClick={() => setAbaAtiva('pagamentos')} className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 whitespace-nowrap ${abaAtiva === 'pagamentos' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-900'}`}>
                    <Icons.CreditCard /> Pagamentos
                    {abaAtiva === 'pagamentos' && <motion.div layoutId="aba-config" className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-t-full" />}
                </button>
                <button onClick={() => setAbaAtiva('frete')} className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 whitespace-nowrap ${abaAtiva === 'frete' ? 'text-sky-600' : 'text-gray-400 hover:text-gray-900'}`}>
                    <Icons.Truck /> Logística & Frete
                    {abaAtiva === 'frete' && <motion.div layoutId="aba-config" className="absolute bottom-0 left-0 right-0 h-[3px] bg-sky-500 rounded-t-full" />}
                </button>
                <button onClick={() => setAbaAtiva('loja')} className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 whitespace-nowrap ${abaAtiva === 'loja' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-900'}`}>
                    <Icons.Store /> Dados da Empresa
                    {abaAtiva === 'loja' && <motion.div layoutId="aba-config" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-500 rounded-t-full" />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {/* ========================================================= */}
                {/* ABA 1: GATEWAYS DE PAGAMENTO                              */}
                {/* ========================================================= */}
                {abaAtiva === 'pagamentos' && (
                    <motion.div key="pagamentos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        
                        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0"><Icons.CheckCircle /></div>
                            <div>
                                <h3 className="font-bold text-emerald-900 text-sm">Regra de Checkout Transparente</h3>
                                <p className="text-xs text-emerald-800 mt-1">Por questões de segurança e integridade do checkout, apenas <strong>um gateway pode estar ativo</strong> em simultâneo. Ao ativar um novo, o anterior será automaticamente desligado.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {gateways.map((gw) => {
                                const isAtivo = gatewayAtivo === gw.id;
                                return (
                                    <div key={gw.id} className={`bg-white border-2 rounded-[20px] p-6 transition-all flex flex-col items-center text-center ${isAtivo ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-gray-100 hover:border-sky-300'}`}>
                                        <div className={`w-16 h-16 rounded-2xl ${gw.cor} text-white font-black flex items-center justify-center text-xl shadow-sm mb-4`}>
                                            {gw.logoText}
                                        </div>
                                        <h4 className="font-black text-gray-900 text-lg mb-1">{gw.nome}</h4>
                                        
                                        <div className="h-6 mb-6">
                                            {isAtivo ? (
                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Processando Vendas
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inativo</span>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => abrirConfigGateway(gw)}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${isAtivo ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#0F172A] text-white hover:bg-slate-800 shadow-sm'}`}
                                        >
                                            {isAtivo ? 'Atualizar Chaves' : 'Sincronizar'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ========================================================= */}
                {/* ABA 2: LOGÍSTICA E FRETE (MELHOR ENVIO)                   */}
                {/* ========================================================= */}
                {abaAtiva === 'frete' && (
                    <motion.div key="frete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        
                        {/* Configuração da API */}
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><Icons.Truck /></div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Integração Melhor Envio</h3>
                                    <p className="text-xs text-gray-500">Sincronize a sua conta para cálculo automático de frete e geração de etiquetas.</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Bearer Token de Acesso (API Key) *</label>
                                <input 
                                    type="password" 
                                    value={configFrete.token} 
                                    onChange={(e) => setConfigFrete({...configFrete, token: e.target.value})}
                                    placeholder="Cole aqui o token gerado no painel do Melhor Envio" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none transition-all font-mono" 
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Nunca partilhe este token com terceiros. Ele garante acesso à sua carteira de envios.</p>
                            </div>
                        </div>

                        {/* Endereço do Remetente */}
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 mb-6">Endereço de Origem (Remetente)</h3>
                            <p className="text-xs text-gray-500 mb-6 -mt-4">Este endereço é utilizado pela API para calcular a distância e o valor do frete até ao cliente.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">CEP de Origem *</label>
                                    <input type="text" value={configFrete.cep} onChange={(e) => setConfigFrete({...configFrete, cep: e.target.value})} placeholder="00000-000" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Rua / Logradouro *</label>
                                    <input type="text" value={configFrete.rua} onChange={(e) => setConfigFrete({...configFrete, rua: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" />
                                </div>
                                
                                <div>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Número *</label>
                                    <input type="text" value={configFrete.numero} onChange={(e) => setConfigFrete({...configFrete, numero: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Complemento</label>
                                    <input type="text" value={configFrete.complemento} onChange={(e) => setConfigFrete({...configFrete, complemento: e.target.value})} placeholder="Armazém, Galpão, etc." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" />
                                </div>

                                <div>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Bairro *</label>
                                    <input type="text" value={configFrete.bairro} onChange={(e) => setConfigFrete({...configFrete, bairro: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Cidade *</label>
                                    <input type="text" value={configFrete.cidade} onChange={(e) => setConfigFrete({...configFrete, cidade: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Estado (UF) *</label>
                                    <select value={configFrete.estado} onChange={(e) => setConfigFrete({...configFrete, estado: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none cursor-pointer">
                                        <option value="SP">São Paulo</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="MG">Minas Gerais</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ========================================================= */}
                {/* ABA 3: DADOS DA LOJA (Opcional - Informações Rodapé)      */}
                {/* ========================================================= */}
                {abaAtiva === 'loja' && (
                    <motion.div key="loja" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-8 shadow-sm">
                         <h3 className="text-lg font-black text-gray-900 mb-6">Informações Públicas da Empresa</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Razão Social / Nome da Loja</label>
                                <input type="text" placeholder="HUB Commerce Ltda" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">CNPJ / NIF</label>
                                <input type="text" placeholder="00.000.000/0001-00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">E-mail de Suporte</label>
                                <input type="email" placeholder="contato@loja.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Telefone / WhatsApp</label>
                                <input type="tel" placeholder="(11) 99999-9999" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" />
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========================================================= */}
            {/* DRAWER LATERAL: CONFIGURAR GATEWAY SELECIONADO            */}
            {/* ========================================================= */}
            <AnimatePresence>
                {gatewayConfigurando && (
                    <>
                        {/* Overlay Escuro */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            onClick={() => setGatewayConfigurando(null)} 
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
                        />
                        
                        {/* Painel do Gateway */}
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-white shadow-2xl z-[70] flex flex-col border-l border-gray-100"
                        >
                            <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${gatewayConfigurando.cor} text-white flex items-center justify-center font-black text-sm`}>
                                        {gatewayConfigurando.logoText}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900">{gatewayConfigurando.nome}</h2>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Sincronização de API</p>
                                    </div>
                                </div>
                                <button onClick={() => setGatewayConfigurando(null)} aria-label="Fechar" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition-colors border border-gray-200">
                                    <Icons.Close />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
                                    <p className="text-xs text-sky-800 leading-relaxed font-medium">Ao sincronizar e ativar o <strong>{gatewayConfigurando.nome}</strong>, o gateway atualmente ativo será desligado. O checkout transparente será adaptado automaticamente.</p>
                                </div>

                                <div>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Public Key (Chave Pública) *</label>
                                    <input 
                                        type="text" 
                                        value={credenciaisTemporarias.publicKey}
                                        onChange={(e) => setCredenciaisTemporarias({...credenciaisTemporarias, publicKey: e.target.value})}
                                        placeholder="Ex: APP_USR-..." 
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none font-mono" 
                                    />
                                </div>

                                <div>
                                    <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Access Token (Chave Privada) *</label>
                                    <input 
                                        type="password" 
                                        value={credenciaisTemporarias.accessToken}
                                        onChange={(e) => setCredenciaisTemporarias({...credenciaisTemporarias, accessToken: e.target.value})}
                                        placeholder="Ex: APP_USR-123456..." 
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 outline-none font-mono" 
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white flex flex-col gap-3">
                                <button 
                                    onClick={SincronizarEAtivarGateway} 
                                    disabled={!credenciaisTemporarias.publicKey || !credenciaisTemporarias.accessToken || isSaving}
                                    className="w-full py-4 rounded-xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isSaving ? <><Icons.Spinner /> A Conectar...</> : 'Sincronizar e Ativar Gateway'}
                                </button>
                                <button onClick={() => setGatewayConfigurando(null)} className="w-full py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminConfig;