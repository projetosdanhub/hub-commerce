import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Code2, Pin, Zap } from 'lucide-react';
import { Badge } from '../../DesignSystem/primitives/Badge';
import { Button } from '../../DesignSystem/primitives/Button';
import { tabTransition } from '../Compartilhado/ConstantesPixels';
import { SafeTooltip, SecureInput } from '../Compartilhado/ComponentesUIPixels';

const Field = ({ label, tooltip, children }) => (
  <label className="hub-order-form-field">
    <span>{label}{tooltip ? <SafeTooltip text={tooltip} title={label} /> : null}</span>
    {children}
  </label>
);

const ProviderCard = ({ icon: Icon, name, configured, children }) => (
  <section className="hub-surface hub-smart-grid-item" aria-label={name}>
    <header className="hub-order-detail-heading">
      <div className="hub-flex-row">
        <span className="hub-orders-metric-icon"><Icon aria-hidden="true" size={20} /></span>
        <div>
          <h3 className="hub-card-title">{name}</h3>
          <p className="hub-page-subtitle">Credenciais usadas no rastreamento server-side.</p>
        </div>
      </div>
      <Badge variant={configured ? 'success' : 'neutral'}>{configured ? 'Configurada' : 'Não configurada'}</Badge>
    </header>
    <div className="hub-order-form-grid">{children}</div>
  </section>
);

const AppStorePixels = ({ credenciais, setCredenciais, isSaving, onSave }) => {
  const update = (changes) => setCredenciais((current) => ({ ...current, ...changes }));

  return (
    <motion.div {...tabTransition} className="hub-section-stack">
      <header className="hub-order-detail-heading">
        <div>
          <p className="hub-page-eyebrow">Conexões de dados</p>
          <h2 className="hub-page-title">Integrações</h2>
          <p className="hub-page-description">Cadastre somente as credenciais da sua operação. O status indica configuração, não disponibilidade externa.</p>
        </div>
        <Button loading={isSaving} onClick={onSave}>Salvar integrações</Button>
      </header>

      <div className="hub-smart-grid">
        <ProviderCard icon={Code2} name="Meta Pixel e CAPI" configured={Boolean(credenciais.meta_pixel_id && credenciais.meta_access_token)}>
          <Field label="ID do Pixel">
            <SecureInput value={credenciais.meta_pixel_id || ''} onChange={(value) => update({ meta_pixel_id: value.replace(/\D/g, '') })} placeholder="Ex.: 1029384756" isToken={false} />
          </Field>
          <Field label="Token CAPI" tooltip="Gere o token no Gerenciador de Eventos da Meta.">
            <SecureInput value={credenciais.meta_access_token || ''} onChange={(value) => update({ meta_access_token: value })} placeholder="Cole o token de acesso" />
          </Field>
        </ProviderCard>

        <ProviderCard icon={Activity} name="Google Analytics 4" configured={Boolean(credenciais.ga4_measurement_id)}>
          <Field label="Measurement ID">
            <SecureInput value={credenciais.ga4_measurement_id || ''} onChange={(value) => update({ ga4_measurement_id: value.toUpperCase() })} placeholder="G-XXXXXXXXXX" isToken={false} />
          </Field>
        </ProviderCard>

        <ProviderCard icon={Zap} name="TikTok for Business" configured={Boolean(credenciais.tiktok_pixel_id)}>
          <Field label="Pixel ID">
            <SecureInput value={credenciais.tiktok_pixel_id || ''} onChange={(value) => update({ tiktok_pixel_id: value })} placeholder="Cole o identificador do pixel" isToken={false} />
          </Field>
        </ProviderCard>

        <ProviderCard icon={Pin} name="Pinterest Tag" configured={Boolean(credenciais.pinterest_pixel_id && credenciais.pinterest_access_token)}>
          <Field label="Ad account ou Pixel ID">
            <SecureInput value={credenciais.pinterest_pixel_id || ''} onChange={(value) => update({ pinterest_pixel_id: value.replace(/\D/g, '') })} placeholder="Ex.: 26123456789" isToken={false} />
          </Field>
          <Field label="Access token">
            <SecureInput value={credenciais.pinterest_access_token || ''} onChange={(value) => update({ pinterest_access_token: value })} placeholder="Cole o token de conversão" />
          </Field>
        </ProviderCard>
      </div>
    </motion.div>
  );
};

export default AppStorePixels;
