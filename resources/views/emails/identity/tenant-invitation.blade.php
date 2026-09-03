<!DOCTYPE html>
<html lang="pt-BR">
<body>
    <p>Você foi convidado(a) para integrar a equipe da loja <strong>{{ $tenantName }}</strong>.</p>
    <p><a href="{{ $acceptUrl }}">Aceitar convite</a></p>
    <p>Por segurança, o convite expira em {{ $expiresAt->timezone('America/Sao_Paulo')->format('d/m/Y H:i') }}. Caso não reconheça este convite, ignore este e-mail.</p>
</body>
</html>
