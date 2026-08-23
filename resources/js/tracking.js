// ============================================================================
// FICHEIRO: resources/js/tracking.js
// ARQUITETURA: Motor Universal de Eventos (Event Gateway / Tracking Hub)
// ESPECIFICAÇÃO: Versão 2.0 (Meta, GA4, TikTok, Server-Side Ready VIP)
// ============================================================================
import api from './api';

// --- ARMAZENAMENTO DE CONFIGURAÇÕES EM MEMÓRIA ---
let trackingConfig = null;

// ============================================================================
// 1. UTILITÁRIOS DE IDENTIDADE E SESSÃO
// ============================================================================
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const getSessionId = () => {
    let sid = sessionStorage.getItem('hub_session_id');
    if (!sid) {
        sid = generateUUID();
        sessionStorage.setItem('hub_session_id', sid);
    }
    return sid;
};

const getAnonymousId = () => {
    let aid = localStorage.getItem('hub_anonymous_id');
    if (!aid) {
        aid = generateUUID();
        localStorage.setItem('hub_anonymous_id', aid);
    }
    return aid;
};

const getDeviceType = () => /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

// ============================================================================
// 2. CAPTURA E PERSISTÊNCIA DE ATRIBUIÇÃO (UTMs E CLICK IDs)
// ============================================================================
export const captureAttribution = () => {
    if (typeof window === 'undefined') return {};
    
    const params = new URLSearchParams(window.location.search);
    const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'ttclid'];
    let savedAttribution = JSON.parse(localStorage.getItem('hub_attribution_data') || '{}');
    let hasNewData = false;

    trackingKeys.forEach(param => {
        if (params.has(param)) {
            savedAttribution[param] = params.get(param);
            hasNewData = true;
        }
    });

    // Captura FBP e FBC (Cookies da Meta) caso existam nativamente
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };
    
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    if (fbp) { savedAttribution.fbp = fbp; hasNewData = true; }
    if (fbc) { savedAttribution.fbc = fbc; hasNewData = true; }

    if (hasNewData) {
        localStorage.setItem('hub_attribution_data', JSON.stringify(savedAttribution));
    }
    return savedAttribution;
};

