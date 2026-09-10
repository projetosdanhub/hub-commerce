import { storefrontApi } from '../../../api';

const dataFrom = (response) => response.data.data;

export async function startCheckoutCustomerSession(payload) {
    const response = await storefrontApi.post('/storefront/checkout/customer-session', payload);

    return dataFrom(response);
}

export async function lookupPostalCode(postalCode) {
    const normalizedPostalCode = postalCode.replace(/\D/g, '');
    const response = await storefrontApi.get('/storefront/postal-codes/' + normalizedPostalCode);

    return dataFrom(response);
}

export async function requestFreeShippingProgress(items) {
    const response = await storefrontApi.post('/storefront/free-shipping-progress', { items });

    return dataFrom(response);
}

export async function requestShippingQuotes(items, address) {
    const response = await storefrontApi.post('/storefront/shipping-quotes', {
        items,
        address,
    });

    return dataFrom(response);
}

export async function requestCheckoutSummary(items, address, shippingQuoteToken) {
    const response = await storefrontApi.post('/storefront/checkout/summary', {
        items,
        address,
        shipping_quote_token: shippingQuoteToken,
    });

    return dataFrom(response);
}

export async function requestStripePaymentIntent(payload, checkoutToken) {
    const response = await storefrontApi.post('/storefront/checkout/stripe/payment-intent', payload, {
        headers: { Authorization: 'Bearer ' + checkoutToken },
    });

    return dataFrom(response);
}

export async function requestCheckoutPaymentStatus(orderId, checkoutToken) {
    const response = await storefrontApi.get('/storefront/checkout/orders/' + orderId + '/payment-status', {
        headers: { Authorization: 'Bearer ' + checkoutToken },
    });

    return dataFrom(response);
}

export async function getCheckoutAddresses(checkoutToken) {
    const response = await storefrontApi.get('/storefront/checkout/addresses', {
        headers: { Authorization: 'Bearer ' + checkoutToken },
    });

    return dataFrom(response);
}

export async function saveCheckoutAddress(checkoutToken, address) {
    const response = await storefrontApi.post('/storefront/checkout/addresses', address, {
        headers: { Authorization: 'Bearer ' + checkoutToken },
    });

    return dataFrom(response);
}

export function responseMessage(error, fallback) {
    return error.response?.data?.message || fallback;
}
