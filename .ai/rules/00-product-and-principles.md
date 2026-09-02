# Produto e princípios

O HUB Commerce é uma plataforma SaaS B2B multitenant para criação e operação de e-commerces. Cada tenant representa uma empresa/loja e pode possuir domínios, usuários, catálogo, pedidos, configurações e integrações próprios.

## Princípios

1. Isolamento e segurança antes de velocidade de implementação.
2. Integridade financeira antes de conveniência visual.
3. Contratos explícitos entre frontend, backend e fornecedores.
4. Experiência consistente entre módulos administrativos.
5. Loja pública rápida, acessível, indexável e independente do painel.
6. Observabilidade sem exposição de dados pessoais ou segredos.
7. Evolução incremental com compatibilidade e migrations reproduzíveis.

## Regras de produto

- Não apresentar recurso simulado como concluído.
- Recursos incompletos devem estar desativados por feature flag e identificados como indisponíveis.
- Valores, status e métricas exibidos devem vir de fonte real e documentada.
- Fluxos destrutivos ou financeiros exigem confirmação, auditoria e autorização.
- Estados vazios, loading, erro e sucesso são obrigatórios.
- Todo texto novo deve usar português do Brasil e glossário consistente.
- Não misturar regras de Portugal e Brasil no mesmo tenant; internacionalização deve ser configurável.
