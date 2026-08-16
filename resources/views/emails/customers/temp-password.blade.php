<x-mail::message>
# Olá, {{ explode(' ', trim($nomeCliente))[0] }}!

O seu Gestor de Relacionamento gerou uma senha provisória de acesso para a sua conta. 

Por rigorosos motivos de segurança, esta senha expira em exatamente **7 minutos**.

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 25px; margin-top: 15px;">
<span style="font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #0f172a;">{{ $senhaProvisoria }}</span>
</div>

Recomendamos que você acesse a sua conta agora mesmo e redefina esta senha no seu painel de controle.

<x-mail::button :url="config('app.url') . '/login'">
Acessar Minha Conta
</x-mail::button>

Se você não solicitou acesso ou desconhece esta ação, por favor, contate o nosso suporte imediatamente.

Atenciosamente,<br>
A Equipe {{ config('app.name') }}
</x-mail::message>