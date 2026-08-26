// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Acionadores/EditorDeRegra.jsx
// Formulário de criação/edição de regras de disparo + Payload Builder
// ============================================================================
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Zap, Database, MousePointerClick, Link, Globe, MoveDown, Timer, FormInput, Eye, LogOut, AlertCircle, PlaySquare, ChevronDown } from 'lucide-react';
import { payloadCategories } from '../Compartilhado/ConstantesPixels';
import { NeumorphicToggle, SafeTooltip, PremiumSaveButton } from '../Compartilhado/ComponentesUIPixels';

const gatilhoOptions = [
    { value: 'url_exact', label: 'URL Exatamente Igual', icon: Globe },
    { value: 'url_contains', label: 'URL Contém (Ex: /produto/)', icon: Globe },
    { value: 'url_starts_with', label: 'URL Começa Com', icon: Globe },
    { value: 'url_ends_with', label: 'URL Termina Com', icon: Globe },
    { value: 'url_regex', label: 'Expressão Regular (Regex)', icon: Globe },
    { value: 'click', label: 'Ao clicar num Elemento HTML (Classe/ID)', icon: MousePointerClick },
    { value: 'click_link', label: 'Ao clicar em um Link Específico', icon: Link },
    { value: 'scroll', label: 'Ao rolar a página (Porcentagem %)', icon: MoveDown },
    { value: 'time', label: 'Tempo na página (Segundos)', icon: Timer },
    { value: 'form_submit', label: 'Envio de Formulário', icon: FormInput },
    { value: 'element_visibility', label: 'Elemento Visível na Tela', icon: Eye },
    { value: 'video_play', label: 'Ao interagir com Vídeo (Youtube/Vimeo)', icon: PlaySquare },
    { value: 'js_error', label: 'Ao ocorrer um Erro JavaScript', icon: AlertCircle },
    { value: 'exit_intent', label: 'Intenção de Saída (Mouse fora da tela)', icon: LogOut },
    { value: 'custom_event', label: 'Evento DataLayer Customizado', icon: Zap },
];

const gatilhoDictionary = {
    'url_exact': 'Dispara apenas quando a URL atual for perfeitamente idêntica à digitada.',
    'url_contains': 'Dispara sempre que a URL atual contiver o texto digitado (Ex: /checkout).',
    'url_starts_with': 'Dispara quando a URL atual iniciar com o texto digitado.',
    'url_ends_with': 'Dispara quando a URL atual terminar com o texto digitado.',
    'url_regex': 'Avançado: Dispara quando a URL atual bater com a expressão regular.',
    'click': 'Monitora cliques em botões, divs ou qualquer tag HTML através do seu ID ou Classe.',
    'click_link': 'Monitora cliques exclusivamente em links (tags <a>) que direcionem para o destino especificado.',
    'scroll': 'Dispara assim que o usuário rolar a barra de rolagem até X% da página.',
    'time': 'Dispara após o usuário permanecer na página atual pelo tempo especificado.',
    'form_submit': 'Dispara quando o formulário especificado (ID ou Classe) for enviado com sucesso.',
    'element_visibility': 'Dispara assim que o elemento especificado aparecer na tela do usuário.',
    'video_play': 'Dispara automaticamente quando o usuário der play em vídeos incorporados.',
    'js_error': 'Captura e dispara caso ocorra um erro de Javascript no console do navegador do usuário.',
    'exit_intent': 'Dispara quando o mouse do usuário sai da área principal da tela (sugerindo que vai fechar a aba).',
    'custom_event': 'Dispara a partir de um evento manual enviado via código (ex: dataLayer.push).',
};

const CustomRecessedToggle = ({ active, onChange }) => {
    return (
        <button 
            type="button" 
            onClick={() => onChange(!active)} 
            style={{ 
                position: 'relative', 
                width: '56px', 
                height: '32px', 
                borderRadius: '9999px', 
                display: 'flex', 
                alignItems: 'center', 
                transition: 'background-color 0.3s', 
                backgroundColor: active ? 'var(--hub-accent)' : 'var(--hub-border)', 
                outline: 'none',
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",
                border: 'none',
                cursor: 'pointer'
            }}
        >
            <motion.div 
                initial={false}
                animate={{ x: active ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: '#fff', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}
            >
                {active ? (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--hub-accent)' }} />
                ) : (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--hub-border)' }} />
                )}
            </motion.div>
        </button>
    );
};

const CustomTriggerSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selected = gatilhoOptions.find(opt => opt.value === value) || gatilhoOptions[0];
    const Icon = selected.icon;
    
    return (
        <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} style={{ 
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                backgroundColor: 'var(--hub-background)', border: '1px solid var(--hub-border)', 
                borderRadius: '12px', padding: '0 16px', height: '48px', fontSize: '14px', 
                outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: 500,
                cursor: 'pointer'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} style={{ color: 'var(--hub-text-secondary)' }} />
                    <span style={{ color: 'var(--hub-text-primary)' }}>{selected.label}</span>
                </div>
                <ChevronDown size={16} style={{ color: 'var(--hub-text-secondary)' }} />
            </button>
            {isOpen && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setIsOpen(false)}></div>
                    <div style={{ 
                        position: 'absolute', zIndex: 20, width: '100%', marginTop: '4px', 
                        backgroundColor: 'var(--hub-background)', border: '1px solid var(--hub-border-subtle)', 
                        borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                        maxHeight: '256px', overflowY: 'auto', padding: '4px 0' 
                    }}>
                        {gatilhoOptions.map(opt => (
                            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false); }} style={{ 
                                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', 
                                padding: '10px 16px', fontSize: '14px', transition: 'background-color 0.2s', 
                                backgroundColor: value === opt.value ? '#eff6ff' : 'transparent', 
                                color: value === opt.value ? '#1d4ed8' : 'var(--hub-text-secondary)', 
                                fontWeight: value === opt.value ? 'bold' : 'normal', 
                                border: 'none', cursor: 'pointer', textAlign: 'left' 
                            }}>
                                <opt.icon size={16} style={{ color: value === opt.value ? '#3b82f6' : 'var(--hub-text-secondary)' }} />
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const mapTailwindColor = (twClass) => {
    if (twClass.includes('indigo')) return { bg: '#eef2ff', border: '#e0e7ff', text: '#4f46e5' };
    if (twClass.includes('emerald')) return { bg: '#ecfdf5', border: '#d1fae5', text: '#059669' };
    if (twClass.includes('orange')) return { bg: '#fff7ed', border: '#ffedd5', text: '#ea580c' };
    return { bg: '#f8fafc', border: '#f1f5f9', text: '#475569' };
};

const EditorDeRegra = ({ triggerForm, setTriggerForm, onSalvar, onVoltar, isSaving }) => {
    return (
        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.24 }} className="hub-card" style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px' }}>
            <button onClick={onVoltar} style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', 
                fontWeight: 'bold', color: 'var(--hub-text-secondary)', marginBottom: '24px', 
                background: 'transparent', border: 'none', cursor: 'pointer' 
            }}>
                <ArrowLeft size={16} /> Voltar para a lista
            </button>
            
            <h2 className="hub-card-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
                {triggerForm.id ? 'Editar Regra de Disparo' : 'Criar Regra de Disparo'}
            </h2>
            <p className="hub-page-subtitle" style={{ marginBottom: '24px' }}>
                Defina nomes livres, determine a URL alvo da loja para validação do pixel e enriqueça com Payload.
            </p>

            {/* Tutorial Dinâmico / Dicionário */}
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '16px', padding: '20px', marginBottom: '32px' }}>
                <h4 style={{ fontWeight: 900, color: '#0c4a6e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16}/> Dicionário de Gatilhos
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '12px', color: '#075985', lineHeight: '1.6' }}>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><MousePointerClick size={12}/> Click Elemento</strong> Dispara ao clicar. Ex: <code>.btn-compra</code> (classe) ou <code>#meu-botao</code> (ID).</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><Link size={12}/> Click Link</strong> Dispara ao clicar num link <code>&lt;a&gt;</code> específico.</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><Globe size={12}/> URL Alvo</strong> O alvo <code>*</code> ativa em todo o site. Específico Ex: <code>/carrinho</code>.</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><MoveDown size={12}/> Scroll Depth</strong> Dispara ao rolar a tela. Ex: <code>50</code> (%).</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><Timer size={12}/> Time Delay</strong> Dispara após retenção. Ex: <code>15</code> (s).</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><FormInput size={12}/> Envio Formulário</strong> Dispara ao submeter. Ex: <code>#form-lead</code>.</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><Eye size={12}/> Elemento Visível</strong> Dispara quando o elemento aparecer. Ex: <code>.banner-final</code>.</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><PlaySquare size={12}/> Vídeo Play</strong> Dispara ao interagir com vídeo embedado.</div>
                    <div><strong style={{ color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><AlertCircle size={12}/> Erro JS</strong> Dispara se houver quebra no código (Console).</div>
                </div>
            </div>

            <form onSubmit={onSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="hub-smart-grid" style={{ gap: '24px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)', marginBottom: '8px', display: 'block' }}>Nome Interno</label>
                        <input type="text" value={triggerForm.nome} onChange={e => setTriggerForm({...triggerForm, nome: e.target.value})} required placeholder="Ex: Lead Botão Header" 
                            style={{ width: '100%', backgroundColor: 'var(--hub-surface)', border: '1px solid var(--hub-border)', borderRadius: '12px', padding: '0 16px', height: '48px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)', marginBottom: '8px', display: 'block' }}>Nome Oficial do Evento</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select value={triggerForm.evento_selecionado} onChange={e => setTriggerForm({...triggerForm, evento_selecionado: e.target.value, evento_custom: e.target.value !== 'CUSTOM' ? '' : triggerForm.evento_custom})} 
                                style={{ backgroundColor: 'var(--hub-surface)', border: '1px solid var(--hub-border)', borderRadius: '12px', padding: '0 12px', height: '48px', fontSize: '14px', fontFamily: 'monospace', outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', width: triggerForm.evento_selecionado === 'CUSTOM' ? '33.33%' : '100%' }}>
                                <option value="PageView">PageView</option>
                                <option value="ViewContent">ViewContent</option>
                                <option value="Search">Search</option>
                                <option value="AddToWishlist">AddToWishlist</option>
                                <option value="AddToCart">AddToCart</option>
                                <option value="InitiateCheckout">InitiateCheckout</option>
                                <option value="AddPaymentInfo">AddPaymentInfo</option>
                                <option value="Purchase">Purchase</option>
                                <option value="Subscribe">Subscribe</option>
                                <option value="StartTrial">StartTrial</option>
                                <option value="CompleteRegistration">CompleteRegistration</option>
                                <option value="Contact">Contact</option>
                                <option value="FindLocation">FindLocation</option>
                                <option value="Schedule">Schedule</option>
                                <option value="CustomizeProduct">CustomizeProduct</option>
                                <option value="Donate">Donate</option>
                                <option value="SubmitApplication">SubmitApplication</option>
                                <option value="Lead">Lead</option>
                                <option disabled>──────────</option>
                                <option value="CUSTOM">Customizado...</option>
                            </select>
                            {triggerForm.evento_selecionado === 'CUSTOM' && (
                                <input type="text" value={triggerForm.evento_custom} onChange={e => setTriggerForm({...triggerForm, evento_custom: e.target.value})} required placeholder="NomeLivre" 
                                    style={{ width: '66.66%', backgroundColor: 'var(--hub-background)', border: '1px solid #93c5fd', borderRadius: '12px', padding: '0 16px', height: '48px', fontSize: '14px', fontFamily: 'monospace', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Regra do Gatilho */}
                <div style={{ padding: '24px', backgroundColor: 'var(--hub-surface)', border: '1px solid var(--hub-border-subtle)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <h3 style={{ fontWeight: 'bold', color: 'var(--hub-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} style={{ color: '#3b82f6' }}/> Regra do Gatilho & Validação
                    </h3>
                    
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            URL de Atuação Alvo <SafeTooltip text="Se vazio ou '*', funcionará em todo o site. Se colocar '/checkout', o gatilho só será disparado caso o cliente esteja nessa página. Exemplo de página inicial: /" title="Filtro de Rota" />
                        </label>
                        <input type="text" value={triggerForm.url_alvo} onChange={e => setTriggerForm({...triggerForm, url_alvo: e.target.value})} required placeholder="Ex: * (Todas as Páginas) ou /categoria/promo" 
                            style={{ width: '100%', backgroundColor: 'var(--hub-background)', border: '1px solid var(--hub-border)', borderRadius: '12px', padding: '0 16px', height: '48px', fontSize: '14px', outline: 'none', fontFamily: 'monospace', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} />
                    </div>

                    <div className="hub-smart-grid" style={{ gap: '24px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)', marginBottom: '8px', display: 'block' }}>Quando a regra deve disparar?</label>
                            <CustomTriggerSelect value={triggerForm.tipo_gatilho} onChange={(val) => setTriggerForm({...triggerForm, tipo_gatilho: val, valor_gatilho: ['exit_intent', 'video_play', 'js_error'].includes(val) ? '' : triggerForm.valor_gatilho})} />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--hub-text-primary)', marginBottom: '8px', display: 'block' }}>Condição exata a monitorar</label>
                            <input 
                                type={['scroll', 'time'].includes(triggerForm.tipo_gatilho) ? 'number' : 'text'} 
                                value={triggerForm.valor_gatilho} 
                                onChange={e => setTriggerForm({...triggerForm, valor_gatilho: e.target.value})} 
                                required={!['exit_intent', 'video_play', 'js_error'].includes(triggerForm.tipo_gatilho)} 
                                disabled={['exit_intent', 'video_play', 'js_error'].includes(triggerForm.tipo_gatilho)}
                                placeholder={
                                    triggerForm.tipo_gatilho === 'click' ? "Ex: .btn-whatsapp ou #meu-form" :
                                    triggerForm.tipo_gatilho === 'click_link' ? "Ex: https://wa.me/..." :
                                    triggerForm.tipo_gatilho === 'url_contains' ? "Ex: /agradecimento" :
                                    triggerForm.tipo_gatilho === 'url_exact' ? "Ex: https://loja.com/promo" :
                                    triggerForm.tipo_gatilho === 'url_starts_with' ? "Ex: /produtos/" :
                                    triggerForm.tipo_gatilho === 'url_ends_with' ? "Ex: /sucesso" :
                                    triggerForm.tipo_gatilho === 'url_regex' ? "Ex: ^/promo-.*" :
                                    triggerForm.tipo_gatilho === 'scroll' ? "Ex: 50" : 
                                    triggerForm.tipo_gatilho === 'time' ? "Ex: 15" :
                                    triggerForm.tipo_gatilho === 'form_submit' ? "Ex: #meu-formulario" :
                                    triggerForm.tipo_gatilho === 'element_visibility' ? "Ex: .banner-final" :
                                    triggerForm.tipo_gatilho === 'custom_event' ? "Ex: view_promotion" :
                                    "Não aplicável para este gatilho"
                                } 
                                style={{ 
                                    width: '100%', 
                                    backgroundColor: ['exit_intent', 'video_play', 'js_error'].includes(triggerForm.tipo_gatilho) ? '#f1f5f9' : 'var(--hub-background)', 
                                    border: '1px solid var(--hub-border)', 
                                    borderRadius: '12px', 
                                    padding: '0 16px', 
                                    height: '48px', 
                                    fontSize: '14px', 
                                    outline: 'none', 
                                    fontFamily: 'monospace', 
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                                    opacity: ['exit_intent', 'video_play', 'js_error'].includes(triggerForm.tipo_gatilho) ? 0.5 : 1, 
                                    cursor: ['exit_intent', 'video_play', 'js_error'].includes(triggerForm.tipo_gatilho) ? 'not-allowed' : 'text' 
                                }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #dbeafe', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <BookOpen size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '4px' }}>Dicionário de Disparadores</h4>
                            <p style={{ fontSize: '12px', color: '#1d4ed8', opacity: 0.8, lineHeight: 1.6 }}>
                                <strong>{gatilhoOptions.find(o => o.value === triggerForm.tipo_gatilho)?.label}:</strong> {gatilhoDictionary[triggerForm.tipo_gatilho]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payload Builder Categorizado */}
                <div className="hub-card" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--hub-border-subtle)', paddingBottom: '16px' }}>
                        <h3 className="hub-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Database size={20} style={{ color: '#2563eb' }}/> Enriquecimento de Dados (CAPI Payload Builder)
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--hub-text-secondary)', marginTop: '4px' }}>Selecione quais chaves o evento deve extrair do Data Layer e enviar ao Gerenciador de Eventos.</p>
                    </div>
                    
                    <div className="hub-smart-grid" style={{ gap: '24px' }}>
                        {payloadCategories.map((categoria, idx) => {
                            const colors = mapTailwindColor(categoria.bg);
                            return (
                                <div key={idx} style={{ padding: '20px', borderRadius: '12px', backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                                    <h4 style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: colors.text }}>
                                        <categoria.icon size={16} /> {categoria.title}
                                    </h4>
                                    <p style={{ fontSize: '10px', marginBottom: '16px', opacity: 0.7, color: colors.text }}>{categoria.desc}</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {categoria.items.map(campo => (
                                            <label key={campo.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s', color: triggerForm.payload?.[campo.key] ? colors.text : 'var(--hub-text-secondary)' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={triggerForm.payload?.[campo.key] || false} 
                                                    onChange={e => setTriggerForm({...triggerForm, payload: {...triggerForm.payload, [campo.key]: e.target.checked}})} 
                                                    style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--hub-border)', accentColor: 'currentColor' }}
                                                /> 
                                                {campo.label}
                                                <SafeTooltip text={campo.tip} title="Parâmetro Oficial" />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer: Toggle + Ações */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--hub-border-subtle)', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <CustomRecessedToggle active={triggerForm.status} onChange={(val) => setTriggerForm({...triggerForm, status: val})} />
                        <div>
                            <span style={{ fontSize: '14px', color: 'var(--hub-text-primary)', fontWeight: 'bold', userSelect: 'none', display: 'block' }}>Regra Ativa</span>
                            <span style={{ fontSize: '11px', color: 'var(--hub-text-secondary)' }}>Ativa/desativa o monitoramento na loja</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onVoltar} className="hub-btn-secondary" style={{ padding: '0 24px', height: '48px', borderRadius: '12px' }}>Cancelar</button>
                        <PremiumSaveButton loading={isSaving} text="Salvar Regra de Conversão" />
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default EditorDeRegra;
