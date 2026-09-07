import React from 'react';
import { Box, Ruler } from 'lucide-react';

export const ProductLogisticsForm = ({ product, onChange }) => {
  const update = (field, value) => onChange({ ...product, [field]: value });

  return (
    <div className="hub-product-form-grid">
      <section className="hub-surface hub-product-form-card">
        <header className="hub-product-form-header">
          <div>
            <span className="hub-product-form-icon"><Ruler aria-hidden="true" size={19} /></span>
            <div>
              <h2>Peso e dimensões</h2>
              <p>Informações usadas pelas cotações de frete configuradas pela loja.</p>
            </div>
          </div>
        </header>
        <div className="hub-product-field-grid">
          <label className="hub-product-field-full"><span>Peso bruto (kg)</span><input type="number" min="0" step="0.001" inputMode="decimal" value={product.peso ?? ''} onChange={(event) => update('peso', event.target.value)} /></label>
          <label><span>Largura (cm)</span><input type="number" min="0" step="0.1" inputMode="decimal" value={product.largura ?? ''} onChange={(event) => update('largura', event.target.value)} /></label>
          <label><span>Altura (cm)</span><input type="number" min="0" step="0.1" inputMode="decimal" value={product.altura ?? ''} onChange={(event) => update('altura', event.target.value)} /></label>
          <label className="hub-product-field-full"><span>Comprimento (cm)</span><input type="number" min="0" step="0.1" inputMode="decimal" value={product.comp ?? ''} onChange={(event) => update('comp', event.target.value)} /></label>
        </div>
      </section>

      <section className="hub-surface hub-product-form-card">
        <header className="hub-product-form-header">
          <div>
            <span className="hub-product-form-icon"><Box aria-hidden="true" size={19} /></span>
            <div><h2>Expedição</h2><p>Defina como o produto pode compor uma embalagem junto a outros itens.</p></div>
          </div>
        </header>
        <label className="hub-product-option">
          <input type="checkbox" checked={Boolean(product.agrupavel)} onChange={(event) => update('agrupavel', event.target.checked)} />
          <span><strong>Agrupável no carrinho</strong><small>Permite considerar este item junto a outros na mesma embalagem.</small></span>
        </label>
      </section>
    </div>
  );
};