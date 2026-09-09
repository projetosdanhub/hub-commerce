<?php

return [
    /*
    |--------------------------------------------------------------------------
    | URL pública do callback
    |--------------------------------------------------------------------------
    |
    | Deve coincidir exatamente com a URL registrada nos aplicativos dos
    | provedores. Nunca use o domínio de uma loja para este callback.
    |
    */
    'redirect_base_url' => env('PROVIDER_CONNECTION_REDIRECT_BASE_URL', env('APP_URL')),

    'mercado_pago' => [
        'client_id' => env('MERCADO_PAGO_PLATFORM_CLIENT_ID'),
        'client_secret' => env('MERCADO_PAGO_PLATFORM_CLIENT_SECRET'),
        'authorization_url' => 'https://auth.mercadopago.com/authorization',
        'token_url' => 'https://api.mercadopago.com/oauth/token',
    ],

    'pagbank' => [
        'client_id' => env('PAGBANK_PLATFORM_CLIENT_ID'),
        'client_secret' => env('PAGBANK_PLATFORM_CLIENT_SECRET'),
        'sandbox_authorization_url' => 'https://connect.sandbox.pagbank.com.br/oauth2/authorize',
        'production_authorization_url' => 'https://connect.pagbank.com.br/oauth2/authorize',
        'sandbox_token_url' => 'https://sandbox.api.pagseguro.com/oauth2/token',
        'production_token_url' => 'https://api.pagseguro.com/oauth2/token',
    ],

    /*
    | A chave da plataforma é configurada somente por infraestrutura.
    | O onboarding Stripe Connect será dedicado, sem reutilizar OAuth.
    */
    'stripe' => [
        'secret_key' => env('STRIPE_CONNECT_PLATFORM_SECRET_KEY'),
    ],
];
