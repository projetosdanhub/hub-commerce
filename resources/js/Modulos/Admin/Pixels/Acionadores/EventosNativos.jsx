import React from 'react';
import { CheckCircle2, Power, PowerOff } from 'lucide-react';
import { Badge } from '../../DesignSystem/primitives/Badge';
import { Button } from '../../DesignSystem/primitives/Button';
import { nativeEventsList } from '../Compartilhado/ConstantesPixels';
import { AnimatedToggle, SafeTooltip } from '../Compartilhado/ComponentesUIPixels';

const EventosNativos = ({ eventosNativos, setEventosNativos, isSaving, onSave, isAllNativosAtivos, onToggleAll }) => (
  <section className="hub-surface">
    <header className="hub-order-detail-heading">
      <div className="flex items-center gap-3">
        <span className="hub-orders-metric-icon"><CheckCircle2 aria-hidden="true" size={20} /></span>
        <div>
          <p className="hub-page-eyebrow">Data Layer</p>
          <h2 className="hub-card-title">Eventos nativos</h2>
          <p className="hub-page-subtitle">Ative apenas os eventos que devem ser enviados pela sua operação.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant={isAllNativosAtivos ? 'danger' : 'secondary'} icon={isAllNativosAtivos ? PowerOff : Power} onClick={() => onToggleAll(!isAllNativosAtivos)}>
          {isAllNativosAtivos ? 'Desligar todos' : 'Ligar todos'}
        </Button>
        <Button size="sm" loading={isSaving} onClick={onSave}>Salvar eventos</Button>
      </div>
    </header>

    <div className="hub-order-table-wrap">
      <table className="hub-order-table">
        <thead>
          <tr><th>Evento oficial</th><th>Quando é disparado</th><th>Payload</th><th className="text-center">Ativo</th></tr>
        </thead>
        <tbody>
          {nativeEventsList.map((event) => (
            <tr key={event.key}>
              <td><div className="flex items-center gap-2"><strong className="font-mono">{event.nome}</strong>{['Purchase', 'AddToCart', 'InitiateCheckout'].includes(event.nome) ? <Badge variant="warning">Essencial</Badge> : null}</div></td>
              <td>{event.desc}</td>
              <td><SafeTooltip text={`Parâmetros previstos para este evento: ${event.layer}`} title="Parâmetros do evento" /></td>
              <td className="text-center"><AnimatedToggle active={Boolean(eventosNativos[event.key])} onChange={(value) => setEventosNativos((current) => ({ ...current, [event.key]: value }))} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default EventosNativos;
