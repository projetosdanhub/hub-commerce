<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme seu novo E-mail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #f1f5f9;">
        Ação necessária: Clique para confirmar a alteração do seu e-mail cadastrado. Este link expira em 7 minutos.
    </div>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px 32px; text-align: left; border-bottom: 3px solid #2563eb;">
                            <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
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
                                Recebemos uma solicitação para atualizar o e-mail de acesso da sua conta.
                            </p>

                            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
                                <span style="display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; tracking-wider: 1px; margin-bottom: 2px;">Novo E-mail Solicitado:</span>
                                <strong style="color: #0f172a; font-size: 15px; font-family: monospace;">{{ $novoEmail }}</strong>
                            </div>

                            <p style="margin-bottom: 24px; color: #475569;">
                                Para confirmar a segurança do seu perfil e ativar este e-mail, clique no botão abaixo. Este link é válido por <strong>7 minutos</strong>.
                            </p>

                            <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td align="center" style="border-radius: 12px; background-color: #2563eb;">
                                        <a href="{{ url('/api/clientes/confirmar-email?token=' . $token) }}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; background-color: #2563eb;">
                                            Confirmar Novo E-mail &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
                                Se você não reconhece esta alteração, fique tranquilo: nenhuma mudança será feita sem o seu clique no link.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
                            <p style="margin: 0 0 6px 0;">Este é um e-mail automático gerado para a segurança da sua conta na plataforma <strong>{{ config('app.name') }}</strong>.</p>
                            <p style="margin: 0; color: #94a3b8;">&copy; {{ date('Y') }} {{ config('app.name') }}. Todos os direitos reservados.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>