// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Configuracoes/ConfiguracoesPrincipal.jsx
// ARQUITETURA: Configurações de Pagamento (Single-Active), Frete e Loja
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../Services/api';
import './Configuracoes.css';

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

const ConfiguracoesPrincipal = () => {
    const [abaAtiva, setAbaAtiva] = useState('pagamentos'); 
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- PAGAMENTOS ---
    const [gatewayAtivo, setGatewayAtivo] = useState('mercadopago'); 
    const [gatewayConfigurando, setGatewayConfigurando] = useState(null); 
    const [credenciaisTemporarias, setCredenciaisTemporarias] = useState({ public_key: '', access_token: '' });
    
    // --- GATEWAYS DISPONÍVEIS ---
    const gateways = [
        { id: 'mercadopago', nome: 'Mercado Pago', cor: 'mercadopago', logoText: 'MP' },
        { id: 'pagarme', nome: 'Pagar.me', cor: 'pagarme', logoText: 'P.M' },
        { id: 'stripe', nome: 'Stripe', cor: 'stripe', logoText: 'ST' },
        { id: 'infinity', nome: 'Infinity Pay', cor: 'infinity', logoText: 'INF' },
    ];

    // --- LOGÍSTICA ---
    const [configFrete, setConfigFrete] = useState({
        token: '', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'SP'
    });

    // --- LOJA ---
    const [configLoja, setConfigLoja] = useState({
        razao_social: '', cnpj: '', email: '', telefone: ''
    });

    // --- LOAD DATA ---
    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                // Pagamentos
                const resPay = await api.get('/admin/settings/payment');
                if (resPay.data?.active_gateway) {
                    setGatewayAtivo(resPay.data.active_gateway);
                }

                // Logística
                const resShip = await api.get('/admin/settings/shipping');
                if (resShip.data?.melhorenvio) {
                    setConfigFrete(resShip.data.melhorenvio);
                }

                // Loja
                const resStore = await api.get('/admin/settings/store');
                if (resStore.data?.info) {
                    setConfigLoja(resStore.data.info);
                }
            } catch (error) {
                console.error("Erro ao carregar configurações:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // --- HANDLERS ---
    const abrirConfigGateway = async (gateway) => {
        setGatewayConfigurando(gateway);
        setCredenciaisTemporarias({ public_key: '', access_token: '' });
        
        try {
            const res = await api.get('/admin/settings/payment');
            if (res.data?.[gateway.id]) {
                setCredenciaisTemporarias(res.data[gateway.id]);
            }
        } catch (error) {
            console.error("Erro ao buscar chaves", error);
        }
    };

    const SincronizarEAtivarGateway = async () => {
        setIsSaving(true);
        try {
            // Salva credenciais do gateway
            await api.post('/admin/settings', {
                group: 'payment',
                key: gatewayConfigurando.id,
                value: credenciaisTemporarias
            });

            // Ativa o gateway
            await api.post('/admin/settings', {
                group: 'payment',
                key: 'active_gateway',
                value: gatewayConfigurando.id
            });

            setGatewayAtivo(gatewayConfigurando.id);
            alert(`${gatewayConfigurando.nome} sincronizado e ativado com sucesso!`);
            setGatewayConfigurando(null);
        } catch (error) {
            alert('Erro ao salvar as configurações.');
        } finally {
            setIsSaving(false);
        }
    };

    const salvarConfiguracoesGerais = async () => {
        setIsSaving(true);
        try {
            if (abaAtiva === 'frete') {
                await api.post('/admin/settings', {
                    group: 'shipping', key: 'melhorenvio', value: configFrete
                });
            } else if (abaAtiva === 'loja') {
                await api.post('/admin/settings', {
                    group: 'store', key: 'info', value: configLoja
                });
            }
            alert("Configurações atualizadas com sucesso!");
        } catch (error) {
            alert("Erro ao salvar.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center text-gray-500"><Icons.Spinner /></div>;
    }

    return (
        <div className="configuracoes-container">
            <Helmet><title>Configurações | HUB ADMIN</title></Helmet>

            <div className="configuracoes-header">
                <div>
                    <h1 className="configuracoes-title">Configurações Gerais</h1>
                    <p className="configuracoes-subtitle">Gira os pagamentos, integrações logísticas e dados da loja.</p>
                </div>
                {abaAtiva !== 'pagamentos' && (
                    <button onClick={salvarConfiguracoesGerais} disabled={isSaving} className="btn-save-primary">
                        {isSaving ? <><Icons.Spinner /> Guardar...</> : <><Icons.Save /> Guardar Alterações</>}
                    </button>
                )}
            </div>

            <div className="config-tabs">
                <button onClick={() => setAbaAtiva('pagamentos')} className={`config-tab-btn ${abaAtiva === 'pagamentos' ? 'active tab-pagamentos' : ''}`}>
                    <Icons.CreditCard /> Pagamentos
                    {abaAtiva === 'pagamentos' && <motion.div layoutId="aba-config" className="config-tab-indicator" />}
                </button>
                <button onClick={() => setAbaAtiva('frete')} className={`config-tab-btn ${abaAtiva === 'frete' ? 'active tab-frete' : ''}`}>
                    <Icons.Truck /> Logística & Frete
                    {abaAtiva === 'frete' && <motion.div layoutId="aba-config" className="config-tab-indicator" />}
                </button>
                <button onClick={() => setAbaAtiva('loja')} className={`config-tab-btn ${abaAtiva === 'loja' ? 'active tab-loja' : ''}`}>
                    <Icons.Store /> Dados da Empresa
                    {abaAtiva === 'loja' && <motion.div layoutId="aba-config" className="config-tab-indicator" />}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {abaAtiva === 'pagamentos' && (
                    <motion.div key="pagamentos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="config-content-section">
                        
                        <div className="payment-alert">
                            <div className="payment-alert-icon"><Icons.CheckCircle /></div>
                            <div>
                                <h3 className="payment-alert-title">Regra de Checkout Transparente</h3>
                                <p className="payment-alert-desc">Apenas <strong>um gateway pode estar ativo</strong> em simultâneo. Ao ativar um novo, o anterior será desligado e o Checkout irá renderizar via API Transparente.</p>
                            </div>
                        </div>

                        <div className="gateways-grid">
                            {gateways.map((gw) => {
                                const isAtivo = gatewayAtivo === gw.id;
                                return (
                                    <div key={gw.id} className={`gateway-card ${isAtivo ? 'active' : ''}`}>
                                        <div className={`gateway-logo ${gw.cor}`}>
                                            {gw.logoText}
                                        </div>
                                        <h4 className="gateway-name">{gw.nome}</h4>
                                        
                                        <div className="gateway-status-wrapper">
                                            {isAtivo ? (
                                                <span className="gateway-status-active">
                                                    <span className="dot"></span> Processando Vendas
                                                </span>
                                            ) : (
                                                <span className="gateway-status-inactive">Inativo</span>
                                            )}
                                        </div>

                                        <button onClick={() => abrirConfigGateway(gw)} className={`gateway-btn ${isAtivo ? 'secondary' : 'primary'}`}>
                                            {isAtivo ? 'Atualizar Chaves' : 'Sincronizar'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {abaAtiva === 'frete' && (
                    <motion.div key="frete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="config-content-section">
                        <div className="config-block">
                            <div className="config-block-header">
                                <div className="config-block-icon"><Icons.Truck /></div>
                                <div>
                                    <h3 className="config-block-title">Integração Melhor Envio</h3>
                                    <p className="config-block-desc">Sincronize a sua conta para cálculo automático de frete.</p>
                                </div>
                            </div>
                            
                            <div className="config-form-group">
                                <label className="config-label">Bearer Token de Acesso (API Key) *</label>
                                <input type="password" value={configFrete.token} onChange={(e) => setConfigFrete({...configFrete, token: e.target.value})} placeholder="Cole aqui o token gerado no painel do Melhor Envio" className="config-input mono" />
                                <p className="config-help-text">Nunca partilhe este token com terceiros. Ele garante acesso à sua carteira de envios.</p>
                            </div>
                        </div>

                        <div className="config-block">
                            <h3 className="config-block-title mb-6" style={{marginBottom: '24px'}}>Endereço de Origem (Remetente)</h3>
                            <div className="address-grid">
                                <div>
                                    <label className="config-label">CEP de Origem *</label>
                                    <input type="text" value={configFrete.cep} onChange={(e) => setConfigFrete({...configFrete, cep: e.target.value})} placeholder="00000-000" className="config-input" />
                                </div>
                                <div className="col-span-2">
                                    <label className="config-label">Rua / Logradouro *</label>
                                    <input type="text" value={configFrete.rua} onChange={(e) => setConfigFrete({...configFrete, rua: e.target.value})} className="config-input" />
                                </div>
                                <div>
                                    <label className="config-label">Número *</label>
                                    <input type="text" value={configFrete.numero} onChange={(e) => setConfigFrete({...configFrete, numero: e.target.value})} className="config-input" />
                                </div>
                                <div className="col-span-2">
                                    <label className="config-label">Complemento</label>
                                    <input type="text" value={configFrete.complemento} onChange={(e) => setConfigFrete({...configFrete, complemento: e.target.value})} placeholder="Armazém, Galpão, etc." className="config-input" />
                                </div>
                                <div>
                                    <label className="config-label">Bairro *</label>
                                    <input type="text" value={configFrete.bairro} onChange={(e) => setConfigFrete({...configFrete, bairro: e.target.value})} className="config-input" />
                                </div>
                                <div>
                                    <label className="config-label">Cidade *</label>
                                    <input type="text" value={configFrete.cidade} onChange={(e) => setConfigFrete({...configFrete, cidade: e.target.value})} className="config-input" />
                                </div>
                                <div>
                                    <label className="config-label">Estado (UF) *</label>
                                    <select value={configFrete.estado} onChange={(e) => setConfigFrete({...configFrete, estado: e.target.value})} className="config-select">
                                        <option value="SP">São Paulo</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="MG">Minas Gerais</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {abaAtiva === 'loja' && (
                    <motion.div key="loja" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="config-content-section config-block">
                         <h3 className="config-block-title" style={{marginBottom: '24px'}}>Informações Públicas da Empresa</h3>
                         <div className="store-grid">
                            <div>
                                <label className="config-label">Razão Social / Nome da Loja</label>
                                <input type="text" value={configLoja.razao_social} onChange={(e) => setConfigLoja({...configLoja, razao_social: e.target.value})} placeholder="HUB Commerce Ltda" className="config-input purple" />
                            </div>
                            <div>
                                <label className="config-label">CNPJ / NIF</label>
                                <input type="text" value={configLoja.cnpj} onChange={(e) => setConfigLoja({...configLoja, cnpj: e.target.value})} placeholder="00.000.000/0001-00" className="config-input purple" />
                            </div>
                            <div>
                                <label className="config-label">E-mail de Suporte</label>
                                <input type="email" value={configLoja.email} onChange={(e) => setConfigLoja({...configLoja, email: e.target.value})} placeholder="contato@loja.com" className="config-input purple" />
                            </div>
                            <div>
                                <label className="config-label">Telefone / WhatsApp</label>
                                <input type="tel" value={configLoja.telefone} onChange={(e) => setConfigLoja({...configLoja, telefone: e.target.value})} placeholder="(11) 99999-9999" className="config-input purple" />
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {gatewayConfigurando && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGatewayConfigurando(null)} className="drawer-overlay" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="drawer-panel">
                            
                            <div className="drawer-header">
                                <div className="drawer-header-info">
                                    <div className={`drawer-gateway-logo ${gatewayConfigurando.cor}`}>
                                        {gatewayConfigurando.logoText}
                                    </div>
                                    <div>
                                        <h2 className="drawer-gateway-name">{gatewayConfigurando.nome}</h2>
                                        <p className="drawer-gateway-subtitle">Sincronização de API</p>
                                    </div>
                                </div>
                                <button onClick={() => setGatewayConfigurando(null)} aria-label="Fechar" className="drawer-close-btn">
                                    <Icons.Close />
                                </button>
                            </div>

                            <div className="drawer-body">
                                <div className="drawer-alert">
                                    <p>Ao sincronizar e ativar o <strong>{gatewayConfigurando.nome}</strong>, o gateway atualmente ativo será desligado. O checkout transparente será adaptado automaticamente.</p>
                                </div>
                                <div>
                                    <label className="config-label">Public Key (Chave Pública) *</label>
                                    <input type="text" value={credenciaisTemporarias.public_key} onChange={(e) => setCredenciaisTemporarias({...credenciaisTemporarias, public_key: e.target.value})} placeholder="Ex: APP_USR-..." className="config-input mono" />
                                </div>
                                <div>
                                    <label className="config-label">Access Token (Chave Privada) *</label>
                                    <input type="password" value={credenciaisTemporarias.access_token} onChange={(e) => setCredenciaisTemporarias({...credenciaisTemporarias, access_token: e.target.value})} placeholder="Ex: APP_USR-123456..." className="config-input mono" />
                                </div>
                            </div>

                            <div className="drawer-footer">
                                <button onClick={SincronizarEAtivarGateway} disabled={!credenciaisTemporarias.public_key || !credenciaisTemporarias.access_token || isSaving} className="btn-drawer-primary">
                                    {isSaving ? <><Icons.Spinner /> A Conectar...</> : 'Sincronizar e Ativar Gateway'}
                                </button>
                                <button onClick={() => setGatewayConfigurando(null)} className="btn-drawer-secondary">
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

export default ConfiguracoesPrincipal;
