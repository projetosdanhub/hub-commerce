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
            className={`relative w-14 h-8 rounded-full flex items-center transition-colors duration-300 ${active ? 'bg-blue-600' : 'bg-slate-300'} focus:outline-none`}
            style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)" }}
        >
            <motion.div 
                initial={false}
                animate={{ 
                    x: active ? 26 : 2,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full bg-white shadow flex items-center justify-center`}
            >
                {active ? <div className="w-2 h-2 rounded-full bg-blue-500" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
            </motion.div>
        </button>
    );
};

const CustomTriggerSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selected = gatilhoOptions.find(opt => opt.value === value) || gatilhoOptions[0];
    const Icon = selected.icon;
    
    // Close on click outside (simplified for inline)
    return (
        <div className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-xl px-4 h-12 text-sm outline-none focus:border-blue-500 shadow-sm font-medium">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{selected.label}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto py-1">
                        {gatilhoOptions.map(opt => (
                            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${value === opt.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}>
                                <opt.icon className={`w-4 h-4 ${value === opt.value ? 'text-blue-500' : 'text-slate-400'}`} />
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const EditorDeRegra = ({ triggerForm, setTriggerForm, onSalvar, onVoltar, isSaving }) => {
    return (
        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.24 }} className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 max-w-5xl mx-auto">
            <button onClick={onVoltar} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar para a lista
            </button>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2">{triggerForm.id ? 'Editar Regra de Disparo' : 'Criar Regra de Disparo'}</h2>
            <p className="text-sm text-slate-500 mb-6">Defina nomes livres, determine a URL alvo da loja para validação do pixel e enriqueça com Payload.</p>

            {/* Tutorial Dinâmico / Dicionário */}
            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 mb-8">
                <h4 className="font-black text-sky-900 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Dicionário de Gatilhos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-sky-800 leading-relaxed">
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><MousePointerClick className="w-3 h-3"/> Click Elemento</strong> Dispara ao clicar. Ex: <code>.btn-compra</code> (classe) ou <code>#meu-botao</code> (ID).</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><Link className="w-3 h-3"/> Click Link</strong> Dispara ao clicar num link <code>&lt;a&gt;</code> específico.</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><Globe className="w-3 h-3"/> URL Alvo</strong> O alvo <code>*</code> ativa em todo o site. Específico Ex: <code>/carrinho</code>.</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><MoveDown className="w-3 h-3"/> Scroll Depth</strong> Dispara ao rolar a tela. Ex: <code>50</code> (%).</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><Timer className="w-3 h-3"/> Time Delay</strong> Dispara após retenção. Ex: <code>15</code> (s).</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><FormInput className="w-3 h-3"/> Envio Formulário</strong> Dispara ao submeter. Ex: <code>#form-lead</code>.</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><Eye className="w-3 h-3"/> Elemento Visível</strong> Dispara quando o elemento aparecer. Ex: <code>.banner-final</code>.</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><PlaySquare className="w-3 h-3"/> Vídeo Play</strong> Dispara ao interagir com vídeo embedado.</div>
                    <div><strong className="text-sky-900 block mb-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Erro JS</strong> Dispara se houver quebra no código (Console).</div>
                </div>
            </div>

            <form onSubmit={onSalvar} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Nome Interno</label>
                        <input type="text" value={triggerForm.nome} onChange={e => setTriggerForm({...triggerForm, nome: e.target.value})} required placeholder="Ex: Lead Botão Header" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-sm outline-none focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">Nome Oficial do Evento</label>
                        <div className="flex gap-2">
                            <select value={triggerForm.evento_selecionado} onChange={e => setTriggerForm({...triggerForm, evento_selecionado: e.target.value, evento_custom: e.target.value !== 'CUSTOM' ? '' : triggerForm.evento_custom})} className={`bg-slate-50 border border-slate-200 rounded-xl px-3 h-12 text-sm font-mono outline-none focus:border-blue-500 cursor-pointer transition-all shadow-sm ${triggerForm.evento_selecionado === 'CUSTOM' ? 'w-1/3' : 'w-full'}`}>
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
                                <input type="text" value={triggerForm.evento_custom} onChange={e => setTriggerForm({...triggerForm, evento_custom: e.target.value})} required placeholder="NomeLivre" className="w-2/3 bg-white border border-blue-300 rounded-xl px-4 h-12 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Regra do Gatilho */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500"/> Regra do Gatilho & Validação</h3>
                    
                    <div>
                        <label className="text-[12px] font-bold text-slate-700 mb-1 block flex items-center gap-1">
                            URL de Atuação Alvo <SafeTooltip text="Se vazio ou '*', funcionará em todo o site. Se colocar '/checkout', o gatilho só será disparado caso o cliente esteja nessa página. Exemplo de página inicial: /" title="Filtro de Rota" />
                        </label>
                        <input type="text" value={triggerForm.url_alvo} onChange={e => setTriggerForm({...triggerForm, url_alvo: e.target.value})} required placeholder="Ex: * (Todas as Páginas) ou /categoria/promo" className="w-full bg-white border border-slate-300 rounded-xl px-4 h-12 text-sm outline-none font-mono focus:border-blue-500 shadow-sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[12px] font-bold text-slate-700 mb-2 block">Quando a regra deve disparar?</label>
                            <CustomTriggerSelect value={triggerForm.tipo_gatilho} onChange={(val) => setTriggerForm({...triggerForm, tipo_gatilho: val, valor_gatilho: ['exit_intent', 'video_play', 'js_error'].includes(val) ? '' : triggerForm.valor_gatilho})} />
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-slate-700 mb-2 block">Condição exata a monitorar</label>
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
                                className={`w-full bg-white border border-slate-300 rounded-xl px-4 h-12 text-sm outline-none font-mono shadow-sm ${['exit_intent', 'video_play', 'js_error'].includes(triggerForm.tipo_gatilho) ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'focus:border-blue-500'}`} 
                            />
                        </div>
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 mb-1">Dicionário de Disparadores</h4>
                            <p className="text-xs text-blue-700/80 leading-relaxed">
                                <strong>{gatilhoOptions.find(o => o.value === triggerForm.tipo_gatilho)?.label}:</strong> {gatilhoDictionary[triggerForm.tipo_gatilho]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payload Builder Categorizado */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="mb-6 border-b border-slate-100 pb-4">
                        <h3 className="font-black text-slate-800 flex items-center gap-2"><Database className="w-5 h-5 text-blue-600"/> Enriquecimento de Dados (CAPI Payload Builder)</h3>
                        <p className="text-xs text-slate-500 mt-1">Selecione quais chaves o evento deve extrair do Data Layer e enviar ao Gerenciador de Eventos.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {payloadCategories.map((categoria, idx) => (
                            <div key={idx} className={`p-5 rounded-xl border ${categoria.bg} ${categoria.border}`}>
                                <h4 className={`font-bold text-sm flex items-center gap-1.5 mb-1 ${categoria.color}`}>
                                    <categoria.icon className="w-4 h-4" /> {categoria.title}
                                </h4>
                                <p className={`text-[10px] mb-4 opacity-70 ${categoria.color}`}>{categoria.desc}</p>
                                
                                <div className="space-y-3">
                                    {categoria.items.map(campo => (
                                        <label key={campo.key} className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${triggerForm.payload?.[campo.key] ? categoria.color : 'text-slate-600 hover:text-slate-900'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={triggerForm.payload?.[campo.key] || false} 
                                                onChange={e => setTriggerForm({...triggerForm, payload: {...triggerForm.payload, [campo.key]: e.target.checked}})} 
                                                className="w-4 h-4 rounded border-slate-300" 
                                                style={{ accentColor: 'currentColor' }}
                                            /> 
                                            {campo.label}
                                            <SafeTooltip text={campo.tip} title="Parâmetro Oficial" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer: Toggle + Ações */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                    <div className="flex items-center gap-4">
                        <CustomRecessedToggle active={triggerForm.status} onChange={(val) => setTriggerForm({...triggerForm, status: val})} />
                        <div>
                            <span className="text-sm text-slate-800 font-bold select-none block">Regra Ativa</span>
                            <span className="text-[11px] text-slate-500">Ativa/desativa o monitoramento na loja</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onVoltar} className="px-6 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                        <PremiumSaveButton loading={isSaving} text="Salvar Regra de Conversão" />
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default EditorDeRegra;
