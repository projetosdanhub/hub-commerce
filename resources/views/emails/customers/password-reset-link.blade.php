<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
        <tr><td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0;">
                <tr><td style="background-color: #0f172a; padding: 28px 32px; border-bottom: 3px solid #10b981;"><h1 style="color: #ffffff; font-size: 20px; margin: 0;">{{ config('app.name') }}</h1></td></tr>
                <tr><td style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Olá, {{ explode(' ', trim($nomeCliente))[0] }}!</h2>
                    <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
                    <p>Para criar uma nova senha, clique no botão abaixo. Este link expira em <strong>7 minutos</strong>.</p>
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                        <tr><td align="center" style="border-radius: 12px; background-color: #10b981;">
                            <a href="{{ url('/api/clientes/redefinir-senha?token=' . $token) }}" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none;">Redefinir Minha Senha</a>
                        </td></tr>
                    </table>
                    <p style="font-size: 13px; color: #94a3b8;">Se não foi você que solicitou, ignore este e-mail.</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>