import React from 'react';
import { ChartNoAxesCombined, Megaphone } from 'lucide-react';
import { OperationalState } from '../Growth/OperationalState';

const MarketingPage = () => (
  <main className="hub-growth-page">
    <header className="hub-page-heading">
      <div>
        <p className="hub-page-eyebrow"><Megaphone aria-hidden="true" size={16} /> Crescimento</p>
        <h1 className="hub-page-title">Marketing</h1>
        <p className="hub-page-description">Campanhas, segmentos e métricas serão organizados em subdomínios próprios, sempre com dados verificados da loja.</p>
      </div>
    </header>

    <OperationalState
      icon={ChartNoAxesCombined}
      title="Marketing em preparação"
      description="A implementação anterior era monolítica e apresentava campanhas, cupons e indicadores simulados. Ela foi removida do caminho de produção até que cada capacidade tenha contrato tenant-scoped."
      rule="Campanhas, métricas, cupons, recompensas e benefícios só serão exibidos ou alterados por consultas e regras reais do servidor."
    />
  </main>
);

export default MarketingPage;
