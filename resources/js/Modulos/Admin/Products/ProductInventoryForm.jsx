import React from 'react';
import { Boxes, ClipboardCheck, PackageCheck } from 'lucide-react';

const Card = ({ icon: Icon, title, description, children }) => <section className="hub-surface hub-product-stock-card">
  <header>
    <span className="hub-orders-metric-icon"><Icon aria-hidden="true" size={18} /></span>
    <div><h2>{title}</h2><p>{description}</p></div>
  </header>
  {children}
</section>;

const Toggle = ({ checked, onChange, title, description }) => <label className="hub-product-stock-toggle">
  <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
  <span><strong>{title}</strong><small>{description}</small></span>
</label>;

export const ProductInventoryForm = ({ product, onChange }) => {
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));
  const tracksStock = product.controlarEstoque !== false;

  return <div className="hub-product-stock-grid">
    <Card icon={Boxes} title="Inventário" description="Defina se a disponibilidade será controlada pelo saldo físico.">
      <div className="hub-product-stock-content">
        <Toggle checked={tracksStock} onChange={(controlarEstoque) => set({ controlarEstoque })} title="Controlar estoque físico" description="Quando ativo, o saldo cadastrado é enviado para a API da loja." />
        {tracksStock ? <div className="hub-product-stock-fields">
          <label><span>Quantidade disponível</span><input type="number" min="0" step="1" value={product.estoque ?? ''} onChange={(event) => set({ estoque: event.target.value })} /></label>
          <label><span>Alerta de estoque baixo</span><input type="number" min="0" step="1" value={product.alertaEstoque ?? ''} onChange={(event) => set({ alertaEstoque: event.target.value })} /></label>
        </div> : <p className="hub-product-stock-disabled"><PackageCheck aria-hidden="true" size={17} />O saldo não será monitorado para este produto.</p>}
      </div>
    </Card>

    <Card icon={ClipboardCheck} title="Venda sem saldo" description="Configure a pré-venda de acordo com a política da loja.">
      <Toggle checked={Boolean(product.preVenda)} onChange={(preVenda) => set({ preVenda })} title="Permitir compra sem estoque" description="Quando ativado, o produto pode ser comprado mesmo sem saldo disponível." />
    </Card>
  </div>;
};
