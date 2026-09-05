import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, Info, Zap } from 'lucide-react';
import { Button } from '../../DesignSystem/primitives/Button';
import { Tooltip } from '../../DesignSystem/primitives/Tooltip';
import { payloadCategories } from '../Compartilhado/ConstantesPixels';

const TRIGGER_OPTIONS = [
  ['url_exact', 'URL exatamente igual'], ['url_contains', 'URL contém'], ['url_starts_with', 'URL começa com'], ['url_ends_with', 'URL termina com'], ['url_regex', 'Expressão regular'],
  ['click', 'Clique em elemento'], ['click_link', 'Clique em link'], ['scroll', 'Profundidade de rolagem'], ['time', 'Tempo na página'], ['form_submit', 'Envio de formulário'],
  ['element_visibility', 'Elemento visível'], ['video_play', 'Reprodução de vídeo'], ['js_error', 'Erro de JavaScript'], ['exit_intent', 'Intenção de saída'], ['custom_event', 'Evento customizado'],
];

const TRIGGER_HELP = {
  url_exact: 'Dispara somente na URL idêntica ao valor informado.',
  url_contains: 'Dispara quando a URL contém o texto informado.',
  url_starts_with: 'Dispara quando a URL inicia com o texto informado.',
  url_ends_with: 'Dispara quando a URL termina com o texto informado.',
  url_regex: 'Dispara quando a URL atende à expressão regular informada.',
  click: 'Use um seletor CSS, como .botao-comprar ou #formulario.',
  click_link: 'Use o destino ou seletor do link monitorado.',
  scroll: 'Informe a porcentagem de rolagem, por exemplo 50.',
  time: 'Informe o tempo em segundos.',
  form_submit: 'Use o seletor CSS do formulário.',
  element_visibility: 'Use o seletor CSS do elemento que deve ficar visível.',
  video_play: 'Dispara na interação com vídeo compatível.',
  js_error: 'Dispara quando o monitoramento detectar erro de JavaScript.',
  exit_intent: 'Dispara quando houver intenção de saída.',
  custom_event: 'Use o nome exato publicado pela sua camada de dados.',
};

const NO_VALUE_TRIGGER = new Set(['exit_intent', 'video_play', 'js_error']);
const conditionPlaceholder = (type) => ({
  click: '.btn-comprar ou #meu-form',
  click_link: 'https://exemplo.com/destino',
  url_contains: '/checkout',
  url_exact: 'https://sualoja.com/obrigado',
  url_starts_with: '/produtos/',
  url_ends_with: '/sucesso',
  url_regex: '^/campanha-.*',
  scroll: '50',
  time: '15',
  form_submit: '#form-lead',
  element_visibility: '.banner-final',
  custom_event: 'view_promotion',
}[type] || 'Não aplicável');

const Field = ({ label, children }) => <label className="hub-order-form-field"><span>{label}</span>{children}</label>;

