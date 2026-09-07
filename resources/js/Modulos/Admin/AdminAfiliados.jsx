import React from 'react';
import { Handshake, UsersRound } from 'lucide-react';
import { OperationalState } from './OperationalState';

const AdminAffiliates = () => (
  <main className="hub-growth-page">
    <header className="hub-page-heading">
      <div>
        <p className="hub-page-eyebrow"><Handshake aria-hidden="true" size={16} /> Crescimento</p>
        <h1 className="hub-page-title">Afiliados</h1>
        <p className="hub-page-description">Parceiros, comissões, cupons de indicação e saques serão operados como um domínio próprio da loja.</p>
      </div>
    </header>

    <OperationalState
      icon={UsersRound}
      title="Programa de afiliados"
      description="O módulo legado não possui isolamento por tenant nem um livro-razão auditável de comissão. A interface será aberta junto da migração do domínio, sem trazer cadastros, saldos ou saques simulados."
      rule="Comissão só nasce de evento financeiro elegível, é idempotente e permanece separada do saldo de Hub Coins."
    />
  </main>
);

export default AdminAffiliates;
