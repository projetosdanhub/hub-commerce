import React, { useState } from 'react';
import { ArrowLeft, Box, Save } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';

const emptyPackage = { id: null, nome: '', altura: '', largura: '', comprimento: '', peso_vazio: '', is_default: false };

export const PackageForm = ({ item, saving, onCancel, onSave }) => {
  const [form, setForm] = useState(() => (item ? { ...emptyPackage, ...item } : emptyPackage));
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.nome || !form.altura || !form.largura || !form.comprimento || !form.peso_vazio) { setError('Informe identificação, dimensões e peso vazio da embalagem.'); return; }
    onSave(form);
  };

  return (
    <form className="hub-carriers-form" onSubmit={submit}>
      <header><Box aria-hidden="true" size={22} /><div><h2>{form.id ? 'Editar embalagem' : 'Nova embalagem'}</h2><p>As dimensões e o peso devem representar a embalagem real usada no despacho.</p></div></header>
      <section className="hub-carriers-form-section"><h3>Dados da embalagem</h3><div className="hub-carriers-form-grid" data-columns="3">
        <label className="hub-carriers-field" data-span="2"><span>Nome *</span><input name="nome" value={form.nome} onChange={update} required /></label>
        <label className="hub-carriers-field"><span>Altura (cm) *</span><input type="number" name="altura" value={form.altura} onChange={update} min="1" step="0.1" required /></label>
        <label className="hub-carriers-field"><span>Largura (cm) *</span><input type="number" name="largura" value={form.largura} onChange={update} min="11" step="0.1" required /></label>
        <label className="hub-carriers-field"><span>Comprimento (cm) *</span><input type="number" name="comprimento" value={form.comprimento} onChange={update} min="16" step="0.1" required /></label>
        <label className="hub-carriers-field"><span>Peso vazio (kg) *</span><input type="number" name="peso_vazio" value={form.peso_vazio} onChange={update} min="0" step="0.001" required /></label>
      </div></section>
      <section className="hub-carriers-form-section"><label className="hub-carriers-field"><span><input type="checkbox" name="is_default" checked={Boolean(form.is_default)} onChange={update} /> Usar como embalagem padrão</span><small>A opção padrão será aplicada na tela de despacho quando o fluxo operacional a utilizar.</small></label></section>
      {error ? <p className="hub-carriers-inline-notice" role="alert">{error}</p> : null}
      <footer className="hub-carriers-form-footer"><Button variant="secondary" onClick={onCancel} icon={ArrowLeft}>Voltar</Button><Button type="submit" loading={saving} icon={Save}>{form.id ? 'Salvar alterações' : 'Cadastrar embalagem'}</Button></footer>
    </form>
  );
};