// ============================================================================
// 3. INICIALIZAÇÃO DE SCRIPTS NO NAVEGADOR (PIXELS BROWSER-SIDE)
// ============================================================================
export const initTracking = (settings) => {
    trackingConfig = settings;
    if (!settings || !settings.is_active) return;

    // META PIXEL (Browser)
    if (settings.meta_pixel_id && typeof window !== 'undefined') {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        window.fbq('init', settings.meta_pixel_id);
    }

    // GOOGLE ANALYTICS 4 (Browser)
    if (settings.ga4_measurement_id && typeof window !== 'undefined') {
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga4_measurement_id}`;
        document.head.appendChild(gtagScript);

        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;
        window.gtag('js', new Date());
        window.gtag('config', settings.ga4_measurement_id);
    }

    // TIKTOK PIXEL (Browser)
    if (settings.tiktok_pixel_id && typeof window !== 'undefined') {
        !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load(settings.tiktok_pixel_id);
        }(window, document, 'ttq');
    }
};

// ============================================================================
// 4. MAPEADORES DE DESTINO (Adapters) - TRADUTORES PARA CADA REDE
// ============================================================================
const mapToMeta = (eventName, commerce) => {
    // MAPEAMENTO OFICIAL DE EVENTOS STANDARD DA META PARA E-COMMERCE
    const eventMap = {
        'page_view': 'PageView', 
        'view_item_list': 'ViewContent', 
        'view_item': 'ViewContent',
        'search': 'Search', 
        'add_to_wishlist': 'AddToWishlist', 
        'add_to_cart': 'AddToCart', 
        'begin_checkout': 'InitiateCheckout',
        'add_payment_info': 'AddPaymentInfo', 
        'purchase': 'Purchase', 
        'subscribe': 'Subscribe',
        'start_trial': 'StartTrial',
        'complete_registration': 'CompleteRegistration', 
        'contact': 'Contact',
        'find_location': 'FindLocation',
        'schedule': 'Schedule',
        'customize_product': 'CustomizeProduct',
        'donate': 'Donate',
        'submit_application': 'SubmitApplication',
        'generate_lead': 'Lead'
    };
    
    const fbEvent = eventMap[eventName];
    if (!fbEvent) return null;

    const data = {};
    if (commerce) {
        if (commerce.value) data.value = commerce.value;
        if (commerce.currency) data.currency = commerce.currency;
        if (commerce.items && commerce.items.length > 0) {
            data.content_ids = commerce.items.map(i => i.item_id || i.product_id);
            data.content_type = 'product';
            data.num_items = commerce.items.reduce((acc, i) => acc + (i.quantity || 1), 0);
        }
        if (commerce.transaction_id) data.order_id = commerce.transaction_id;
        if (commerce.search_string) data.search_string = commerce.search_string;
    }
    return { event: fbEvent, data };
};

const mapToGA4 = (eventName, commerce) => {
    const eventMap = {
        'complete_registration': 'sign_up',
        'generate_lead': 'generate_lead',
        'contact': 'generate_lead',
        'subscribe': 'subscribe',
    };
    const ga4Event = eventMap[eventName] || eventName;

    const data = {};
    if (commerce) {
        if (commerce.value) data.value = commerce.value;
        if (commerce.currency) data.currency = commerce.currency;
        if (commerce.transaction_id) data.transaction_id = commerce.transaction_id;
        if (commerce.coupon) data.coupon = commerce.coupon;
        if (commerce.shipping) data.shipping = commerce.shipping;
        if (commerce.tax) data.tax = commerce.tax;
        if (commerce.items && commerce.items.length > 0) data.items = commerce.items;
        if (commerce.search_string) data.search_term = commerce.search_string;
    }
    return { event: ga4Event, data };
};

const mapToTikTok = (eventName, commerce) => {
    const eventMap = {
        'page_view': 'PageView',
        'view_item': 'ViewContent', 
        'add_to_cart': 'AddToCart', 
        'begin_checkout': 'InitiateCheckout',
        'add_payment_info': 'AddPaymentInfo', 
        'purchase': 'CompletePayment', 
        'search': 'Search',
        'generate_lead': 'SubmitForm', 
        'complete_registration': 'CompleteRegistration', 
        'contact': 'Contact',
        'subscribe': 'Subscribe'
    };
    const ttEvent = eventMap[eventName];
    if (!ttEvent) return null;

    const data = {};
    if (commerce) {
        if (commerce.value) data.value = commerce.value;
        if (commerce.currency) data.currency = commerce.currency;
        if (commerce.items && commerce.items.length > 0) {
            data.contents = commerce.items.map(i => ({ content_id: i.item_id || i.product_id, content_type: 'product', quantity: i.quantity || 1, price: i.price }));
        }
        if (commerce.search_string) data.query = commerce.search_string;
    }
    return { event: ttEvent, data };
};

// ============================================================================
// 5. MOTOR CANÔNICO CENTRAL (DATA LAYER E CAPI)
// ============================================================================
const processEvent = async (eventName, payloadData, isNative = true) => {
    if (!trackingConfig || !trackingConfig.is_active) return;

    // Normalização Canônica
    const canonicalName = eventName.toLowerCase().replace(/ /g, '_');

    // Essenciais CAPI
    const eventId = generateUUID();
    const eventTime = Math.floor(Date.now() / 1000);
    const attribution = captureAttribution();

    // 5.1. MONTAR O EVENT ENVELOPE CANÔNICO DO HUB (O "Deus" de todos os dados)
    const canonicalPayload = {
        event: {
            name: canonicalName,
            event_id: eventId,
            event_time: eventTime,
            event_time_iso: new Date().toISOString(),
            source: 'web',
            source_url: window.location.href,
            environment: 'production'
        },
        // Dados sensíveis do cliente (O Laravel transformará em Hash SHA256 na API)
        user: {
            anonymous_id: getAnonymousId(),
            em: payloadData.user?.email || null,
            ph: payloadData.user?.phone || null,
            fn: payloadData.user?.first_name || null,
            ln: payloadData.user?.last_name || null,
            ct: payloadData.user?.city || null,
            st: payloadData.user?.state || null,
            country: payloadData.user?.country || 'BR',
            zp: payloadData.user?.zip || null,
            ge: payloadData.user?.gender || null,
            db: payloadData.user?.birthday || null,
            external_id: payloadData.user?.id ? String(payloadData.user.id) : null,
            ...payloadData.user
        },
        // Dados de Sessão Browser-Side (IP é capturado pelo Laravel automaticamente)
        session: {
            session_id: getSessionId(),
            user_agent: navigator.userAgent
        },
        // Atribuição (fbp, fbc, UTMs)
        attribution: attribution, 
        consent: { analytics: true, ads: true, personalization: true }, 
        commerce: payloadData.commerce || {},
        context: {
            page_type: payloadData.context?.page_type || "store",
            device_type: getDeviceType(),
            language: navigator.language
        }
    };

    // 5.2. ENVIAR PARA O NOSSO EVENT COLLECTOR SERVER-SIDE (CAPI)
    try {
        await api.post('/tracking/collect', canonicalPayload);
    } catch (e) {
        console.warn(`[Tracking] Falha ao enviar ${canonicalName} para o CAPI Collector.`, e);
    }

    // 5.3. DISTRIBUIR PARA OS PIXELS DO NAVEGADOR
    
    // Meta Pixel
    if (window.fbq) {
        const metaPayload = mapToMeta(canonicalName, payloadData.commerce);
        if (metaPayload) {
            // Se houver dados de usuário (Email/Phone), mandamos também no browser para aumentar Match Quality
            const userData = {};
            if (canonicalPayload.user.em) userData.em = canonicalPayload.user.em;
            if (canonicalPayload.user.ph) userData.ph = canonicalPayload.user.ph;
            
            if(Object.keys(userData).length > 0) {
                window.fbq('init', trackingConfig.meta_pixel_id, userData); // Re-init com dados
            }
            window.fbq(isNative ? 'track' : 'trackCustom', metaPayload.event, metaPayload.data, { eventID: eventId });
        }
        else if (!isNative) {
            window.fbq('trackCustom', eventName, payloadData.commerce || {}, { eventID: eventId });
        }
    }

    // Google Analytics 4
    if (window.gtag) {
        const ga4Payload = mapToGA4(canonicalName, payloadData.commerce);
        window.gtag('event', ga4Payload.event, { ...ga4Payload.data, event_id: eventId });
    }

    // TikTok Pixel
    if (window.ttq) {
        const ttPayload = mapToTikTok(canonicalName, payloadData.commerce);
        if (ttPayload) window.ttq.track(ttPayload.event, ttPayload.data, { event_id: eventId });
        else if (!isNative) window.ttq.track(eventName, payloadData.commerce || {}, { event_id: eventId });
    }

    console.log(`[DataLayer] Processed Event: ${canonicalName}`, canonicalPayload);
};

// ============================================================================
// 6. CATÁLOGO DE AÇÕES DE NEGÓCIO (API PÚBLICA PARA OS COMPONENTES REACT)
// ============================================================================

export const trackPageView = () => processEvent('page_view', {});

export const trackViewItem = (item) => {
    processEvent('view_item', {
        commerce: { currency: "BRL", value: item.price, items: [item] }
    });
};

export const trackViewItemList = (list_id, list_name, items) => {
    processEvent('view_item_list', {
        commerce: { items: items.map(i => ({ ...i, item_list_id: list_id, item_list_name: list_name })) }
    });
};

export const trackAddToCart = (item, totalValue) => {
    processEvent('add_to_cart', {
        commerce: { currency: "BRL", value: totalValue, items: [item] }
    });
};

export const trackRemoveFromCart = (item, totalValue) => {
    processEvent('remove_from_cart', {
        commerce: { currency: "BRL", value: totalValue, items: [item] }
    });
};

export const trackAddToWishlist = (item) => {
    processEvent('add_to_wishlist', {
        commerce: { currency: "BRL", value: item.price, items: [item] }
    });
};

export const trackApplyCoupon = (couponCode, discountValue) => {
    processEvent('apply_coupon', {
        commerce: { coupon: couponCode, discount: discountValue }
    });
};

export const trackBeginCheckout = (cartData, userData = null) => {
    processEvent('begin_checkout', {
        user: userData || {},
        commerce: { currency: "BRL", value: cartData.value, coupon: cartData.coupon, items: cartData.items },
        context: { page_type: 'checkout' }
    });
};

export const trackAddShippingInfo = (shippingTier, cartData) => {
    processEvent('add_shipping_info', {
        commerce: { currency: "BRL", value: cartData.value, shipping_method: shippingTier, items: cartData.items }
    });
};

export const trackAddPaymentInfo = (paymentType, cartData) => {
    processEvent('add_payment_info', {
        commerce: { currency: "BRL", value: cartData.value, payment_method: paymentType, items: cartData.items }
    });
};

// COMPRAS (Purchase Core Event)
export const trackPurchase = (orderData, userData) => {
    processEvent('purchase', {
        user: userData, // Essencial para CAPI (Match Rate Extremo)
        commerce: {
            transaction_id: orderData.transaction_id,
            order_id: orderData.order_id,
            currency: "BRL",
            value: orderData.value,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            tax: orderData.tax,
            discount: orderData.discount,
            coupon: orderData.coupon,
            payment_method: orderData.payment_method,
            items: orderData.items
        }
    });
};

export const trackGenerateLead = (userData, value = 0) => {
    processEvent('generate_lead', {
        user: userData,
        commerce: { currency: "BRL", value: value },
    });
};

export const trackCompleteRegistration = (userData) => {
    processEvent('complete_registration', { user: userData });
};

export const trackSearch = (searchTerm) => {
    processEvent('search', {
        commerce: { search_string: searchTerm }
    });
};

export const trackContact = (userData) => {
    processEvent('contact', { user: userData || {} });
};

export const trackDonate = (value, currency = "BRL") => {
    processEvent('donate', { commerce: { value, currency } });
};

export const trackCustomizeProduct = (item) => {
    processEvent('customize_product', { commerce: { items: [item] } });
};

export const trackFindLocation = () => processEvent('find_location', {});

export const trackSchedule = () => processEvent('schedule', {});

export const trackStartTrial = (value = 0, currency = "BRL") => {
    processEvent('start_trial', { commerce: { value, currency } });
};

export const trackSubmitApplication = () => processEvent('submit_application', {});

export const trackSubscribe = (value, currency = "BRL", subscription_id = null) => {
    processEvent('subscribe', { commerce: { value, currency, subscription_id } });
};

// Motor Direto para Eventos Customizados do GTM
export const trackCustomTrigger = (eventName, payloadData = {}) => {
    processEvent(eventName, payloadData, false);
};