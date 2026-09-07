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

export function responseMessage(error, fallback) {
    return error.response?.data?.message || fallback;
}