const EditorDeRegra = ({ triggerForm, setTriggerForm, onSalvar, onVoltar, isSaving }) => {
  const update = (changes) => setTriggerForm((current) => ({ ...current, ...changes }));
  const payload = triggerForm.payload || {};
  const noValue = NO_VALUE_TRIGGER.has(triggerForm.tipo_gatilho);

  return <motion.section initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }} className="hub-surface space-y-6">
    <header className="hub-order-detail-heading">
      <div><p className="hub-page-eyebrow">Acionadores personalizados</p><h2 className="hub-page-title">{triggerForm.id ? 'Editar regra' : 'Nova regra'}</h2><p className="hub-page-description">Configure um disparo somente para uma conversão ou comportamento que sua loja realmente monitora.</p></div>
      <Button variant="ghost" icon={ArrowLeft} disabled={isSaving} onClick={onVoltar}>Voltar para lista</Button>
    </header>

    <form onSubmit={onSalvar} className="space-y-6">
      <section className="hub-smart-grid">
        <Field label="Nome interno *"><input required value={triggerForm.nome} onChange={(event) => update({ nome: event.target.value })} placeholder="Ex.: Lead do formulário principal" /></Field>
        <Field label="Evento do pixel *"><select value={triggerForm.evento_selecionado} onChange={(event) => update({ evento_selecionado: event.target.value, evento_custom: event.target.value === 'CUSTOM' ? triggerForm.evento_custom : '' })}><option value="PageView">PageView</option><option value="ViewContent">ViewContent</option><option value="Search">Search</option><option value="AddToWishlist">AddToWishlist</option><option value="AddToCart">AddToCart</option><option value="InitiateCheckout">InitiateCheckout</option><option value="AddPaymentInfo">AddPaymentInfo</option><option value="Purchase">Purchase</option><option value="Subscribe">Subscribe</option><option value="StartTrial">StartTrial</option><option value="CompleteRegistration">CompleteRegistration</option><option value="Contact">Contact</option><option value="Lead">Lead</option><option value="CUSTOM">Evento customizado</option></select></Field>
        {triggerForm.evento_selecionado === 'CUSTOM' ? <Field label="Nome do evento customizado *"><input required value={triggerForm.evento_custom} onChange={(event) => update({ evento_custom: event.target.value })} placeholder="Ex.: view_promotion" /></Field> : null}
      </section>

      <section className="hub-surface">
        <div className="hub-order-detail-heading"><div><h3 className="hub-card-title">Condição de disparo</h3><p className="hub-page-subtitle">Defina onde e quando a regra deve ser executada.</p></div><Tooltip content={TRIGGER_HELP[triggerForm.tipo_gatilho]}><span><Info aria-hidden="true" size={18} /></span></Tooltip></div>
        <div className="hub-smart-grid">
          <Field label="URL de atuação *"><input required value={triggerForm.url_alvo ?? ''} onChange={(event) => update({ url_alvo: event.target.value })} placeholder="* para toda a vitrine ou /checkout" /></Field>
          <Field label="Tipo de gatilho *"><select value={triggerForm.tipo_gatilho} onChange={(event) => update({ tipo_gatilho: event.target.value, valor_gatilho: NO_VALUE_TRIGGER.has(event.target.value) ? '' : triggerForm.valor_gatilho })}>{TRIGGER_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="Condição monitorada"><input required={!noValue} disabled={noValue} type={['scroll', 'time'].includes(triggerForm.tipo_gatilho) ? 'number' : 'text'} value={triggerForm.valor_gatilho} onChange={(event) => update({ valor_gatilho: event.target.value })} placeholder={conditionPlaceholder(triggerForm.tipo_gatilho)} /></Field>
        </div>
      </section>

      <section className="hub-surface">
        <div className="hub-order-detail-heading"><div><h3 className="hub-card-title"><Database aria-hidden="true" size={18} /> Parâmetros do payload</h3><p className="hub-page-subtitle">Selecione apenas chaves que a sua Data Layer fornece para este evento.</p></div></div>
        <div className="hub-smart-grid">
          {payloadCategories.map((category) => <fieldset key={category.title} className="hub-pixel-payload-category"><legend>{category.title}</legend><p>{category.desc}</p><div className="space-y-3">{category.items.map((field) => <label key={field.key} className="hub-customer-toggle"><span>{field.label}<Tooltip content={field.tip}><span><Info aria-hidden="true" size={14} /></span></Tooltip></span><input type="checkbox" checked={Boolean(payload[field.key])} onChange={(event) => update({ payload: { ...payload, [field.key]: event.target.checked } })} /></label>)}</div></fieldset>)}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hub-border-subtle)] pt-5">
        <label className="hub-customer-toggle"><span>Ativar regra após salvar</span><input type="checkbox" checked={Boolean(triggerForm.status)} onChange={(event) => update({ status: event.target.checked })} /></label>
        <div className="flex gap-3"><Button variant="ghost" disabled={isSaving} onClick={onVoltar}>Cancelar</Button><Button type="submit" loading={isSaving} icon={Zap}>Salvar regra</Button></div>
      </footer>
    </form>
  </motion.section>;
};

export default EditorDeRegra;
