import React, { useMemo, useState } from 'react';
import { BookOpen, KeyRound, Search, ShieldCheck } from 'lucide-react';
import { Badge } from '../../DesignSystem/primitives/Badge';

const chapters = [
  { provider: 'Stripe', topic: 'Connect', body: 'Clique em Conectar, conclua o onboarding Stripe Connect e aguarde o estado Autenticado. Não copie chaves.', tags: ['oauth', 'connect', 'sandbox'] },
  { provider: 'Mercado Pago', topic: 'OAuth', body: 'Autorize a conta do Mercado Pago no redirecionamento seguro. O Hub Commerce guarda o token criptografado.', tags: ['oauth', 'pix', 'boleto'] },
  { provider: 'PagBank', topic: 'OAuth', body: 'Conecte a conta PagBank e use Sandbox antes de habilitar Produção.', tags: ['oauth', 'pix', 'boleto'] },
  { provider: 'Pagar.me', topic: 'Chaves API', body: 'Informe as chaves pública e secreta do ambiente. Elas não voltam a aparecer depois de salvas.', tags: ['api', 'sandbox', 'webhook'] },
  { provider: 'Melhor Envio', topic: 'OAuth', body: 'Clique em Conectar com Melhor Envio, autorize a conta e retorne à loja. Tokens e renovação ficam cifrados no backend.', tags: ['oauth', 'frete', 'sandbox'] },
  { provider: 'Todos', topic: 'Webhooks', body: 'O endpoint é gerado pelo Hub Commerce. Não use o domínio da loja para receber eventos financeiros.', tags: ['webhook', 'segurança'] },
];

export const AppGuides = () => {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('Todos');
  const visible = useMemo(() => chapters.filter((chapter) => (
    (provider === 'Todos' || chapter.provider === provider)
    && [chapter.provider, chapter.topic, chapter.body, ...chapter.tags].join(' ').toLowerCase().includes(query.toLowerCase())
  )), [provider, query]);

  return <section className="hub-app-guides hub-surface">
    <header><span><BookOpen size={21} aria-hidden="true" /></span><div><h2>Guia de conexões</h2><p>Pesquise termos, escolha um gateway e siga somente os passos do seu ambiente.</p></div></header>
    <div className="hub-app-guides-controls"><label><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar OAuth, PIX, webhook…" /></label><select value={provider} onChange={(event) => setProvider(event.target.value)}>{['Todos', 'Stripe', 'Mercado Pago', 'PagBank', 'Pagar.me', 'Melhor Envio'].map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="hub-app-guides-book">{visible.map((chapter) => <article key={chapter.provider + chapter.topic}><div><KeyRound size={17} aria-hidden="true" /><strong>{chapter.provider} · {chapter.topic}</strong></div><p>{chapter.body}</p><footer>{chapter.tags.map((tag) => <Badge key={tag} variant="neutral">{tag}</Badge>)}<Badge variant="success"><ShieldCheck size={14} aria-hidden="true" /> Seguro</Badge></footer></article>)}</div>
  </section>;
};
