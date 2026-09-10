import React, { useState } from 'react';
import { FolderPen, Save } from 'lucide-react';
import { Button } from '../DesignSystem/primitives/Button';

const buildForm = (category) => ({
  nome: category?.nome || '',
  descricao: category?.descricao || '',
  status: category?.status || 'ATIVO',
});

export const CategoryForm = ({ category, saving, error, onCancel, onClearError, onSave }) => {
  const [form, setForm] = useState(() => buildForm(category));
  const [localError, setLocalError] = useState('');
  const editing = Boolean(category?.id);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setLocalError('');
    onClearError();
  };

  const submit = (event) => {
    event.preventDefault();
    const nome = form.nome.trim();

    if (!nome) {
      setLocalError('Informe o nome da categoria para continuar.');
      return;
    }

    onSave({ nome, descricao: form.descricao.trim() || null, status: form.status });
  };

  return (
    <form className="hub-categories-form" onSubmit={submit}>
      <header>
        <FolderPen aria-hidden="true" size={21} />
        <div>
          <h2 id="category-editor-title">{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
          <p id="category-editor-description">Os campos seguem o contrato atual do catálogo e são salvos somente após confirmação da API.</p>
        </div>
      </header>

      <label className="hub-categories-field" htmlFor="category-name">
        <span>Nome da categoria <strong aria-hidden="true">*</strong></span>
        <input id="category-name" name="nome" value={form.nome} onChange={update} maxLength="120" required autoFocus aria-describedby={error || localError ? 'category-form-error' : undefined} />
      </label>

      <label className="hub-categories-field" htmlFor="category-description">
        <span>Descrição</span>
        <textarea id="category-description" name="descricao" value={form.descricao} onChange={update} maxLength="5000" />
        <small>Opcional. Use uma descrição objetiva para orientar a organização interna da loja.</small>
      </label>

      <label className="hub-categories-field" htmlFor="category-status">
        <span>Status</span>
        <select id="category-status" name="status" value={form.status} onChange={update}>
          <option value="ATIVO">Ativa</option>
          <option value="INATIVO">Inativa</option>
        </select>
        <small>Uma categoria inativa não fica disponível na vitrine.</small>
      </label>

      {localError || error ? <p className="hub-categories-inline-error" id="category-form-error" role="alert">{localError || error}</p> : null}

      <footer className="hub-categories-form-footer">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" icon={Save} loading={saving}>{editing ? 'Salvar alterações' : 'Criar categoria'}</Button>
      </footer>
    </form>
  );
};
