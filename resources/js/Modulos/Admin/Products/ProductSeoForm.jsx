import React from 'react';
import { CircleAlert, SearchCheck } from 'lucide-react';

const progress = (value, maximum) => Math.min(100, (String(value || '').length / maximum) * 100);

const SeoField = ({ label, value, maximum, onChange, multiline = false }) => {
  const length = String(value || '').length;
  const overLimit = length > maximum;
  const Input = multiline ? 'textarea' : 'input';

  return (
    <label className="hub-product-seo-field">
      <span><strong>{label}</strong><small data-over-limit={overLimit}>{length}/{maximum}</small></span>
      <Input value={value ?? ''} rows={multiline ? 4 : undefined} onChange={(event) => onChange(event.target.value)} />
      <i aria-hidden="true" data-over-limit={overLimit}><b style={{ width: `${progress(value, maximum)}%` }} /></i>
    </label>
  );
};

export const ProductSeoForm = ({ product, onChange }) => {
  const update = (field, value) => onChange({ ...product, [field]: value });
  const updateSlug = (value) => update('slug', value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));

  return (
    <div className="hub-product-form-grid">
      <section className="hub-surface hub-product-form-card">
        <header className="hub-product-form-header">
          <div>
            <span className="hub-product-form-icon"><SearchCheck aria-hidden="true" size={19} /></span>
            <div>
              <h2>Metadados de busca</h2>
              <p>Campos persistidos que ajudam a vitrine a montar dados de SEO da loja.</p>
            </div>
          </div>
        </header>

        <div className="hub-product-seo-fields">
          <SeoField label="Meta title" value={product.metaTitle} maximum={60} onChange={(value) => update('metaTitle', value)} />
          <SeoField label="Meta description" value={product.metaDesc} maximum={160} multiline onChange={(value) => update('metaDesc', value)} />
          <label className="hub-product-slug-field">
            <span>Slug da URL</span>
            <div><span aria-hidden="true">/produto/</span><input value={product.slug ?? ''} onChange={(event) => updateSlug(event.target.value)} /></div>
          </label>
        </div>
      </section>

      <section className="hub-surface hub-product-seo-unavailable">
        <CircleAlert aria-hidden="true" size={22} />
        <div>
          <h2>Prévia de busca indisponível</h2>
          <p>O contrato atual não informa o domínio canônico do tenant. A prévia só será exibida quando esse dado real estiver disponível.</p>
        </div>
      </section>
    </div>
  );
};
