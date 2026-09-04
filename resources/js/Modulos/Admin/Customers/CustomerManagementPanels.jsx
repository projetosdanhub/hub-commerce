import React, { useEffect, useState } from 'react';
import { Crown, Plus, Settings2, Trash2 } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { formatCurrency } from './customerUtils';

const initialVip = { nome: '', gasto_requisito: '', compras_requisito: '', mult_coins: '1', desc_frete: '0', desc_produtos: '0', frequencia_uso: 'ILIMITADO', limite_uso: '0', acumula_frete: false, is_default: false, imagem: null };

const Toggle = ({ label, checked, onChange }) => <label className="hub-customer-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;

export const CustomerManagementPanels = ({ mode = 'VIP', vipLevels, settings, loading, onSaveVip, onDeleteVip, onSaveSettings }) => {
  const [vip, setVip] = useState(null);
  const [crmSettings, setCrmSettings] = useState(() => ({
    permite_cadastro: Boolean(settings?.permite_cadastro),
    login_apenas_convite: Boolean(settings?.login_apenas_convite),
    aprovar_comentarios: Boolean(settings?.aprovar_comentarios),
    bloquear_fora_do_pais: Boolean(settings?.bloquear_fora_do_pais),
  }));
  useEffect(() => {
    if (mode === 'CONFIG') {
      setCrmSettings({
        permite_cadastro: Boolean(settings?.permite_cadastro),
        login_apenas_convite: Boolean(settings?.login_apenas_convite),
        aprovar_comentarios: Boolean(settings?.aprovar_comentarios),
        bloquear_fora_do_pais: Boolean(settings?.bloquear_fora_do_pais),
      });
    }
  }, [mode, settings]);
  const set = (changes) => setVip((current) => ({ ...current, ...changes }));

  if (mode === 'VIP') return <section className="hub-customer-management"><header className="hub-order-detail-heading"><div><p className="hub-page-eyebrow">Relacionamento</p><h1 className="hub-page-title"><Crown aria-hidden="true" size={28} /> Benefícios VIP</h1><p className="hub-page-description">Defina níveis, limites e benefícios por valor de relacionamento.</p></div><Button icon={Plus} onClick={() => setVip(initialVip)}>Novo nível</Button></header>
    {vip ? <section className="hub-surface hub-customer-vip-form"><header><h2>{vip.id ? 'Editar nível VIP' : 'Novo nível VIP'}</h2></header><div className="hub-customer-vip-grid">
      <label className="hub-order-form-field"><span>Nome *</span><input autoFocus value={vip.nome} onChange={(e) => set({ nome: e.target.value })} /></label>
      <label className="hub-order-form-field"><span>Gasto mínimo *</span><input type="number" min="0" value={vip.gasto_requisito} onChange={(e) => set({ gasto_requisito: e.target.value })} /></label>
      <label className="hub-order-form-field"><span>Compras mínimas *</span><input type="number" min="0" value={vip.compras_requisito} onChange={(e) => set({ compras_requisito: e.target.value })} /></label>
      <label className="hub-order-form-field"><span>Multiplicador de Coins</span><input type="number" min="1" step="0.1" value={vip.mult_coins} onChange={(e) => set({ mult_coins: e.target.value })} /></label>
      <label className="hub-order-form-field"><span>Desconto no frete (%)</span><input type="number" min="0" max="100" value={vip.desc_frete} onChange={(e) => set({ desc_frete: e.target.value })} /></label>
      <label className="hub-order-form-field"><span>Desconto em produtos (%)</span><input type="number" min="0" max="100" value={vip.desc_produtos} onChange={(e) => set({ desc_produtos: e.target.value })} /></label>
      <label className="hub-order-form-field"><span>Frequência de uso</span><select value={vip.frequencia_uso} onChange={(e) => set({ frequencia_uso: e.target.value })}><option value="ILIMITADO">Ilimitado</option><option value="SEMANAL">Semanal</option><option value="MENSAL">Mensal</option></select></label>
      <label className="hub-order-form-field"><span>Limite de uso</span><input type="number" min="0" value={vip.limite_uso} onChange={(e) => set({ limite_uso: e.target.value })} /></label>
      <label className="hub-order-form-field"><span>Imagem do nível</span><input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => set({ imagem: e.target.files?.[0] || null })} /></label>
    </div><div className="hub-customer-toggle-grid"><Toggle label="Nível padrão" checked={Boolean(vip.is_default)} onChange={(is_default) => set({ is_default })} /><Toggle label="Acumular desconto de frete" checked={Boolean(vip.acumula_frete)} onChange={(acumula_frete) => set({ acumula_frete })} /></div><footer><Button variant="ghost" onClick={() => setVip(null)}>Cancelar</Button><Button loading={loading} onClick={async () => { await onSaveVip(vip); setVip(null); }}>Salvar benefício</Button></footer></section> : <section className="hub-customer-vip-list">{vipLevels?.length ? vipLevels.map((level) => <article className="hub-surface" key={level.id}><div><span className="hub-orders-metric-icon"><Crown aria-hidden="true" size={18} /></span><h2>{level.nome} {level.is_default ? <Badge variant="info">Padrão</Badge> : null}</h2><p>A partir de {formatCurrency(level.gasto_requisito)} · {level.compras_requisito} compra(s)</p></div><div className="hub-customer-vip-actions"><Button size="sm" variant="secondary" onClick={() => setVip(level)}>Editar</Button><IconButton icon={Trash2} label={`Excluir nível ${level.nome}`} loading={loading} onClick={() => onDeleteVip(level.id)} /></div></article>) : <div className="hub-empty-state"><div><Crown aria-hidden="true" size={28} /><h2 className="hub-panel-title">Nenhum nível VIP</h2><p>Crie o primeiro nível para habilitar benefícios por relacionamento.</p></div></div>}</section>}</section>;
  return <section className="hub-customer-management"><header className="hub-order-detail-heading"><div><p className="hub-page-eyebrow">CRM e loja</p><h1 className="hub-page-title"><Settings2 aria-hidden="true" size={28} /> Configurações</h1><p className="hub-page-description">Defina regras de cadastro, convites, moderação e restrições.</p></div></header><section className="hub-surface hub-customer-settings"><Toggle label="Permitir cadastro aberto" checked={crmSettings.permite_cadastro} onChange={(permite_cadastro) => setCrmSettings((value) => ({ ...value, permite_cadastro }))} /><Toggle label="Permitir login apenas por convite" checked={crmSettings.login_apenas_convite} onChange={(login_apenas_convite) => setCrmSettings((value) => ({ ...value, login_apenas_convite }))} /><Toggle label="Aprovar comentários manualmente" checked={crmSettings.aprovar_comentarios} onChange={(aprovar_comentarios) => setCrmSettings((value) => ({ ...value, aprovar_comentarios }))} /><Toggle label="Bloquear compras fora do país de origem" checked={crmSettings.bloquear_fora_do_pais} onChange={(bloquear_fora_do_pais) => setCrmSettings((value) => ({ ...value, bloquear_fora_do_pais }))} /><footer><Button loading={loading} onClick={() => onSaveSettings(crmSettings)}>Salvar configurações</Button></footer></section></section>;
};

export const CustomerSections = ({ active, onChange, children }) => <><nav className="hub-orders-tabs" aria-label="Seções de clientes">{[['PAINEL', 'Painel'], ['CLIENTES', 'Clientes'], ['VIP', 'Benefícios VIP'], ['CONFIG', 'Configurações']].map(([value, label]) => <button type="button" key={value} className="hub-orders-tab" data-active={active === value} onClick={() => onChange(value)}>{label}</button>)}</nav>{children}</>;
