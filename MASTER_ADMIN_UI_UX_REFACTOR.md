# MASTER_ADMIN_UI_UX_REFACTOR.md

## Papel do agente

Atue simultaneamente como **Senior Product Designer**, **UX Architect**, **Design Systems Engineer**, **Senior Front-end Engineer** e **Product Architect**.

Este arquivo é a diretriz mestre para refatoração de módulos administrativos do HUB. Ele deve ser aplicado em conjunto com o arquivo ui-ux-guidelines.md, que continua sendo a fonte obrigatória de padrões visuais e de UX já adotados pelo projeto.

> Regra de precedência: preserve regras de negócio, contratos de API e integridade dos dados. Melhorias visuais nunca podem quebrar comportamento existente.

---
> Obrigatório: Reestruturação de Arquivos Devido ao tamanho das novas especificações, manter tudo em um arquivo só causará um gargalo de manutenção gigantesco (+4.000 linhas) Planejo criar a pasta resources/js/Modulos/Admin/nome da pasta referente ao arquivo que estamos trabalhando, para armazenar os subcomponentes, mantendo o arquivo principal atual apenas como a "casca" principal (entry point) para não quebrar o roteamento do Laravel. Sempre que puder, coloque os nomes dos arquivos e pastas em pt-br para melhor identificação, não crie nomes de arquivos iguais para não confudir.

# 1. Objetivo global

Refatorar interfaces administrativas para que tenham padrão de produto SaaS/e-commerce profissional, reduzindo carga cognitiva, melhorando velocidade operacional e criando uma linguagem visual única.

A solução deve:

- parecer parte de um único sistema, não um conjunto de telas independentes;
- reduzir excesso de bordas, sombras, gradientes e cores sem função semântica;
- tornar hierarquia, navegação, filtros, ações e estados imediatamente compreensíveis;
- priorizar produtividade de operadores que usam a interface diariamente;
- ser responsiva e acessível;
- suportar crescimento de funcionalidades sem transformar cada página em um componente monolítico;
- manter compatibilidade com as regras de negócio existentes.

---

# 2. Processo obrigatório antes de alterar código

Antes de refatorar qualquer tela:

1. Ler integralmente ui-ux-guidelines.md.
2. Ler a página alvo e seus componentes filhos.
3. Mapear:
   - componentes;
   - hooks;
   - stores/contextos;
   - schemas de validação;
   - rotas;
   - chamadas de API;
   - queries/mutations;
   - permissões;
   - feature flags;
   - eventos de analytics;
   - toasts/notificações;
   - dependências com outros módulos.
4. Identificar estados existentes:
   - loading;
   - vazio;
   - erro;
   - sucesso;
   - disabled;
   - somente leitura;
   - permissões insuficientes;
   - alterações não salvas.
5. Registrar quais comportamentos são regras de negócio e **não podem ser removidos**.
6. Só então propor a nova composição visual e a divisão de componentes.

Não substituir endpoints, formatos de payload, nomes de propriedades, regras fiscais ou integrações sem necessidade técnica comprovada.

---

# 3. Princípios de UI/UX

## 3.1 Hierarquia

Toda página administrativa deve possuir, quando aplicável:

- título claro;
- subtítulo curto;
- ação primária;
- ações secundárias;
- navegação local;
- área de filtros;
- área de conteúdo;
- estados de feedback.

Evitar títulos gigantes que consumam espaço operacional. O título deve ter presença, mas não competir com o conteúdo.

## 3.2 Navegação local

Manter o conceito visual de **menu afundado / recessed segmented navigation**, pois ele é uma identidade aprovada.

Regras:

- container com aparência sutilmente rebaixada;
- item ativo elevado visualmente dentro do trilho;
- contraste acessível;
- foco de teclado claramente visível;
- `aria-selected`, `role="tab"` e estrutura correta quando for uma interface de tabs;
- navegação por teclado;
- em mobile, permitir scroll horizontal sem quebrar o layout.

Não usar cor diferente para cada aba sem significado semântico.

## 3.3 Cores

Usar:

- uma cor primária de marca para ações;
- neutros para estrutura;
- verde para sucesso;
- amarelo/âmbar para atenção;
- vermelho para erro/perigo;
- azul informativo quando necessário.

Não utilizar arco-íris visual para diferenciar seções que já possuem título e ícone.

## 3.4 Densidade

Interfaces administrativas precisam ser densas o suficiente para produtividade, mas não apertadas.

Padronizar:

- altura de inputs;
- espaçamento vertical;
- largura máxima;
- gaps de grids;
- headings;
- cards;
- toolbars;
- tabelas.

