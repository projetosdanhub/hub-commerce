<x-mail::message>
# Olá, {{ explode(' ', trim($nomeCliente))[0] }}!

Recebemos uma solicitação do seu Gestor de Conta para atualizar o endereço de e-mail associado ao seu perfil.

**Novo E-mail Solicitado:** `{{ $novoEmail }}`

Para confirmar esta alteração e manter sua conta segura, por favor, clique no botão abaixo. Este link de segurança expira em **7 minutos**.

<x-mail::button :url="url('/api/clientes/confirmar-email?token=' . $token)">
Confirmar Novo E-mail
</x-mail::button>

Se você não estava aguardando esta alteração, por favor, ignore este e-mail ou entre em contato com nosso suporte.

Atenciosamente,<br>
A Equipe {{ config('app.name') }}
</x-mail::message>