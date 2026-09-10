# Branch Protection (QA-011)

A branch `main` deste repositório está configurada com regras estritas de proteção para garantir a qualidade, segurança e estabilidade do código. A configuração destas regras é manual na interface do GitHub (`Settings > Branches > Branch protection rules`).

## Regras Aplicadas

1. **Require pull request reviews before merging**:
   - É necessário que todas as alterações passem por um Pull Request antes de serem unidas à branch `main`.
2. **Require status checks to pass before merging**:
   - As seguintes pipelines do GitHub Actions DEVEM passar (ficar verdes) antes que o merge seja liberado:
     - `test` (Larastan, Pint, Vitest, PHPUnit)
     - `gitleaks` (Security Scan)
     - `e2e` (Playwright)
3. **Do not allow bypassing the above settings**:
   - Nem mesmo os administradores do repositório podem contornar essas regras (opcional, mas recomendado para o ambiente de produção).

Essa proteção de branch impede a quebra acidental da `main` e reforça o processo de integração contínua (CI).
