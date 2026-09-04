import React from 'react';
import { BadgeDollarSign, FileText, Package, Tags } from 'lucide-react';

const Field = ({ label, error, children, hint }) => <label className="hub-order-form-field"><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}{error ? <small className="hub-order-form-error">{error}</small> : null}</label>;

const Card = ({ icon: Icon, title, children }) => <section className="hub-surface hub-product-form-card"><header><span className="hub-orders-metric-icon"><Icon aria-hidden="true" size={18} /></span><h2>{title}</h2></header>{children}</section>;

export const ProductGeneralForm = ({ product, categories, errors, onChange }) => {
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));
  const clear = (field) => onChange((current) => ({ ...current, ...field }));

  return <div className="hub-product-form-grid">
    <div className="hub-product-form-main">
      <Card icon={Package} title="Informações básicas">
        <div className="hub-product-form-fields">
          <Field label="Nome do produto *" error={errors.nome ? 'Informe o nome do produto.' : ''}><input autoFocus value={product.nome || ''} onChange={(event) => { clear({ nome: false }); set({ nome: event.target.value }); }} placeholder="Nome do produto" /></Field>
          <div className="hub-product-form-pair">
            <Field label="SKU de referência" hint="Opcional; use um identificador interno consistente."><input value={product.skuRef || ''} onChange={(event) => set({ skuRef: event.target.value.toUpperCase() })} placeholder="REF" /></Field>
            <Field label="Sufixo do SKU" hint="Opcional; nenhum SKU é gerado automaticamente."><input value={product.skuSufixo || ''} onChange={(event) => set({ skuSufixo: event.target.value.toUpperCase() })} placeholder="SUFIXO" /></Field>
          </div>
          <div className="hub-product-form-pair">
            <Field label="Status de vitrine"><select value={product.status || 'INATIVO'} onChange={(event) => set({ status: event.target.value })}><option value="ATIVO">Ativo — visível na loja</option><option value="INATIVO">Inativo — indisponível</option><option value="OCULTO">Oculto — fora da vitrine</option></select></Field>
            <Field label="Categoria principal *" error={errors.categoriaPrincipal ? 'Selecione uma categoria.' : ''}><select value={product.categoriaPrincipal || ''} onChange={(event) => { clear({ categoriaPrincipal: false }); set({ categoriaPrincipal: event.target.value }); }}><option value="">Selecione uma categoria</option>{categories.map((category) => <option key={category.id} value={category.nome}>{category.nome}</option>)}</select></Field>
          </div>
          <Field label="Descrição"><textarea value={product.descricao || ''} onChange={(event) => set({ descricao: event.target.value })} rows="7" placeholder="Características e informações relevantes do produto." /></Field>
        </div>
      </Card>
    </div>
    <aside className="hub-product-form-side">
      <Card icon={BadgeDollarSign} title="Preço">
        <div className="hub-product-form-fields">
          <Field label="Preço de venda *" error={errors.preco ? 'Informe um preço maior que zero.' : ''}><span className="hub-product-currency"><span>R$</span><input type="number" min="0.01" step="0.01" value={product.preco || ''} onChange={(event) => { clear({ preco: false }); set({ preco: event.target.value }); }} /></span></Field>
          <Field label="Preço promocional" hint="Deve ser menor que o preço de venda."><span className="hub-product-currency"><span>R$</span><input type="number" min="0.01" step="0.01" value={product.precoPromo || ''} onChange={(event) => set({ precoPromo: event.target.value })} /></span></Field>
        </div>
      </Card>
      <Card icon={Tags} title="Visibilidade">
        <p className="hub-panel-description">O status determina se este produto pode ser exibido na vitrine. Estoque e pré-venda são configurados na aba própria.</p>
      </Card>
      <Card icon={FileText} title="Dados completos">
        <p className="hub-panel-description">Ficha técnica, mídia, variações, fiscal, logística e SEO continuam disponíveis nas demais abas.</p>
      </Card>
    </aside>
  </div>;
};
