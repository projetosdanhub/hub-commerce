# Frontend React

## Estrutura

Separar admin e storefront. Organizar por feature com components, hooks, api, schemas, tests e pages. Componentes de página orquestram; componentes menores renderizam.

## Contratos

- Usar um cliente HTTP por aplicação com baseURL relativa/configurada.
- Storefront nunca chama endpoint /admin.
- Dados remotos usam React Query com keys contendo tenant e parâmetros.
- Não duplicar estado remoto em múltiplos componentes.
- Formulários devem possuir schema compartilhado e mensagens acessíveis.
- Tratar 401, 403, 404, 409, 422 e 5xx explicitamente.

## Segurança

- Não armazenar token administrativo persistente no localStorage.
- Nunca renderizar HTML não confiável com dangerouslySetInnerHTML.
- postMessage exige targetOrigin explícito e validação de origin, source e schema.
- URLs vindas do usuário devem ser validadas.
- Não registrar PII, payload de checkout ou respostas sensíveis no console.

## Qualidade

- Evitar componentes acima de 300 linhas; exceções precisam de justificativa.
- Nenhum módulo novo pode usar dados mockados em caminho de produção.
- Remover strings de domínio, pessoas, produtos e imagens de demonstração do código.
- Rotas administrativas devem ser lazy-loaded e protegidas também pelo backend.
- Preferir TypeScript em módulos novos; migração do legado será incremental.
- Estados loading, empty, error e success são obrigatórios.
