import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChartNoAxesCombined, Crown, LockKeyhole, Settings2, ShieldAlert, UsersRound } from 'lucide-react';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import './customers.css';

const sections = [
  {
    value: 'PAINEL', label: 'Painel', icon: ChartNoAxesCombined,
    title: 'Indicadores indisponíveis por enquanto',
    description: 'Os indicadores só serão exibidos quando pedidos e métricas estiverem isolados pela loja atual.',
  },
  {
    value: 'CLIENTES', label: 'Clientes', icon: UsersRound,
    title: 'Diretório de clientes indisponível por enquanto',
    description: 'A busca, o perfil e as ações de atendimento aguardam um cadastro de clientes vinculado à loja atual.',
  },
  {
    value: 'VIP', label: 'Benefícios VIP', icon: Crown,
    title: 'Benefícios VIP indisponíveis por enquanto',
    description: 'Regras de VIP, carteira e segmentação só serão liberadas com dados e cálculo auditáveis por loja.',
  },
  {
    value: 'CONFIG', label: 'Configurações', icon: Settings2,
    title: 'Configurações de CRM indisponíveis por enquanto',
    description: 'As regras de cadastro e relacionamento aguardam uma configuração própria e autorizada para cada loja.',
  },
];

export default function CustomersPage() {
  const [activeSection, setActiveSection] = useState('PAINEL');
  const section = useMemo(() => sections.find((item) => item.value === activeSection) || sections[0], [activeSection]);
  const SectionIcon = section.icon;

  return (
    <main className="hub-customers-page">
      <Helmet>
        <title>Clientes | Hub Commerce</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <header className="hub-customers-heading">
        <div>
          <p className="hub-customers-eyebrow">Relacionamento e retenção</p>
          <h1>Clientes</h1>
          <p>Centralize o relacionamento com privacidade e controles próprios para cada loja.</p>
        </div>
      </header>

      <SectionTabs ariaLabel="Seções de clientes" items={sections} value={activeSection} onChange={setActiveSection} />

      <section className="hub-customers-surface hub-stable-data-region" aria-labelledby="customers-unavailable-title">
        <div className="hub-customers-unavailable" role="status">
          <span className="hub-customers-icon" aria-hidden="true"><SectionIcon size={28} /></span>
          <p className="hub-customers-eyebrow">Área protegida</p>
          <h2 id="customers-unavailable-title">{section.title}</h2>
          <p>{section.description}</p>
          <div className="hub-customers-requirement">
            <LockKeyhole aria-hidden="true" size={18} />
            <p>Nenhum dado ou ação é disponibilizado até que clientes, pedidos, benefícios e configurações estejam vinculados e autorizados para a loja atual.</p>
          </div>
        </div>

        <aside className="hub-customers-assurance" aria-label="Proteção de dados de clientes">
          <ShieldAlert aria-hidden="true" size={20} />
          <div>
            <strong>Privacidade antes da operação</strong>
            <p>Esta proteção impede que dados de outra loja apareçam no painel durante a evolução do CRM.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
