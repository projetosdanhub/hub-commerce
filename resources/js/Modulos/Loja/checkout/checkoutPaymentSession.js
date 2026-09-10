export const CHECKOUT_PAYMENT_SESSION_KEY = 'hubcommerce_checkout_payment';

export function saveCheckoutPaymentSession({ checkoutToken, orderId }) {
  if (typeof checkoutToken !== 'string' || !checkoutToken || !Number.isSafeInteger(Number(orderId)) || Number(orderId) < 1) {
    throw new Error('Sessão de pagamento inválida.');
  }

  window.sessionStorage.setItem(CHECKOUT_PAYMENT_SESSION_KEY, JSON.stringify({
    checkoutToken,
    orderId: Number(orderId),
  }));
}

export function readCheckoutPaymentSession() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(CHECKOUT_PAYMENT_SESSION_KEY) || 'null');

    if (
      !value
      || typeof value.checkoutToken !== 'string'
      || !value.checkoutToken
      || !Number.isSafeInteger(Number(value.orderId))
      || Number(value.orderId) < 1
    ) {
      throw new Error('Sessão de pagamento inválida.');
    }

    return { checkoutToken: value.checkoutToken, orderId: Number(value.orderId) };
  } catch {
    window.sessionStorage.removeItem(CHECKOUT_PAYMENT_SESSION_KEY);

    return null;
  }
}

export function clearCheckoutPaymentSession() {
  window.sessionStorage.removeItem(CHECKOUT_PAYMENT_SESSION_KEY);
}
