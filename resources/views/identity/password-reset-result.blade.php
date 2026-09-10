<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <title>{{ $success ? 'Senha redefinida' : 'Link inválido' }}</title>
</head>
<body>
    <main>
        @if ($success)
            <h1>Senha redefinida</h1>
            <p>Sua senha foi atualizada. Faça login novamente.</p>
        @else
            <h1>Não foi possível redefinir a senha</h1>
            <p>Este link é inválido, expirou ou já foi utilizado. Solicite uma nova redefinição.</p>
        @endif
    </main>
</body>
</html>