## 3.5 Ações

Cada área deve ter uma ação primária inequívoca.

Nunca criar duas ações primárias concorrentes no mesmo contexto.

Ações destrutivas devem ser visivelmente diferentes e exigir confirmação quando houver risco real de perda.

---

# 4. Padrão mestre de botões

Criar/usar componentes reutilizáveis:

- `ButtonPrimary`
- `ButtonSecondary`
- `ButtonGhost`
- `ButtonDanger`
- `IconButton`
- `SplitAction` ou menu de ações quando necessário

Estados obrigatórios:

- default;
- hover;
- focus-visible;
- pressed;
- disabled;
- loading;
- success temporário;
- error quando fizer sentido.

Para ações de salvamento:

- estado inicial: `Salvar alterações` ou `Salvar produto`;
- durante request: spinner + `Salvando...`;
- sucesso: check + `Salvo`;
- depois de aproximadamente 1,5–2,5 s retornar ao rótulo padrão;
- erro: preservar formulário e mostrar feedback acionável.

Suportar `Ctrl+S` / `Cmd+S` em editores onde não conflite com comportamento do navegador.

---

# 5. Padrão mestre de notificações e alterações

Criar um sistema consistente de feedback.

## Toasts

Tipos:

- success;
- info;
- warning;
- error.

Requisitos:

- título curto;
- descrição opcional;
- `aria-live`;
- não bloquear trabalho;
- sucesso pode desaparecer automaticamente;
- erros importantes permanecem até ação do usuário ou tempo maior;
- quando possível, oferecer ação contextual como `Ver erros`.

Exemplos:

- `Produto salvo com sucesso.`
- `3 campos precisam de atenção antes da publicação.`
- `Não foi possível atualizar o estoque. Tentar novamente.`

## Alterações não salvas

Quando um formulário sofrer alteração:

- mostrar indicador `Alterações não salvas`;
- não perder dados silenciosamente;
- ao tentar sair, abrir confirmação;
- diferenciar claramente `Salvar`, `Descartar alterações` e `Continuar editando`.

---

# 6. Padrão de filtros

Filtros devem ser produtivos, não decorativos.

Criar um padrão reutilizável `FilterBar + FilterPopover/Drawer`.

## Date range

Sempre que houver dados históricos, suportar:

- Hoje;
- Ontem;
- Últimos 7 dias;
- Últimos 30 dias;
- Este mês;
- Mês anterior;
- Este trimestre;
- Este ano;
- Período personalizado.

O período personalizado deve ter:

- Data inicial;
- Data final;
- validação de ordem;
- botão Limpar;
- botão Aplicar;
- resumo do período aplicado.

Quando fizer sentido, suportar comparação:

- período anterior;
- mesmo período do ano anterior;
- período personalizado.

## Outros padrões

- filtros ativos como chips removíveis;
- contador de filtros aplicados;
- `Limpar tudo`;
- filtros persistidos na URL quando tecnicamente adequado;
- possibilidade de `Salvar visualização` em módulos com alto uso operacional;
- presets de negócio, como `Estoque baixo`, `Sem imagem`, `Com erro fiscal`.

---

# 7. Busca

Busca administrativa deve aceitar o máximo possível de identificadores úteis.

Exemplos:

- nome;
- SKU;
- ID;
- GTIN/EAN;
- fornecedor;
- marca.

Implementar debounce quando houver consulta remota.

Mostrar estado sem resultado com ação para limpar filtros.

---

# 8. Tabelas

Criar padrão reutilizável para tabelas operacionais.

Recursos desejáveis quando aplicáveis:

- cabeçalho sticky;
- ordenação;
- seleção de linhas;
- ações em massa;
- paginação;
- quantidade por página;
- coluna de ações;
- skeleton loading;
- estado vazio;
- estado de erro;
- colunas configuráveis;
- preservação dos filtros;
- exportação;
- ações rápidas sem entrar no detalhe.

Em telas pequenas:

- manter tabelas realmente tabulares com scroll horizontal; ou
- converter em cards apenas se não houver perda de comparação entre linhas.

---

# 9. Cards e métricas

Cards de KPI devem conter somente informação útil.

Um KPI pode ter:

- nome;
- valor;
- variação;
- comparação;
- mini tendência;
- tooltip de definição;
- link para detalhamento.

Evitar cards gigantes para números simples.

Criar suporte a:

- reordenar métricas;
- ocultar/exibir métricas;
- catálogo de métricas;
- definição da fórmula;
- origem do dado;
- data/hora da última atualização.

---

# 10. Atualização de dados

Padronizar o botão de refresh.

Estados:

