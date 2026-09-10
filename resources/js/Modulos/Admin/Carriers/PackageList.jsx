import React from 'react';
import { Box, Edit3, Star, Trash2 } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';

const PackageActions = ({ item, onEdit, onDelete }) => (
  <div className="hub-carriers-actions">
    <IconButton icon={Edit3} label={'Editar ' + item.nome} onClick={() => onEdit(item)} />
    <IconButton icon={Trash2} label={'Excluir ' + item.nome} variant="danger" onClick={() => onDelete(item)} />
  </div>
);

const PackageIdentity = ({ item }) => (
  <div className="hub-carrier-identity">
    <span className="hub-carrier-logo"><Box aria-hidden="true" size={20} /></span>
    <div className="hub-carrier-main">
      <div className="hub-carrier-name-row">
        <strong className="hub-carrier-name">{item.nome}</strong>
        {item.is_default ? <Badge variant="special"><Star aria-hidden="true" size={13} /> Padrão</Badge> : null}
      </div>
      <p className="hub-carrier-meta">{item.altura} × {item.largura} × {item.comprimento} cm · {item.peso_vazio} kg</p>
    </div>
  </div>
);

export const PackageList = ({ packages, loading, onEdit, onDelete }) => {
  if (loading) {
    return <div className="hub-carriers-list" aria-busy="true" aria-label="Carregando embalagens">{Array.from({ length: 3 }, (_, index) => <div className="hub-carrier-row" key={index}><Skeleton className="h-12 w-56" /><Skeleton className="h-10 w-24" /></div>)}</div>;
  }

  if (!packages.length) {
    return <section className="hub-carriers-empty"><div><Box aria-hidden="true" size={28} /><h2>Nenhuma embalagem salva</h2><p>Cadastre dimensões e peso reais para disponibilizá-los no despacho.</p></div></section>;
  }

  return (
    <>
      <div className="hub-carriers-list" aria-label="Lista de embalagens">
        {packages.map((item) => <article className="hub-carrier-row" key={item.id}><PackageIdentity item={item} /><div className="hub-carrier-stat"><span>Peso vazio</span><strong>{item.peso_vazio} kg</strong></div><PackageActions item={item} onEdit={onEdit} onDelete={onDelete} /></article>)}
      </div>
      <div className="hub-carriers-mobile-list" aria-label="Lista de embalagens">
        {packages.map((item) => <article className="hub-carriers-card" key={item.id}><PackageIdentity item={item} /><PackageActions item={item} onEdit={onEdit} onDelete={onDelete} /></article>)}
      </div>
    </>
  );
};
