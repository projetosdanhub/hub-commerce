import React, { useState } from 'react';
import { BookOpen, KeyRound, ShieldCheck, ChevronRight } from 'lucide-react';
import { Badge } from '../../DesignSystem/primitives/Badge';
import { Button } from '../../DesignSystem/primitives/Button';
import { ModalDialog } from '../../DesignSystem/patterns/ModalDialog';

const chapters = [
  { provider: 'Stripe', topic: 'Connect', body: 'Clique em Conectar, conclua o onboarding Stripe Connect e aguarde o estado Autenticado. Não copie chaves.', tags: ['oauth', 'connect', 'sandbox'] },
  { provider: 'Mercado Pago', topic: 'OAuth', body: 'Autorize a conta do Mercado Pago no redirecionamento seguro. O Hub Commerce guarda o token criptografado.', tags: ['oauth', 'pix', 'boleto'] },
  { provider: 'PagBank', topic: 'OAuth', body: 'Conecte a conta PagBank e use Sandbox antes de habilitar Produção.', tags: ['oauth', 'pix', 'boleto'] },
  { provider: 'Pagar.me', topic: 'Chaves API', body: 'Informe as chaves pública e secreta do ambiente. Elas não voltam a aparecer depois de salvas.', tags: ['api', 'sandbox', 'webhook'] },
  { provider: 'Melhor Envio', topic: 'OAuth', body: 'Clique em Conectar com Melhor Envio, autorize a conta e retorne à loja. Tokens e renovação ficam cifrados no backend.', tags: ['oauth', 'frete', 'sandbox'] },
  { provider: 'Todos', topic: 'Webhooks', body: 'O endpoint é gerado pelo Hub Commerce. Não use o domínio da loja para receber eventos financeiros.', tags: ['webhook', 'segurança'] },
];

export const AppGuides = () => {
  const [activeChapter, setActiveChapter] = useState(chapters[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        icon={BookOpen} 
        onClick={() => setIsOpen(true)}
        aria-label="Guia de conexões"
        title="Guia de conexões"
      />

      {isOpen && (
        <ModalDialog 
          labelledBy="app-guides-title" 
          onClose={() => setIsOpen(false)}
          className="hub-app-guides-modal"
        >
          {(requestClose) => (
            <section className="hub-app-guides hub-surface">
              <header>
                <span><BookOpen size={21} aria-hidden="true" /></span>
                <div>
                  <h2 id="app-guides-title">Guia de conexões</h2>
                  <p>Consulte as instruções de integração para o seu gateway ou serviço.</p>
                </div>
              </header>
              
              <div className="hub-app-guides-container">
                <div className="hub-app-guides-sidebar">
                  {chapters.map((chapter) => (
                    <button
                      key={`${chapter.provider}-${chapter.topic}`}
                      type="button"
                      className={`hub-app-guides-item ${activeChapter === chapter ? 'is-active' : ''}`}
                      onClick={() => setActiveChapter(chapter)}
                    >
                      <div className="hub-app-guides-item-content">
                        <strong>{chapter.provider}</strong>
                        <span>{chapter.topic}</span>
                      </div>
                      <ChevronRight size={16} aria-hidden="true" className="hub-app-guides-chevron" />
                    </button>
                  ))}
                </div>
                
                <div className="hub-app-guides-detail">
                  <article>
                    <header className="hub-app-guides-detail-header">
                      <div className="hub-app-guides-detail-title">
                        <KeyRound size={20} aria-hidden="true" className="hub-app-guides-detail-icon" />
                        <h3>{activeChapter.provider} · {activeChapter.topic}</h3>
                      </div>
                      <div className="hub-app-guides-tags">
                        {activeChapter.tags.map((tag) => (
                          <Badge key={tag} variant="neutral">{tag}</Badge>
                        ))}
                        <Badge variant="success">
                          <ShieldCheck size={14} aria-hidden="true" /> Seguro
                        </Badge>
                      </div>
                    </header>
                    <div className="hub-app-guides-detail-body">
                      <p>{activeChapter.body}</p>
                    </div>
                  </article>
                </div>
              </div>
            </section>
          )}
        </ModalDialog>
      )}
    </>
  );
};
