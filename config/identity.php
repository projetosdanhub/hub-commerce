<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Endereços dos painéis
    |--------------------------------------------------------------------------
    |
    | A administração da plataforma deve ficar separada do painel da loja.
    | Em ambiente local ambos podem usar a mesma origem, com paths distintos.
    |
    */
    'admin_url' => rtrim((string) env('ADMIN_URL', env('APP_URL', 'http://localhost')), '/'),
    'superadmin_url' => rtrim((string) env('SUPERADMIN_URL', env('ADMIN_URL', env('APP_URL', 'http://localhost'))), '/'),

    'invitation_expiration_hours' => (int) env('IDENTITY_INVITATION_EXPIRATION_HOURS', 168),

    'mfa' => [
        'issuer' => (string) env('MFA_ISSUER', env('APP_NAME', 'Hub Commerce')),
        'recovery_codes' => (int) env('MFA_RECOVERY_CODE_COUNT', 8),
        'enforcement' => (string) env('MFA_ENFORCEMENT', 'optional'),
    ],

    'legacy_admin_access' => (bool) env('IDENTITY_LEGACY_ADMIN_ACCESS', true),
];
