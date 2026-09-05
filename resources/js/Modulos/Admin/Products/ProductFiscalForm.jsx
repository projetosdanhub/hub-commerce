import React from 'react';
import { Landmark, ReceiptText } from 'lucide-react';

const onlyDigits = (value) => value.replace(/\D/g, '');

export const ProductFiscalForm = ({ product, onChange }) => {
  const update = (field, value) => onChange({ ...product, [field]: value });

  return (
    <div className="hub-product-form-grid">
      <section className="hub-surface hub-product-form-card">
        <header className="hub-product-form-header">
          <div>
            <span className="hub-product-form-icon"><ReceiptText aria-hidden="true" size={19} /></span>
            <div>
              <h2>Classificação fiscal</h2>
              <p>Dados fiscais persistidos no cadastro do produto.</p>
            </div>
          </div>
        </header>

        <div className="hub-product-field-grid">
          <label>
            <span>NCM</span>
            <input className="hub-product-code-input" inputMode="numeric" value={product.ncm ?? ''} onChange={(event) => update('ncm', onlyDigits(event.target.value))} />
          </label>
          <label>
            <span>CEST</span>
            <input className="hub-product-code-input" inputMode="numeric" value={product.cest ?? ''} onChange={(event) => update('cest', onlyDigits(event.target.value))} />
          </label>
          <label className="hub-product-field-full">
            <span>GTIN / EAN</span>
            <input className="hub-product-code-input" inputMode="numeric" value={product.gtin ?? ''} onChange={(event) => update('gtin', onlyDigits(event.target.value))} />
          </label>
          <label className="hub-product-field-full">
            <span>Origem da mercadoria</span>
            <select value={product.origem ?? ''} onChange={(event) => update('origem', event.target.value)}>
              <option value="">Não informado</option>
              <option value="0">0 — Nacional</option>
              <option value="1">1 — Estrangeira, importação direta</option>
              <option value="2">2 — Estrangeira, mercado interno</option>
              <option value="3">3 — Nacional com conteúdo de importação superior a 40%</option>
              <option value="4">4 — Nacional conforme processo produtivo básico</option>
              <option value="5">5 — Nacional com conteúdo de importação até 40%</option>
              <option value="6">6 — Estrangeira, importação direta sem similar nacional</option>
              <option value="7">7 — Estrangeira, mercado interno sem similar nacional</option>
              <option value="8">8 — Nacional com conteúdo de importação superior a 70%</option>
            </select>
          </label>
        </div>
      </section>

      <section className="hub-surface hub-product-form-card">
        <header className="hub-product-form-header">
          <div>
            <span className="hub-product-form-icon"><Landmark aria-hidden="true" size={19} /></span>
            <div>
              <h2>Tributação</h2>
              <p>Alíquotas e códigos usados no registro fiscal do produto.</p>
            </div>
          </div>
        </header>

        <div className="hub-product-field-grid">
          <label>
            <span>CSOSN</span>
            <input className="hub-product-code-input" inputMode="numeric" value={product.csosn ?? ''} onChange={(event) => update('csosn', onlyDigits(event.target.value))} />
          </label>
          <label>
            <span>CST</span>
            <input className="hub-product-code-input" inputMode="numeric" value={product.cst ?? ''} onChange={(event) => update('cst', onlyDigits(event.target.value))} />
          </label>
          <label>
            <span>CFOP dentro do estado</span>
            <input className="hub-product-code-input" inputMode="numeric" value={product.cfopDentro ?? ''} onChange={(event) => update('cfopDentro', onlyDigits(event.target.value))} />
          </label>
          <label>
            <span>CFOP fora do estado</span>
            <input className="hub-product-code-input" inputMode="numeric" value={product.cfopFora ?? ''} onChange={(event) => update('cfopFora', onlyDigits(event.target.value))} />
          </label>
          <label>
            <span>Unidade de medida</span>
            <input value={product.unidade ?? ''} onChange={(event) => update('unidade', event.target.value.toUpperCase())} />
          </label>
          <label>
            <span>ICMS (%)</span>
            <input type="number" min="0" max="100" step="0.01" inputMode="decimal" value={product.icmsPerc ?? ''} onChange={(event) => update('icmsPerc', event.target.value)} />
          </label>
          <label>
            <span>IPI (%)</span>
            <input type="number" min="0" max="100" step="0.01" inputMode="decimal" value={product.ipiPerc ?? ''} onChange={(event) => update('ipiPerc', event.target.value)} />
          </label>
        </div>
      </section>
    </div>
  );
};
