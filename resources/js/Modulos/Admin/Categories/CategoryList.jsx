import React from 'react';
import { Edit3, Package, Tags, Trash2 } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { Button } from '../DesignSystem/primitives/Button';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';

const statusProps = (status) => (status === 'ATIVO' ? { label: 'Ativa', variant: 'success' } : { label: 'Inativa', variant: 'neutral' });

const productSummary = (category) => {
  const count = Number(category.qtd_produtos);

  if (!Number.isFinite(count)) return 'Vínculos não informados';
  if (count === 0) return 'Nenhum produto vinculado';
  return count === 1 ? '1 produto vinculado' : count + ' produtos vinculados';
};

const CategoryIdentity = ({ category }) => {
  const status = statusProps(category.status);

  return (
    <div className="hub-category-identity">
      <span className="hub-category-icon"><Tags aria-hidden="true" size={20} /></span>
      <div className="hub-category-main">
        <div className="hub-category-name-row"><strong>{category.nome}</strong><Badge variant={status.variant}>{status.label}</Badge></div>
        <p>{category.descricao || 'Sem descrição cadastrada.'}</p>
      </div>
    </div>
  );
};

const CategoryActions = ({ category, onEdit, onDelete }) => (
  <div className="hub-categories-actions">
    <IconButton icon={Edit3} label={'Editar ' + category.nome} onClick={() => onEdit(category)} />
    <IconButton icon={Trash2} label={'Excluir ' + category.nome} variant="danger" onClick={() => onDelete(category)} />
  </div>
);

const CategoryLoading = () => (
  <>
    <div className="hub-categories-list" aria-busy="true" aria-label="Carregando categorias">
      {Array.from({ length: 4 }, (_, index) => <div className="hub-category-row" key={index}><div className="hub-category-loading-identity"><Skeleton className="h-11 w-11" /><div><Skeleton className="h-4 w-36" /><Skeleton className="mt-2 h-3 w-52" /></div></div><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-24" /></div>)}
    </div>
    <div className="hub-categories-mobile-list" aria-busy="true" aria-label="Carregando categorias">
      {Array.from({ length: 4 }, (_, index) => <div className="hub-category-card" key={index}><div className="hub-category-loading-identity"><Skeleton className="h-11 w-11" /><div><Skeleton className="h-4 w-36" /><Skeleton className="mt-2 h-3 w-52" /></div></div><Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-full" /></div>)}
    </div>
  </>
);

export const CategoryList = ({ categories, loading, onCreate, onEdit, onDelete }) => {
  if (loading) return <CategoryLoading />;

  if (!categories.length) {
    return (
      <section className="hub-categories-empty">
        <div>
          <Tags aria-hidden="true" size={28} />
          <h2>Nenhuma categoria cadastrada</h2>
          <p>Crie a primeira categoria quando já houver uma organização definida para o catálogo desta loja.</p>
          <Button onClick={onCreate}>Criar categoria</Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="hub-categories-list" aria-label="Lista de categorias">
        {categories.map((category) => <article className="hub-category-row" key={category.id}><CategoryIdentity category={category} /><div className="hub-category-products"><Package aria-hidden="true" size={17} /><span>{productSummary(category)}</span></div><CategoryActions category={category} onEdit={onEdit} onDelete={onDelete} /></article>)}
      </div>
      <div className="hub-categories-mobile-list" aria-label="Lista de categorias">
        {categories.map((category) => <article className="hub-category-card" key={category.id}><CategoryIdentity category={category} /><div className="hub-category-products"><Package aria-hidden="true" size={17} /><span>{productSummary(category)}</span></div><CategoryActions category={category} onEdit={onEdit} onDelete={onDelete} /></article>)}
      </div>
    </>
  );
};
