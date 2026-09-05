import test from 'node:test';
import assert from 'node:assert/strict';
import { createDebouncedTask, cssDurationToMilliseconds, lockDocumentScroll, SEARCH_DEBOUNCE_MS } from '../../resources/js/Modulos/Admin/DesignSystem/patterns/interactionLifecycle.js';
import { resolveInitialAdminTheme } from '../../resources/js/Modulos/Admin/DesignSystem/patterns/appearancePreference.js';

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


test('motion durations accept the design token units', () => {
  assert.equal(cssDurationToMilliseconds('120ms'), 120);
  assert.equal(cssDurationToMilliseconds('0.2s'), 200);
  assert.equal(cssDurationToMilliseconds('invalid', 75), 75);
});

test('appearance honors a saved choice, desktop system preference and mobile dark default', () => {
  assert.equal(resolveInitialAdminTheme({ storedTheme: 'light', viewportIsMobile: true }), 'light');
  assert.equal(resolveInitialAdminTheme({ prefersLight: true }), 'light');
  assert.equal(resolveInitialAdminTheme({ viewportIsMobile: true, prefersLight: true }), 'dark');
});
