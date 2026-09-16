import { test, expect } from '@playwright/test';
import { customer, shipping } from '../data.js';

test('API-01 catalog returns the documented product contract @smoke @regression', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const { products } = await response.json();
  expect(products).toEqual([
    { id: 'bag', name: 'Everyday Backpack', priceCents: 4900, stock: 5, icon: expect.any(String) },
    { id: 'bottle', name: 'Trail Bottle', priceCents: 1800, stock: 9, icon: expect.any(String) },
    { id: 'notebook', name: 'Pocket Notebook', priceCents: 750, stock: 20, icon: expect.any(String) },
    { id: 'headphones', name: 'Studio Headphones', priceCents: 8900, stock: 0, icon: expect.any(String) },
  ]);
});

test('API-02 invalid credentials return 401 and no session @regression', async ({ request }) => {
  const response = await request.post('/api/login', { data: { ...customer, password: 'wrong' } });
  expect(response.status()).toBe(401);
  expect(await response.json()).toEqual({ error: 'Invalid email or password' });
  expect((await request.get('/api/me')).status()).toBe(401);
});

test('API-03 anonymous order reads and writes are rejected @regression', async ({ request }) => {
  expect((await request.get('/api/orders')).status()).toBe(401);
  expect((await request.post('/api/orders', { data: { shipping, items: [{ id: 'bottle', quantity: 1 }] } })).status()).toBe(401);
});

test('API-04 authenticated session is revoked by logout @regression', async ({ request }) => {
  const response = await request.post('/api/login', { data: customer });
  expect(response.status()).toBe(200);
  expect(response.headers()['set-cookie']).toContain('HttpOnly');
  expect((await request.get('/api/me')).status()).toBe(200);
  expect((await request.post('/api/logout', { data: {} })).status()).toBe(200);
  expect((await request.get('/api/me')).status()).toBe(401);
});

test('API-05 malformed JSON returns 400 @regression', async ({ request }) => {
  // A Buffer preserves invalid bytes; a string may be JSON-serialized by the client.
  const response = await request.post('/api/login', { data: Buffer.from('{broken'), headers: { 'Content-Type': 'application/json' } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'Invalid JSON' });
});

test('API-06 unknown route returns JSON 404 @regression', async ({ request }) => {
  const response = await request.get('/api/does-not-exist');
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({ error: 'Not found' });
});

test.describe('Authenticated orders', () => {
  test.beforeEach(async ({ request }) => {
    expect((await request.post('/api/login', { data: customer })).status()).toBe(200);
  });

  test('API-07 server ignores tampered prices and persists correct total @smoke @regression', async ({ request }) => {
    const response = await request.post('/api/orders', { data: {
      shipping, totalCents: 1, items: [{ id: 'bottle', quantity: 2, priceCents: 1 }],
    } });
    expect(response.status()).toBe(201);
    const order = await response.json();
    expect(order).toEqual({ id: expect.any(String), items: [{ id: 'bottle', quantity: 2 }], subtotalCents: 3600, shippingCents: 495, totalCents: 4095 });
    expect((await (await request.get('/api/orders')).json()).orders).toEqual([order]);
  });

  for (const [quantity, shippingCents] of [[7, 495], [8, 0], [9, 0]]) {
    test(`API-08 shipping threshold with ${quantity} notebooks @regression`, async ({ request }) => {
      const response = await request.post('/api/orders', { data: { shipping, items: [{ id: 'notebook', quantity }] } });
      expect(response.status()).toBe(201);
      expect(await response.json()).toMatchObject({ subtotalCents: quantity * 750, shippingCents, totalCents: quantity * 750 + shippingCents });
    });
  }

  const invalidItems = [
    { label: 'empty cart', items: [], error: 'Cart is empty' },
    { label: 'unknown product', items: [{ id: 'missing', quantity: 1 }] },
    { label: 'out-of-stock product', items: [{ id: 'headphones', quantity: 1 }] },
    { label: 'zero quantity', items: [{ id: 'bag', quantity: 0 }] },
    { label: 'negative quantity', items: [{ id: 'bag', quantity: -1 }] },
    { label: 'fractional quantity', items: [{ id: 'bag', quantity: 1.5 }] },
    { label: 'string quantity', items: [{ id: 'bag', quantity: '1' }] },
    { label: 'above-stock quantity', items: [{ id: 'bag', quantity: 6 }] },
    { label: 'duplicate product IDs', items: [{ id: 'bag', quantity: 3 }, { id: 'bag', quantity: 3 }] },
    { label: 'null item', items: [null] },
  ];
  for (const item of invalidItems) {
    test(`API-09 rejects ${item.label} without saving an order @regression`, async ({ request }) => {
      const response = await request.post('/api/orders', { data: { shipping, items: item.items } });
      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ error: item.error || 'Invalid item or quantity' });
      expect((await (await request.get('/api/orders')).json()).orders).toEqual([]);
    });
  }
  for (const details of [{ ...shipping, name: ' ' }, { ...shipping, name: 'S'.repeat(61) }, { ...shipping, email: 'invalid' }, { ...shipping, postcode: '1234' }]) {
    test(`API-10 rejects invalid shipping ${JSON.stringify(details)} @regression`, async ({ request }) => {
      const response = await request.post('/api/orders', { data: { shipping: details, items: [{ id: 'bottle', quantity: 1 }] } });
      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ error: 'Invalid shipping details' });
      expect((await (await request.get('/api/orders')).json()).orders).toEqual([]);
    });
  }

  test('API-11 another session cannot read the first sessions orders @regression', async ({ request, playwright }) => {
    expect((await request.post('/api/orders', { data: { shipping, items: [{ id: 'bottle', quantity: 1 }] } })).status()).toBe(201);
    const other = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:4187' });
    try {
      expect((await other.post('/api/login', { data: customer })).status()).toBe(200);
      expect((await (await other.get('/api/orders')).json()).orders).toEqual([]);
      expect((await (await request.get('/api/orders')).json()).orders).toHaveLength(1);
    } finally { await other.dispose(); }
  });
});
