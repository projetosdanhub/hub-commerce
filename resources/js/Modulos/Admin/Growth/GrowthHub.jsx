import React, { useMemo, useState } from 'react';
import {
  BadgePercent,
  Coins,
  Gift,
  HeartHandshake,
  Megaphone,
  Store,
  Target,
  Ticket,
  Trophy,
  UsersRound,
} from 'lucide-react';
import { SectionTabs } from '../DesignSystem/patterns/SectionTabs';
import { OperationalState } from './OperationalState';

const marketingTabs = [
  {
    value: 'CAMPAIGNS',
    label: 'Campanhas',
    icon: Megaphone,
    title: 'Campanhas da loja',
    description: 'A criação e o acompanhamento de campanhas entram quando houver contrato tenant-scoped para público, vigência, orçamento e resultado.',
    rule: 'Nenhuma métrica, status ou campanha é exibida antes de existir uma consulta persistida e auditável.',
    links: [{ label: 'Ver benefícios e cupons', to: '/admin/beneficios' }],
  },
  {
    value: 'AUDIENCE',
    label: 'Audiência',
    icon: UsersRound,
    title: 'Audiências e segmentos',
    description: 'Segmentos usarão somente atributos permitidos da base de clientes da própria loja, com atualização rastreável.',
    rule: 'Filtros serão adicionados junto da query real; não haverá segmentação local ou contadores estimados.',
    links: [{ label: 'Abrir clientes', to: '/admin/clientes' }],
  },
  {
    value: 'RESULTS',
    label: 'Resultados',
    icon: Target,
    title: 'Resultados de marketing',
    description: 'O painel será alimentado por eventos validados e regras de atribuição documentadas, não por valores agregados no navegador.',
    rule: 'Períodos, filtros e dicionário de métricas pertencem ao contrato de consulta do domínio.',
    links: [{ label: 'Abrir pixels e eventos', to: '/admin/pixels' }],
  },
];

const benefitsTabs = [
  {
    value: 'COUPONS',
    label: 'Cupons',
    icon: Ticket,
    title: 'Cupons e benefícios',
    description: 'Cupons de produto e de frete terão regras, limites e uso por cliente persistidos no tenant antes de aparecerem para criação ou edição.',
    rule: 'Cupom de frete só pode ser aplicado após endereço válido e cotação de entrega selecionada.',
  },
  {
    value: 'COINS',
    label: 'Hub Coins',
    icon: Coins,
    title: 'Hub Coins',
    description: 'A carteira será um livro-razão imutável: créditos, débitos, expiração e reversões terão idempotência e origem auditável.',
    rule: 'Saldo exibido não será atualizado diretamente no perfil nem calculado no frontend.',
  },
  {
    value: 'REWARDS',
    label: 'Recompensas',
    icon: Gift,
    title: 'Recompensas',
    description: 'Critérios serão avaliados a partir de eventos de negócio aprovados, com regra, vigência, recompensa e idempotência configuráveis por loja.',
    rule: 'Nenhum critério legado de demonstração será distribuído como recompensa real.',
  },
  {
    value: 'STORE',
    label: 'Loja de Cupons',
    icon: Store,
    title: 'Loja de Cupons',
    description: 'O resgate consumirá Hub Coins por transação atômica e registrará o cupom emitido para aquele cliente.',
    rule: 'A vitrine de resgates só abre quando houver catálogo de recompensas e débito idempotente no ledger.',
  },
  {
    value: 'VIP',
    label: 'VIP',
    icon: Trophy,
    title: 'Benefícios VIP',
    description: 'O nível VIP continua ligado ao cliente, mas o cálculo e os benefícios serão consolidados por regra versionada antes de chegar ao carrinho e checkout.',
    rule: 'Descontos e fretes VIP serão calculados exclusivamente no servidor e registrados no snapshot do pedido.',
    links: [{ label: 'Abrir clientes', to: '/admin/clientes' }],
  },
];

export const MarketingHub = () => <GrowthHub area="marketing" />;
export const BenefitsHub = () => <GrowthHub area="benefits" />;

const GrowthHub = ({ area }) => {
  const tabs = area === 'benefits' ? benefitsTabs : marketingTabs;
  const [tab, setTab] = useState(tabs[0].value);
  const selected = useMemo(() => tabs.find((item) => item.value === tab) ?? tabs[0], [tab, tabs]);
  const Icon = selected.icon;
  const title = area === 'benefits' ? 'Benefícios & Fidelidade' : 'Marketing';
  const description = area === 'benefits'
    ? 'Reúna cupons, Hub Coins, recompensas e VIP sem misturar regras de preço, carteira e campanhas.'
    : 'Organize campanhas, audiência e resultados com dados reais, filtros auditáveis e regras por loja.';

  return (
    <main className="hub-growth-page">
      <header className="hub-page-heading">
        <div>
          <p className="hub-page-eyebrow">{area === 'benefits' ? <HeartHandshake aria-hidden="true" size={16} /> : <Megaphone aria-hidden="true" size={16} />}{area === 'benefits' ? 'Relacionamento' : 'Crescimento'}</p>
          <h1 className="hub-page-title">{title}</h1>
          <p className="hub-page-description">{description}</p>
        </div>
      </header>

      <SectionTabs ariaLabel={title} items={tabs} value={tab} onChange={setTab} />

      <OperationalState
        icon={Icon}
        title={selected.title}
        description={selected.description}
        rule={selected.rule}
        links={selected.links}
      />
    </main>
  );
};
