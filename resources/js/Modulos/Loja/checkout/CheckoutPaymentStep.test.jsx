import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CheckoutPaymentStep from './CheckoutPaymentStep';
import { requestStripePaymentIntent } from './checkoutApi';

vi.mock('./checkoutApi', () => ({ requestStripePaymentIntent: vi.fn(), responseMessage: (_error, fallback) => fallback }));

let mount;
let destroy;
let confirmPayment;
beforeEach(() => {
  mount = vi.fn((node) => { expect(node).toBeInstanceOf(HTMLElement); });
  destroy = vi.fn();
  confirmPayment = vi.fn().mockResolvedValue({ paymentIntent: { status: 'processing' } });
  window.Stripe = vi.fn(() => ({ elements: () => ({ create: () => ({ mount, destroy }) }), confirmPayment }));
  requestStripePaymentIntent.mockResolvedValue({ publishable_key: 'pk_test_fixture', client_secret: 'pi_fixture_secret_value' });
});
afterEach(() => { delete window.Stripe; vi.clearAllMocks(); });

const props = { checkoutToken: 'fixture', items: [], address: {}, shippingQuoteToken: 'quote', onBack: vi.fn() };
describe('Pagamento Stripe', () => {
  it('monta o formulário em um contêiner existente e libera os recursos ao sair', async () => {
    const view = render(<CheckoutPaymentStep {...props} />);
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Pagar com segurança' })).toBeEnabled();
    view.unmount();
    expect(destroy).toHaveBeenCalledOnce();
  });
  it('não anuncia aprovação antes da confirmação do pedido', async () => {
    render(<CheckoutPaymentStep {...props} />);
    const button = screen.getByRole('button', { name: 'Pagar com segurança' });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    expect(await screen.findByRole('status')).toHaveTextContent('aguardando a confirmação');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
