import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CheckoutPaymentReturnPage from './CheckoutPaymentReturnPage';
import { CHECKOUT_PAYMENT_SESSION_KEY } from './checkoutPaymentSession';
import { requestCheckoutPaymentStatus } from './checkoutApi';

vi.mock('./checkoutApi', () => ({ requestCheckoutPaymentStatus: vi.fn(), responseMessage: (_error, fallback) => fallback }));

const renderPage = () => render(
  <HelmetProvider>
    <MemoryRouter>
      <CheckoutPaymentReturnPage />
    </MemoryRouter>
  </HelmetProvider>,
);

describe('Retorno de pagamento Stripe', () => {
  beforeEach(() => {
    window.sessionStorage.setItem(CHECKOUT_PAYMENT_SESSION_KEY, JSON.stringify({ checkoutToken: 'checkout-token', orderId: 42 }));
    requestCheckoutPaymentStatus.mockResolvedValue({ payment_status: 'PROCESSING' });
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('consulta somente a referência de checkout armazenada na sessão curta', async () => {
    const view = renderPage();

    await waitFor(() => expect(requestCheckoutPaymentStatus).toHaveBeenCalledWith(42, 'checkout-token'));
    expect(screen.getByRole('heading', { name: 'Aguardando confirmação' })).toBeInTheDocument();
    view.unmount();
  });

  it('não consulta pagamento quando não há sessão curta válida', async () => {
    window.sessionStorage.setItem(CHECKOUT_PAYMENT_SESSION_KEY, 'inválido');
    const view = renderPage();

    expect(await screen.findByRole('heading', { name: 'Confirmação indisponível' })).toBeInTheDocument();
    expect(requestCheckoutPaymentStatus).not.toHaveBeenCalled();
    view.unmount();
  });
});
