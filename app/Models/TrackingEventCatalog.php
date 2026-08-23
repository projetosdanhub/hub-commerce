<?php

namespace App\Models;

/**
 * ============================================================================
 * FICHEIRO: app/Models/TrackingEventCatalog.php
 * ARQUITETURA: Tracking Hub Enterprise (Event Dictionary)
 * DESCRIÇÃO: Fonte da Verdade para eventos nativos, validação de payload 
 *            e mapeamento CAPI (Meta, GA4, TikTok).
 * ============================================================================
 */
class TrackingEventCatalog
{
    /**
     * Retorna a lista completa de Eventos Nativos (Standard Events) suportados.
     * Estes são os eventos oficiais reconhecidos pelas principais plataformas de Ads.
     *
     * @return array
     */
    public static function getStandardEvents(): array
    {
        return [
            'PageView',
            'ViewContent',
            'Search',
            'AddToWishlist',
            'AddToCart',
            'InitiateCheckout',
            'AddPaymentInfo',
            'Purchase',
            'Subscribe',
            'StartTrial',
            'CompleteRegistration',
            'Contact',
            'FindLocation',
            'Schedule',
            'CustomizeProduct',
            'Donate',
            'SubmitApplication',
            'Lead'
        ];
    }

    /**
     * Identifica os Eventos CORE (Fundo de Funil).
     * Útil para o backend aplicar regras mais rígidas de validação ou prioridade na fila (Jobs).
     *
     * @return array
     */
    public static function getCoreEvents(): array
    {
        return [
            'Purchase', 
            'AddToCart', 
            'InitiateCheckout', 
            'AddPaymentInfo', 
            'Lead',
            'CompleteRegistration'
        ];
    }

    /**
     * Dicionário de chaves permitidas/esperadas no Data Layer para cada evento.
     * O CAPI Builder do painel React baseia-se nesta estrutura para o enriquecimento.
     *
     * @param string $eventName
     * @return array
     */
    public static function getExpectedPayload(string $eventName): array
    {
        $catalog = [
            'PageView'             => ['url', 'referrer', 'source'],
            'ViewContent'          => ['content_ids', 'content_name', 'value', 'currency', 'content_type'],
            'AddToCart'            => ['content_ids', 'value', 'currency', 'num_items'],
            'AddToWishlist'        => ['content_ids', 'value', 'currency'],
            'InitiateCheckout'     => ['content_ids', 'value', 'currency', 'num_items'],
            'AddPaymentInfo'       => ['value', 'currency'],
            'Purchase'             => ['transaction_id', 'order_id', 'value', 'currency', 'content_ids', 'user_data'],
            'CompleteRegistration' => ['status', 'currency', 'value'],
            'Lead'                 => ['value', 'currency'],
            'Contact'              => ['value'],
            'Search'               => ['search_string', 'content_ids'],
            'Donate'               => ['value', 'currency'],
            'CustomizeProduct'     => ['content_ids'],
            'FindLocation'         => ['location'],
            'Schedule'             => ['value'],
            'StartTrial'           => ['value', 'currency'],
            'SubmitApplication'    => ['value'],
            'Subscribe'            => ['value', 'currency'],
        ];

        return $catalog[$eventName] ?? [];
    }

    /**
     * Validador Helper: Verifica se um evento recebido pela API do React
     * pertence ao catálogo oficial da loja.
     *
     * @param string $eventName
     * @return bool
     */
    public static function isStandardEvent(string $eventName): bool
    {
        return in_array($eventName, self::getStandardEvents(), true);
    }
}