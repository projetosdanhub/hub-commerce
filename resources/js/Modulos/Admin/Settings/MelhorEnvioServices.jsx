import { useState } from 'react';
import api from '../../../api';
import { Button } from '../DesignSystem/primitives/Button';

export default function MelhorEnvioServices({ settings, onSaved }) {
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const services = draft || settings?.carriers_ativas || [];
  const save = async (path, body) => {
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/melhorenvio/' + path, body);
      setDraft(null);
      await onSaved();
    } catch (failure) {
      setError(failure.response?.data?.message || 'Não foi possível salvar a configuração.');
    } finally { setSaving(false); }
  };
  return (
    <section className="hub-settings-form hub-surface">
      <h2>Ambiente e serviços de frete</h2>
      <label>Ambiente usado pela loja<select disabled={saving || !settings} value={settings?.environment || 'SANDBOX'} onChange={(event) => save('environment', { environment: event.target.value })}><option value="SANDBOX">Teste</option><option value="PRODUCTION">Produção</option></select></label>
      <p>Conecte a conta no mesmo ambiente selecionado para habilitar a cotação e as etiquetas.</p>
      {error || settings?.services_error ? <p role="alert">{error || settings.services_error}</p> : null}
      {settings?.is_authenticated ? <fieldset disabled={saving}><legend>Serviços oferecidos na loja</legend>{services.map((service) => <label key={service.id}><input type="checkbox" checked={service.ativo} onChange={(event) => setDraft(services.map((item) => item.id === service.id ? { ...item, ativo: event.target.checked } : item))} />{service.nome}</label>)}</fieldset> : <p>Conexão pendente neste ambiente.</p>}
      <Button size="sm" disabled={!settings?.is_authenticated || !services.length} loading={saving} onClick={() => save('carriers', { carriers_ativas: services })}>Salvar serviços</Button>
    </section>
  );
}
