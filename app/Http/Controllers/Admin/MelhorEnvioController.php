<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MelhorEnvioSetting;
use Illuminate\Support\Facades\Http;

class MelhorEnvioController extends Controller
{
    // Define se estamos a usar o ambiente de testes ou produção do Melhor Envio
    private $isSandbox = false; 

    private function getBaseUrl() {
        return $this->isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://www.melhorenvio.com.br';
    }

    /**
     * Retorna as configurações atuais para preencher o Frontend
     */
    public function getSettings()
    {
        $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
        
        // Define as transportadoras padrão se estiver vazio
        if (empty($config->carriers_ativas)) {
            $config->carriers_ativas = [
                ['id' => '1', 'nome' => 'Correios PAC', 'ativo' => true],
                ['id' => '2', 'nome' => 'Correios SEDEX', 'ativo' => true],
                ['id' => '3', 'nome' => 'Jadlog', 'ativo' => false],
                ['id' => '4', 'nome' => 'Loggi', 'ativo' => false],
            ];
            $config->save();
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'client_id' => $config->client_id,
                'client_secret' => $config->client_secret ? '********' : '', // Oculta o secret
                'is_authenticated' => !empty($config->access_token),
                'carriers_ativas' => $config->carriers_ativas
            ]
        ]);
    }

    /**
     * Salva as credenciais básicas antes da autenticação
     */
    public function saveCredentials(Request $request)
    {
        $request->validate([
            'client_id' => 'required|string',
            'client_secret' => 'required|string',
            'carriers_ativas' => 'nullable|array'
        ]);

        $config = MelhorEnvioSetting::firstOrCreate(['id' => 1]);
        $config->client_id = $request->client_id;
        
        // Só atualiza o secret se o gestor digitou um novo
        if ($request->client_secret !== '********') {
            $config->client_secret = $request->client_secret;
        }

        if ($request->has('carriers_ativas')) {
            $config->carriers_ativas = $request->carriers_ativas;
        }

        $config->save();

        return response()->json(['status' => 'success', 'message' => 'Configurações salvas.']);
    }

    /**
     * Gera o Link de Autorização para onde o React vai redirecionar o usuário
     */
    public function getAuthUrl()
    {
        $config = MelhorEnvioSetting::first();
        if (!$config || !$config->client_id) {
            return response()->json(['status' => 'error', 'message' => 'Configure o Client ID primeiro.'], 400);
        }

        $redirectUri = url('/admin/melhorenvio/callback'); // Rota do backend ou frontend
        $url = $this->getBaseUrl() . "/oauth/authorize?client_id={$config->client_id}&redirect_uri={$redirectUri}&response_type=code&scope=shipping-calculate shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print";

        return response()->json(['status' => 'success', 'url' => $url]);
    }
/**
     * Callback do Melhor Envio: Recebe o código, troca pelo token e exibe a tela de Sucesso (2.5s)
     */
    public function callback(Request $request)
    {
        $code = $request->query('code');
        if (!$code) {
            return response()->json(['error' => 'Código de autorização não recebido.'], 400);
        }

        $config = MelhorEnvioSetting::first();
        $redirectUri = url('/admin/melhorenvio/callback');

        // Troca o código temporário pelo Token de Acesso permanente
        $response = \Illuminate\Support\Facades\Http::asForm()->post($this->getBaseUrl() . '/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => $config->client_id,
            'client_secret' => $config->client_secret,
            'redirect_uri' => $redirectUri,
            'code' => $code,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            
            // Salva os tokens no banco
            $config->access_token = $data['access_token'];
            $config->refresh_token = $data['refresh_token'];
            $config->expires_in = time() + $data['expires_in'];
            $config->save();

            // Rota para onde o usuário vai voltar depois dos 2.5s
            $painelFrontUrl = config('app.url') . '/admin/transportadoras?me_auth=success';

            // Retorna a tela HTML elegante de sucesso (Idêntica à do CustomerController)
            return response()->make('
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Integração Concluída</title>
                    <style>
                        body { font-family: -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                        .card { background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; max-width: 440px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
                        .icon { width: 64px; height: 64px; background: #d1fae5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; font-weight: bold; }
                        h2 { color: #0f172a; margin: 0 0 10px; font-size: 22px; font-weight: 800; }
                        p { color: #64748b; font-size: 14px; margin: 0 0 20px; line-height: 1.5; }
                        .badge { display: inline-block; background: #f0fdf4; color: #059669; border: 1px solid #a7f3d0; font-size: 12px; padding: 6px 12px; border-radius: 8px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;}
                        .redirect { font-size: 12px; color: #94a3b8; }
                        .progress-bar { position: absolute; bottom: 0; left: 0; height: 4px; background: #10b981; width: 100%; transition: width 2.5s linear; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">&check;</div>
                        <h2>Melhor Envio Conectado!</h2>
                        <p>A sincronização com a sua conta foi concluída com segurança. A loja já está autorizada a cotar e gerar etiquetas.</p>
                        <div class="badge">Autenticação OAuth2 Realizada</div>
                        <div class="redirect">Redirecionando para o painel em 2,5s...</div>
                        <div class="progress-bar" id="bar"></div>
                    </div>

                    <script>
                        setTimeout(() => { document.getElementById("bar").style.width = "0%"; }, 50);
                        setTimeout(() => { window.location.href = "'.$painelFrontUrl.'"; }, 2500);
                    </script>
                </body>
                </html>
            ', 200, ['Content-Type' => 'text/html']);
        }

        return response()->json(['error' => 'Falha ao autenticar no Melhor Envio.', 'detalhes' => $response->json()], 400);
    }
}