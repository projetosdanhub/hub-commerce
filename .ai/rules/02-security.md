# Segurança e privacidade

Usar OWASP ASVS e OWASP API Security como base. Dados pessoais também devem cumprir LGPD.

## Identidade e acesso

- Login administrativo exige usuário ativo, papel permitido e rate limit.
- Autenticação e autorização são verificações separadas.
- Usar Policies/Gates e permissões por ação; não confiar apenas em esconder botões.
- Tokens devem expirar, ser revogáveis e possuir abilities mínimas.
- Preferir Sanctum SPA com cookie HttpOnly, Secure e SameSite adequado para first-party.
- Logout deve revogar sessão/token. Ações sensíveis podem exigir reautenticação e MFA.
- Nunca autorizar recursos somente pelo ID recebido.

## Entrada e saída

- Toda entrada usa FormRequest ou validator com allowlist, limites e normalização.
- Proibidos request->all, request->except e mass assignment aberto em operações persistentes.
- Respostas usam Resources/DTOs; segredos e campos internos nunca são serializados.
- Mensagens externas não incluem stack trace, getMessage ou body integral de fornecedor.
- HTML vindo de dados deve ser escapado ou sanitizado com política documentada.

## Segredos e integrações

- Segredos ficam no servidor, criptografados em repouso e nunca voltam completos ao frontend.
- Interfaces exibem apenas estado conectado e valor mascarado.
- Não colocar tokens em logs, URLs próprias, analytics, exceptions, jobs serializados ou commits.
- Chaves devem suportar rotação e separação test/live.
- Chamadas HTTP definem timeout, retry seguro, tratamento de status e observabilidade redigida.

## Arquivos e LGPD

- Documentos, comprovantes, RG, CNH, CPF e anexos privados usam disco private/S3 privado.
- Downloads passam por autorização e URL temporária.
- Validar MIME real, extensão, tamanho e, quando aplicável, antimalware.
- Definir finalidade, consentimento/base legal, retenção, exclusão e exportação.
- Logs mascaram CPF, telefone, e-mail, endereço, tokens e payloads sensíveis.

## Plataforma

- Produção exige HTTPS, HSTS, CSP, X-Content-Type-Options, Referrer-Policy e política de frame.
- APP_DEBUG=false e logs sem dados sensíveis.
- Endpoints públicos recebem rate limit, limite de payload e proteção contra abuso.