- normal;
- carregando com rotação/spinner;
- sucesso silencioso;
- erro.

Sempre que possível exibir:

`Atualizado há X min`

Para dashboards de tempo real ou quase real, considerar:

- auto-refresh opcional;
- seletor de frequência;
- pausa automática quando a aba estiver em background.

---

# 11. Formulários

Regras:

- labels visíveis;
- placeholder nunca substitui label;
- campos obrigatórios identificados;
- helper text quando necessário;
- validação próxima ao campo;
- resumo de erros em formulários longos;
- foco levado ao primeiro erro após tentativa de envio;
- server-side validation continua obrigatória;
- não usar somente cor para indicar erro.

Campos dependentes devem aparecer somente quando forem relevantes.

Exemplo: habilitar campos de prazo apenas quando `Vender por encomenda` estiver ativo.

---

# 12. Estados vazios

Todo estado vazio deve explicar:

1. o que aconteceu;
2. por que o usuário está vendo aquilo;
3. qual a próxima ação possível.

Evitar apenas `Nenhum dado`.

Exemplo:

`Nenhum produto encontrado com estes filtros.`
`Limpe os filtros ou cadastre um novo produto.`

---

# 13. Acessibilidade

Objetivo mínimo: boas práticas alinhadas a WCAG 2.2 AA.

Obrigatório:

- navegação por teclado;
- foco visível;
- contraste adequado;
- semântica HTML;
- labels;
- `aria-describedby` para mensagens;
- `aria-invalid` apenas após erro de validação;
- tabs com papéis/estados adequados;
- modais com focus trap;
- retorno de foco ao fechar modal;
- botões de ícone com nome acessível;
- áreas de toast com live region.

---

# 14. Responsividade

Testar no mínimo:

- desktop largo;
- notebook;
- tablet;
- mobile.

Não apenas diminuir tudo.

Em mobile:

- reorganizar grids;
- permitir navegação horizontal de tabs;
- ações críticas podem ficar em sticky bottom bar;
- filtros complexos podem abrir como drawer/sheet;
- preservar alvos de toque confortáveis.

---

# 15. Arquitetura front-end

Evitar arquivos gigantes.

Preferir uma estrutura semelhante a:

```text
Module/
  page/
  components/
  sections/
  filters/
  dialogs/
  hooks/
  schemas/
  services/
  utils/
  constants/
  types/
```

Separar:

- apresentação;
- estado;
- validação;
- fetch/mutations;
- regras derivadas;
- formatação.

Componentes reutilizáveis devem ser extraídos quando houver repetição real, não apenas por abstração prematura.

---

# 16. Performance

Aplicar quando fizer sentido:

- memoização apenas onde há ganho;
- debounce de busca;
- paginação server-side para grandes datasets;
- lazy loading de áreas pesadas;
- preview de mídia sem bloquear a tela;
- compressão/validação de uploads;
- evitar refetch redundante;
- cancelar requests obsoletos;
- não renderizar listas massivas sem estratégia.

---

# 17. Auditoria e segurança

Para operações críticas, registrar:

- usuário/ator;
- data/hora;
- ação;
- entidade;
- valor anterior;
- valor novo;
- origem da alteração;
- resultado.

Não mostrar informações sensíveis desnecessariamente.

Permissões devem continuar sendo validadas no backend; esconder botão no front-end não é segurança.

---

# 18. Critérios de aceite para qualquer refatoração

A tarefa só é considerada concluída quando:

- nenhuma regra de negócio existente foi removida;
- não há erro de console relevante;
- requests existentes continuam corretos;
- loading/empty/error/success foram tratados;
- layout funciona em diferentes larguras;
- navegação por teclado funciona;
- botões têm estados de loading;
- formulários não perdem dados silenciosamente;
- textos, labels e estados são coerentes;
- componentes duplicados foram consolidados quando apropriado;
- o código ficou mais fácil de manter que o original.

---

# 19. Forma de entrega do agente

Ao concluir uma refatoração, entregar:

1. resumo do diagnóstico;
2. arquitetura proposta;
3. arquivos criados/alterados;
4. código implementado;
5. regras de negócio preservadas;
6. melhorias de UX;
7. melhorias de acessibilidade;
8. testes realizados;
9. pontos que dependem do backend;
10. próximos incrementos sugeridos.

Não entregar apenas um mock visual. A tela final precisa estar integrada ao comportamento real existente.

Padronização de Menus (Global)
Agora, todos utilizam o estilo "afundado cinza" com formato reduzido (text-[10px] e sm:text-[11px]), caixa alta (uppercase) e espaçamento correto de letras (tracking-widest).