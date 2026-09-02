# Backend Laravel

## Camadas

- FormRequest: validação e autorização inicial.
- Policy/Gate: permissão sobre recurso e tenant.
- Action/Service: caso de uso e transação.
- Model: relações, casts e invariantes simples.
- Resource: contrato de resposta.
- Job/Event: efeitos assíncronos e integração desacoplada.

Controllers não geram HTML extenso, não contêm integração completa com fornecedores e não executam cálculos financeiros complexos.

## Persistência

- Usar fillable explícito para dados persistidos.
- Proibido guarded apenas com id em modelos de negócio.
- Usar validated() e mapear campos deliberadamente.
- Casos financeiros, estoque, carteira e cupons usam DB transaction e lock quando houver concorrência.
- Estados usam enums e máquina de transição; strings livres são proibidas.
- Datas usam CarbonImmutable quando possível.

## APIs

- Versionar contratos públicos quando houver consumidores externos.
- Padronizar respostas de sucesso/erro e códigos HTTP.
- Paginação e limites são obrigatórios em listagens.
- Route model binding deve estar tenant-scoped.
- Endpoints públicos não reutilizam controllers administrativos.

## Filas e serviços externos

- Jobs definem tries, timeout, backoff e failed().
- Não serializar segredos no payload; resolver credencial criptografada no handle pelo tenant.
- Operações repetíveis precisam ser idempotentes.
- Não usar timeout=0 em produção.
- Falhas de Redis/cache não podem criar leitura cruzada ou inconsistência silenciosa.
