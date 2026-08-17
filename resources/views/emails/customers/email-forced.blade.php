<x-mail::message>
# Olá, {{ explode(' ', trim($nomeCliente))[0] }}!

Este é um aviso de segurança automático. O e-mail principal de acesso da sua conta foi alterado recentemente por nossa equipe de atendimento.

**Novo E-mail de Login:** `{{ $novoEmail }}`
**Motivo Registrado:** {{ $motivo }}

Todas as comunicações futuras e redefinições de senha serão enviadas para este novo e-mail.

Se você não solicitou ou desconhece esta alteração, **entre em contato com o suporte imediatamente** para garantirmos a segurança da sua conta.

Atenciosamente,<br>
A Equipe {{ config('app.name') }}
</x-mail::message>