<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <title>Redefinir senha</title>
</head>
<body>
    <main>
        <h1>Redefinir senha</h1>
        <p>Crie uma senha forte para concluir o acesso à sua conta.</p>

        <form method="POST" action="{{ url('/api/clientes/processar-senha') }}">
            <input type="hidden" name="token" value="{{ $token }}">
            <input type="hidden" name="email" value="{{ $email }}">

            <label for="password">Nova senha</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required minlength="12">

            <label for="password_confirmation">Confirmar nova senha</label>
            <input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required minlength="12">

            <button type="submit">Salvar nova senha</button>
        </form>
    </main>
</body>
</html>
