import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageSquareText, ShieldCheck } from 'lucide-react';
import './reviews.css';

export default function ReviewsPage() {
  return (
    <main className="hub-reviews-page">
      <Helmet>
        <title>Avaliações | Hub Commerce</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <header className="hub-reviews-heading">
        <div>
          <p className="hub-reviews-eyebrow">Reputação da loja</p>
          <h1>Avaliações</h1>
          <p>Acompanhe a confiança dos clientes com uma moderação protegida por loja.</p>
        </div>
      </header>

      <section className="hub-reviews-surface hub-stable-data-region" aria-labelledby="reviews-unavailable-title">
        <div className="hub-reviews-unavailable" role="status">
          <span className="hub-reviews-icon" aria-hidden="true"><MessageSquareText size={28} /></span>
          <p className="hub-reviews-eyebrow">Controle protegido</p>
          <h2 id="reviews-unavailable-title">Avaliações indisponíveis por enquanto</h2>
          <p>Nenhuma avaliação é exibida ou pode ser moderada até que cada registro esteja vinculado à loja, à autoria confirmada e ao produto autorizado.</p>
          <div className="hub-reviews-requirement">
            <ShieldCheck aria-hidden="true" size={18} />
            <p>A liberação depende de um contrato auditável de autoria e status para proteger os dados de cada lojista.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
