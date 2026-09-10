import React from 'react';
import { Edit3, Trash2, Truck, ToggleLeft } from 'lucide-react';
import { Badge } from '../DesignSystem/primitives/Badge';
import { IconButton } from '../DesignSystem/primitives/IconButton';
import { Skeleton } from '../DesignSystem/primitives/Skeleton';

const statusVariant = (status) => (status === 'ATIVA' ? 'success' : 'warning');

const CarrierIdentity = ({ carrier }) => (
  <div className="hub-carrier-identity">
    <span className="hub-carrier-logo">
      {carrier.imagem ? <img src={carrier.imagem} alt="" /> : <Truck aria-hidden="true" size={20} />}
    </span>
    <div className="hub-carrier-main">
      <div className="hub-carrier-name-row">
        <strong className="hub-carrier-name">{carrier.nome}</strong>
        <Badge variant={statusVariant(carrier.status)}>{carrier.status === 'ATIVA' ? 'Ativa' : 'Inativa'}</Badge>
      </div>
      <p className="hub-carrier-meta">{carrier.tempo_entrega}</p>
    </div>
  </div>
);

const CarrierActions = ({ carrier, onEdit, onDelete, onChangeStatus }) => (
  <div className="hub-carriers-actions">
    <IconButton icon={Edit3} label={'Editar ' + carrier.nome} onClick={() => onEdit(carrier)} />
    <IconButton icon={ToggleLeft} label={'Alterar status de ' + carrier.nome} onClick={() => onChangeStatus(carrier)} />
    {Number(carrier.pedidos_count) === 0 ? (
      <IconButton icon={Trash2} label={'Excluir ' + carrier.nome} variant="danger" onClick={() => onDelete(carrier)} />
    ) : null}
  </div>
);

const CarrierLoading = () => (
  <div className="hub-carriers-list" aria-busy="true" aria-label="Carregando transportadoras">
    {Array.from({ length: 4 }, (_, index) => (
      <div className="hub-carrier-row" key={index}>
        <CarrierIdentity carrier={{ nome: ' ', tempo_entrega: ' ', status: 'ATIVA' }} />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    ))}
  </div>
);

export const CarrierList = ({ carriers, loading, onEdit, onDelete, onChangeStatus }) => {
  if (loading) return <CarrierLoading />;

  if (!carriers.length) {
    return (
      <section className="hub-carriers-empty">
        <div>
          <Truck aria-hidden="true" size={28} />
          <h2>Nenhuma transportadora própria cadastrada</h2>
          <p>Cadastre um parceiro somente quando houver uma operação de despacho definida para esta loja.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="hub-carriers-list" aria-label="Lista de transportadoras próprias">
        {carriers.map((carrier) => (
          <article className="hub-carrier-row" key={carrier.id}>
            <CarrierIdentity carrier={carrier} />
            <div className="hub-carrier-stat"><span>Pedidos vinculados</span><strong>{carrier.pedidos_count}</strong></div>
            <CarrierActions carrier={carrier} onEdit={onEdit} onDelete={onDelete} onChangeStatus={onChangeStatus} />
          </article>
        ))}
      </div>
      <div className="hub-carriers-mobile-list" aria-label="Lista de transportadoras próprias">
        {carriers.map((carrier) => (
          <article className="hub-carriers-card" key={carrier.id}>
            <CarrierIdentity carrier={carrier} />
            <div className="hub-carrier-stat"><span>Pedidos vinculados</span><strong>{carrier.pedidos_count}</strong></div>
            <CarrierActions carrier={carrier} onEdit={onEdit} onDelete={onDelete} onChangeStatus={onChangeStatus} />
          </article>
        ))}
      </div>
    </>
  );
};
