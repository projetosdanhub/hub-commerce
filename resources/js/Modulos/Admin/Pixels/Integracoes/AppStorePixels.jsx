// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Integracoes/AppStorePixels.jsx
// Aba "Integrações" — Cards de providers (Meta, GA4, TikTok, Pinterest)
// ============================================================================
import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Activity, Zap, Check, AlertTriangle } from 'lucide-react';
import { tabTransition } from '../Compartilhado/ConstantesPixels';
import { SecureInput, SafeTooltip } from '../Compartilhado/ComponentesUIPixels';
import { PremiumSaveButton } from '../Compartilhado/ComponentesUIPixels';

const AppStorePixels = ({ credenciais, setCredenciais, isSaving, onSave }) => {
    return (
        <motion.div {...tabTransition}>
            <div className="hub-dashboard-header">
                <div>
                    <h2 className="hub-card-title">App Store & Tokens</h2>
                    <p className="hub-page-subtitle">Conecte a Loja às maiores redes de publicidade com segurança Server-Side.</p>
                </div>
                <PremiumSaveButton onClick={onSave} loading={isSaving} text="Salvar Todos os Tokens" />
            </div>

            <div className="hub-smart-grid" style={{ gap: '24px' }}>
                {/* Meta Pixel & CAPI */}
                <div className="hub-card hub-smart-grid-item" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--hub-border-subtle)', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--hub-surface-hover)' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#E7F3FF', color: '#1877F2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)' }}><Code2 style={{ width: '28px', height: '28px' }}/></div>
                        <div>
                            <h3 className="hub-card-title">Meta Pixel & CAPI</h3>
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {(credenciais.meta_pixel_id && credenciais.meta_access_token) ? 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '4px' }}><Check style={{ width: '12px', height: '12px' }}/> Conexão Ativa</span> : 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#e11d48', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ffe4e6', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle style={{ width: '12px', height: '12px' }}/> Requer Atenção</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>ID do Pixel (Browser)</label>
                            <SecureInput value={credenciais.meta_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, meta_pixel_id: v.replace(/\D/g, '')})} placeholder="Ex: 1029384756" isToken={false} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                Token CAPI (Servidor) 
                                <SafeTooltip text="Gere o token no Gerenciador de Eventos da Meta. Ele resolve perdas por AdBlock." title="Por que usar CAPI?"/>
                            </label>
                            <SecureInput value={credenciais.meta_access_token || ''} onChange={(v) => setCredenciais({...credenciais, meta_access_token: v})} placeholder="EAAI..." />
                        </div>
                    </div>
                </div>

                {/* Google Analytics 4 */}
                <div className="hub-card hub-smart-grid-item" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--hub-border-subtle)', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--hub-surface-hover)' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#FFF3E0', color: '#F57C00', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)' }}><Activity style={{ width: '28px', height: '28px' }}/></div>
                        <div>
                            <h3 className="hub-card-title">Google Analytics 4</h3>
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {credenciais.ga4_measurement_id ? 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '4px' }}><Check style={{ width: '12px', height: '12px' }}/> Conexão Ativa</span> : 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#e11d48', backgroundColor: '#fff1f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ffe4e6', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle style={{ width: '12px', height: '12px' }}/> Requer Atenção</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Measurement ID</label>
                            <SecureInput value={credenciais.ga4_measurement_id || ''} onChange={(v) => setCredenciais({...credenciais, ga4_measurement_id: v.toUpperCase()})} placeholder="G-XXXXXXXXXX" isToken={false} />
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', backgroundColor: '#fff7ed', padding: '16px', borderRadius: '12px', border: '1px solid #ffedd5', lineHeight: '1.5' }}>A HUB mapeia automaticamente o objeto <code>items[]</code> para e-commerce no padrão oficial do GA4.</p>
                    </div>
                </div>

                {/* TikTok For Business */}
                <div className="hub-card hub-smart-grid-item" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--hub-border-subtle)', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--hub-surface-hover)' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)' }}><Zap style={{ width: '28px', height: '28px' }}/></div>
                        <div>
                            <h3 className="hub-card-title">TikTok For Business</h3>
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {credenciais.tiktok_pixel_id ? 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '4px' }}><Check style={{ width: '12px', height: '12px' }}/> Conexão Ativa</span> : 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', backgroundColor: 'var(--hub-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--hub-border-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>Configuração Básica</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Pixel ID</label>
                            <SecureInput value={credenciais.tiktok_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, tiktok_pixel_id: v})} placeholder="Cole o código identificador..." isToken={false} />
                        </div>
                    </div>
                </div>

                {/* Pinterest API */}
                <div className="hub-card hub-smart-grid-item" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--hub-border-subtle)', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--hub-surface-hover)' }}>
                        <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)' }}>
                            <svg style={{ width: '28px', height: '28px', fill: 'currentColor' }} viewBox="0 0 24 24"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.63-.13-1.6.03-2.26.14-.6.92-3.86.92-3.86s-.24-.46-.24-1.15c0-1.08.63-1.89 1.4-1.89.66 0 1 .5 1 1.07 0 .66-.42 1.66-.64 2.58-.18.77.4 1.4 1.15 1.4 1.38 0 2.44-1.46 2.44-3.56 0-1.85-1.33-3.14-3.4-3.14-2.4 0-3.8 1.8-3.8 3.65 0 .66.25 1.37.57 1.76.06.07.07.14.05.22l-.19.78c-.03.1-.1.13-.2.08-1.42-.66-2.31-2.73-2.31-4.4 0-3.58 2.6-6.87 7.5-6.87 3.94 0 7 2.8 7 6.54 0 3.92-2.47 7.07-5.9 7.07-1.15 0-2.23-.6-2.6-1.3l-.7 2.68c-.26 1-.7 2.26-1.05 3.03A12 12 0 1 0 12 0z"/></svg>
                        </div>
                        <div>
                            <h3 className="hub-card-title">Pinterest API</h3>
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {(credenciais.pinterest_pixel_id && credenciais.pinterest_access_token) ? 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '4px' }}><Check style={{ width: '12px', height: '12px' }}/> Conexão Ativa</span> : 
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', backgroundColor: 'var(--hub-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--hub-border-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>Configuração Básica</span>
                                }
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Ad Account / Pixel ID</label>
                            <SecureInput value={credenciais.pinterest_pixel_id || ''} onChange={(v) => setCredenciais({...credenciais, pinterest_pixel_id: v.replace(/\D/g, '')})} placeholder="Ex: 26123456789" isToken={false} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--hub-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Access Token (Server)</label>
                            <SecureInput value={credenciais.pinterest_access_token || ''} onChange={(v) => setCredenciais({...credenciais, pinterest_access_token: v})} placeholder="Cole o token de conversão..." />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AppStorePixels;
