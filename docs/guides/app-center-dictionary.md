# Dicionário da Central de Apps

- **Sandbox/Teste:** ambiente sem cobrança real.
- **Produção:** ambiente com cobrança real.
- **OAuth/Connect:** autorização para o Hub Commerce agir em nome da conta do lojista, sem copiar senha.
- **Chave pública:** identificador usado pelo componente oficial do checkout; não autoriza operações sensíveis.
- **Chave secreta:** credencial privada usada somente pelo backend.
- **Webhook:** notificação assinada enviada pelo gateway ao Hub Commerce.
- **Assinatura do webhook:** prova criptográfica de origem do evento.
- **Tokenização:** o gateway recebe dados sensíveis; o Hub Commerce não armazena cartão.
- **Conciliação:** confirmação periódica do estado externo para detectar divergências.
