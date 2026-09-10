<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sua Senha Provisória</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f1f5f9;">
        Sua senha provisória de acesso à loja foi gerada. Expira em 7 minutos.
    </div>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px 32px; text-align: left; border-bottom: 3px solid #f59e0b;">
                            <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">
                                {{ config('app.name') }}
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                            <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
                                Olá, {{ explode(' ', trim($nomeCliente))[0] }}!
                            </h2>
                            
                            <p style="margin-top: 0; margin-bottom: 16px; color: #475569;">
                                Uma senha de acesso provisória foi gerada para o seu usuário. Por motivos de segurança, ela é válida por apenas <strong>7 minutos</strong>.
                            </p>

                            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                <span style="display: block; font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Sua Senha Temporária</span>
                                <span style="font-family: monospace; font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #0f172a;">{{ $senhaProvisoria }}</span>
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                Recomendamos aceder à sua conta imediatamente e alterar esta senha no painel de perfil.
                            </p>

                            <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center" style="border-radius: 12px; background-color: #0f172a;">
                                        <a href="{{ config('app.url') }}/login" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; background-color: #0f172a;">
                                            Acessar Minha Conta &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
                            <p style="margin: 0 0 6px 0;">Este é um e-mail automático enviado pela plataforma <strong>{{ config('app.name') }}</strong>.</p>
                            <p style="margin: 0; color: #94a3b8;">&copy; {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>