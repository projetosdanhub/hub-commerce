import React, { useEffect, useMemo, useState } from 'react';
import { CircleAlert, Gift, LoaderCircle, Save, Truck } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';

const toCurrency = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100);

export function FreeShippingManager({ products, settings, loading, onSave }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [minimum, setMinimum] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setSelectedIds(settings?.product_ids || []);
    setMinimum(settings?.minimum_order_cents ? String(settings.minimum_order_cents / 100) : '');
  }, [settings]);

  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const toggleProduct = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const save = async () => {
    const normalized = minimum === '' ? null : Math.round(Number(String(minimum).replace(',', '.')) * 100);
    if (minimum !== '' && (!Number.isInteger(normalized) || normalized < 1)) {
      setNotice({ tone: 'error', text: 'Informe um valor mínimo de compra válido ou deixe o campo vazio.' });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      await onSave({ product_ids: selectedIds, minimum_order_cents: normalized });
      setNotice({ tone: 'success', text: 'Regras de frete grátis atualizadas.' });
    } catch {
      setNotice({ tone: 'error', text: 'Não foi possível atualizar as regras de frete grátis.' });
    } finally {
      setSaving(false);
    }
  };

  return <section className="hub-product-form-grid" aria-labelledby="free-shipping-title">
    <header className="hub-page-subheading">
      <div><p className="hub-page-eyebrow"><Truck aria-hidden="true" size={16} /> Benefícios de entrega</p><h2 id="free-shipping-title">Frete grátis</h2><p>Defina produtos elegíveis e o valor mínimo da compra. Em carrinho misto, o frete é cobrado; benefícios nunca se somam sobre a mesma base.</p></div>
    </header>
    {notice ? <p className="hub-catalog-editor-notice" data-tone={notice.tone} role={notice.tone === 'error' ? 'alert' : 'status'}>{notice.tone === 'error' ? <CircleAlert aria-hidden="true" size={17} /> : <Gift aria-hidden="true" size={17} />}{notice.text}</p> : null}
    <section className="hub-surface hub-product-form-card">
      <label className="hub-product-field-full"><span>Frete grátis a partir de</span><input inputMode="decimal" min="0" step="0.01" value={minimum} onChange={(event) => setMinimum(event.target.value)} placeholder="Ex.: 199,90" /><small>O carrinho mostra quanto falta para atingir essa meta e confirma a elegibilidade somente após a cotação.</small></label>
    </section>
    <section className="hub-surface hub-product-form-card">
      <header className="hub-product-form-header"><div><span className="hub-product-form-icon"><Gift aria-hidden="true" size={19} /></span><div><h2>Produtos elegíveis</h2><p>Selecione os itens que oferecem frete grátis quando comprados sozinhos.</p></div></div></header>
      {loading ? <div className="hub-stable-data-region"><LoaderCircle className="hub-spin" aria-label="Carregando produtos" /></div> : <div className="hub-product-selection-list">{products.map((product) => <label className="hub-product-option" key={product.id}><input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleProduct(product.id)} /><span><strong>{product.nome}</strong><small>{product.preco ? toCurrency(Number(product.preco) * 100) : 'Preço indisponível'}</small></span></label>)}</div>}
      <footer className="hub-catalog-actions"><Button icon={Save} loading={saving} onClick={save}>Salvar regras de frete</Button></footer>
    </section>
  </section>;
}
