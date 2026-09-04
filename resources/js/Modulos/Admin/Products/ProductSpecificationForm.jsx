import React, { useState } from 'react';
import { ClipboardList, CircleAlert, Plus, Trash2 } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';

const MAX_ATTRIBUTES = 100;

export const ProductSpecificationForm = ({ product, onChange }) => {
  const [notice, setNotice] = useState('');
  const specifications = product.fichaTecnica || [];
  const set = (changes) => onChange((current) => ({ ...current, ...changes }));

  const add = () => {
    if (specifications.length >= MAX_ATTRIBUTES) {
      setNotice('A ficha técnica permite até 100 atributos.');
      return;
    }

    set({ fichaTecnica: [...specifications, { atributo: '', valor: '' }] });
    setNotice('');
  };

  const update = (index, field, value) => {
    set({
      fichaTecnica: specifications.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    });
  };

  const remove = (index) => {
    set({ fichaTecnica: specifications.filter((_, itemIndex) => itemIndex !== index) });
    setNotice('');
  };

  return <section className="hub-surface hub-product-spec-card">
    <header className="hub-product-spec-header">
      <div>
        <span className="hub-orders-metric-icon"><ClipboardList aria-hidden="true" size={18} /></span>
        <div><h2>Ficha técnica</h2><p>Cadastre apenas características verificáveis deste produto.</p></div>
      </div>
      <Button icon={Plus} onClick={add}>Adicionar atributo</Button>
    </header>

    {notice ? <p className="hub-product-spec-notice" role="alert"><CircleAlert aria-hidden="true" size={17} />{notice}</p> : null}

    {!specifications.length ? <div className="hub-product-spec-empty">
      <ClipboardList aria-hidden="true" size={30} />
      <strong>Nenhum atributo cadastrado</strong>
      <span>Adicione os dados técnicos que serão exibidos na vitrine.</span>
    </div> : <div className="hub-product-spec-list">
      <div className="hub-product-spec-heading" aria-hidden="true"><span>Atributo</span><span>Valor</span><i /></div>
      {specifications.map((item, index) => <div className="hub-product-spec-row" key={index}>
        <label><span>Atributo</span><input value={item.atributo || ''} onChange={(event) => update(index, 'atributo', event.target.value)} aria-label={`Atributo ${index + 1}`} /></label>
        <label><span>Valor</span><input value={item.valor || ''} onChange={(event) => update(index, 'valor', event.target.value)} aria-label={`Valor do atributo ${index + 1}`} /></label>
        <button type="button" className="hub-product-spec-remove" onClick={() => remove(index)} aria-label={`Remover atributo ${index + 1}`}><Trash2 aria-hidden="true" size={17} /></button>
      </div>)}
    </div>}
  </section>;
};
