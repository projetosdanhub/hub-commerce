import test from 'node:test';
import assert from 'node:assert/strict';
import { createDebouncedTask, lockDocumentScroll, SEARCH_DEBOUNCE_MS } from '../../resources/js/Modulos/Admin/DesignSystem/patterns/interactionLifecycle.js';
import { getOrderAddress, normalizeCustomization, paymentKind } from '../../resources/js/Modulos/Admin/Orders/orderUtils.js';

test('typing a burst commits only the latest search after the quiet period', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const searches = [];
  const task = createDebouncedTask((value) => searches.push(value));
  task.schedule('p');
  context.mock.timers.tick(100);
  task.schedule('pedido');
  context.mock.timers.tick(SEARCH_DEBOUNCE_MS - 1);
  assert.deepEqual(searches, []);
  context.mock.timers.tick(1);
  assert.deepEqual(searches, ['pedido']);
});

test('unmount cancels pending search, including clearing an existing query', (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const searches = [];
  const task = createDebouncedTask((value) => searches.push(value));
  task.schedule('pedido');
  task.cancel();
  context.mock.timers.tick(SEARCH_DEBOUNCE_MS);
  assert.deepEqual(searches, []);
  task.schedule('');
  context.mock.timers.tick(SEARCH_DEBOUNCE_MS);
  assert.deepEqual(searches, ['']);
});

const documentFixture = (initial = []) => {
  const classes = new Set(initial);
  return { documentElement: { classList: {
    contains: (name) => classes.has(name),
    add: (name) => classes.add(name),
    remove: (name) => classes.delete(name),
  } } };
};

test('nested modals keep background locked until the last closes', () => {
  const doc = documentFixture();
  const closeParent = lockDocumentScroll(doc);
  const closePreview = lockDocumentScroll(doc);
  closeParent();
  closeParent();
  assert.equal(doc.documentElement.classList.contains('hub-modal-open'), true);
  closePreview();
  assert.equal(doc.documentElement.classList.contains('hub-modal-open'), false);
});

test('closing does not remove a scroll lock owned by another caller', () => {
  const doc = documentFixture(['hub-modal-open']);
  const close = lockDocumentScroll(doc);
  close();
  assert.equal(doc.documentElement.classList.contains('hub-modal-open'), true);
});

test('order presentation keeps customization associated with its item', () => {
  assert.deepEqual(normalizeCustomization({
    texto_frente: 'Daniel',
    imagem_frente: '/storage/custom/order-1.png',
  }), {
    images: [{ label: 'imagem frente', url: '/storage/custom/order-1.png' }],
    fields: [{ label: 'texto frente', value: 'Daniel' }],
  });
  assert.deepEqual(normalizeCustomization(null), { images: [], fields: [] });
});

test('payment and incomplete address use explicit truthful fallbacks', () => {
  assert.equal(paymentKind({ metodo: 'PIX' }), 'pix');
  assert.equal(paymentKind({ metodo: 'Cartão de crédito' }), 'card');
  assert.equal(getOrderAddress(null).line, 'Endereço indisponível');
});
