<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alerta de Segurança</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f1f5f9;">
        Aviso importante: O e-mail de acesso da sua conta foi alterado pelo suporte.
    </div>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px 32px; text-align: left; border-bottom: 3px solid #e11d48;">
                            <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">
                                {{ config('app.name') }}
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                            <h2 style="color: #e11d48; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
                                Aviso de Segurança
                            </h2>
                            
                            <p style="margin-top: 0; margin-bottom: 16px; color: #475569;">
                                Olá, <strong>{{ explode(' ', trim($nomeCliente))[0] }}</strong>. Informamos que o e-mail principal associado à sua conta foi alterado por um gestor da plataforma.
                            </p>

                            <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-left: 4px solid #e11d48; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
                                <p style="margin: 0 0 6px 0; font-size: 12px; color: #9f1239; font-weight: 700;">NOVO E-MAIL DE LOGIN:</p>
                                <p style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a; font-family: monospace; font-weight: 700;">{{ $novoEmail }}</p>
                                <p style="margin: 0; font-size: 12px; color: #881337;"><strong>Motivo Registrado:</strong> {{ $motivo }}</p>
                            </div>

                            <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
                                Se você desconhece esta alteração, por favor, entre em contato imediatamente com a nossa equipe de suporte.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
                            <p style="margin: 0; color: #94a3b8;">&copy; {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>