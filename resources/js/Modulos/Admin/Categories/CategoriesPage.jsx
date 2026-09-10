import React, { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tags } from 'lucide-react';
import api from '../../../api';
import { Button } from '../DesignSystem/primitives/Button';
import { ModalDialog } from '../DesignSystem/patterns/ModalDialog';
import { useRegisterAdminPageRefresh } from '../DesignSystem/patterns/GlobalPageRefresh';
import { CategoryForm } from './CategoryForm';
import { CategoryList } from './CategoryList';
import './categories.css';

const categoryQueryKey = ['adminCategories', window.location.host];
const emptyCategory = { id: null, nome: '', descricao: '', status: 'ATIVO' };
const queryCategories = async () => (await api.get('/admin/categories')).data;
const getRequestError = (error, fallback) => error?.response?.data?.message || fallback;

const CategoryQueryError = ({ error, onRetry }) => {
  const forbidden = error?.response?.status === 403;

  return (
    <section className="hub-categories-empty" role="alert">
      <div>
        <Tags aria-hidden="true" size={28} />
        <h2>{forbidden ? 'Acesso não autorizado' : 'Não foi possível carregar as categorias'}</h2>
        <p>{forbidden ? 'Sua conta não possui a permissão necessária para consultar o catálogo desta loja.' : 'Verifique a conexão e tente novamente. Nenhuma categoria foi alterada.'}</p>
        {!forbidden ? <Button variant="secondary" onClick={onRetry}>Tentar novamente</Button> : null}
      </div>
    </section>
  );
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editorCategory, setEditorCategory] = useState(null);
  const [editorError, setEditorError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState(null);
  const categoriesQuery = useQuery({ queryKey: categoryQueryKey, queryFn: queryCategories });
  const refresh = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: categoryQueryKey });
  }, [queryClient]);

  useRegisterAdminPageRefresh(refresh);

  const categories = useMemo(
    () => (Array.isArray(categoriesQuery.data?.data) ? categoriesQuery.data.data : []),
    [categoriesQuery.data],
  );

  const saveCategory = useMutation({
    mutationFn: ({ id, payload }) => (id ? api.put('/admin/categories/' + id, payload) : api.post('/admin/categories', payload)),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKey });
      setEditorCategory(null);
      setEditorError('');
      setNotice({ tone: 'success', text: variables.id ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.' });
    },
    onError: (error) => setEditorError(getRequestError(error, 'Não foi possível salvar a categoria.')),
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => api.delete('/admin/categories/' + id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKey });
      setDeleteTarget(null);
      setDeleteError('');
      setNotice({ tone: 'success', text: 'Categoria excluída com sucesso.' });
    },
    onError: (error) => setDeleteError(getRequestError(error, 'Não foi possível excluir a categoria.')),
  });

  const startNewCategory = () => {
    setEditorError('');
    setEditorCategory(emptyCategory);
  };

  const openEditor = (category) => {
    setEditorError('');
    setEditorCategory(category);
  };

  const openDeleteDialog = (category) => {
    setDeleteError('');
    setDeleteTarget(category);
  };

  return (
    <main className="hub-categories-page">
      <Helmet>
        <title>Categorias | Hub Commerce</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <header className="hub-categories-heading">
        <div>
          <p className="hub-categories-eyebrow">Catálogo</p>
          <h1>Categorias</h1>
          <p>Organize a navegação do catálogo com categorias reais desta loja.</p>
        </div>
        <Button icon={Plus} onClick={startNewCategory}>Nova categoria</Button>
      </header>

      {notice ? <p className={'hub-categories-notice hub-categories-notice-' + notice.tone} role="status">{notice.text}</p> : null}

      <section className="hub-categories-surface hub-stable-data-region" aria-labelledby="categories-list-title">
        <header className="hub-categories-section-heading">
          <div>
            <h2 id="categories-list-title"><Tags aria-hidden="true" size={19} /> Categorias da loja</h2>
            <p>O status controla a disponibilidade da categoria na vitrine. Categorias com produtos vinculados não podem ser excluídas.</p>
          </div>
          {!categoriesQuery.isLoading && !categoriesQuery.isError ? <span className="hub-categories-count">{categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}</span> : null}
        </header>

        {categoriesQuery.isError ? <CategoryQueryError error={categoriesQuery.error} onRetry={() => categoriesQuery.refetch()} /> : (
          <CategoryList categories={categories} loading={categoriesQuery.isLoading} onCreate={startNewCategory} onEdit={openEditor} onDelete={openDeleteDialog} />
        )}
      </section>

      {editorCategory ? (
        <ModalDialog labelledBy="category-editor-title" describedBy="category-editor-description" onClose={() => { setEditorCategory(null); setEditorError(''); }} busy={saveCategory.isPending}>
          {(requestClose) => <CategoryForm key={editorCategory.id || 'new-category'} category={editorCategory} saving={saveCategory.isPending} error={editorError} onClearError={() => setEditorError('')} onCancel={requestClose} onSave={(payload) => saveCategory.mutate({ id: editorCategory.id, payload })} />}
        </ModalDialog>
      ) : null}

      {deleteTarget ? (
        <ModalDialog labelledBy="category-delete-title" describedBy="category-delete-description" onClose={() => { setDeleteTarget(null); setDeleteError(''); }} busy={deleteCategory.isPending}>
          {(requestClose) => (
            <section className="hub-categories-dialog">
              <h2 id="category-delete-title">Excluir {deleteTarget.nome}?</h2>
              <p id="category-delete-description">Esta ação remove o cadastro permanentemente. A exclusão será bloqueada se houver produtos vinculados a esta categoria.</p>
              {deleteError ? <p className="hub-categories-inline-error" role="alert">{deleteError}</p> : null}
              <footer className="hub-categories-dialog-actions">
                <Button variant="secondary" onClick={requestClose}>Cancelar</Button>
                <Button variant="danger" loading={deleteCategory.isPending} onClick={() => deleteCategory.mutate(deleteTarget.id)}>Excluir categoria</Button>
              </footer>
            </section>
          )}
        </ModalDialog>
      ) : null}
    </main>
  );
}
