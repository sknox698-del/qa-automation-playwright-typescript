import { test, expect } from '../fixtures.js';

test('EDGE-01 out-of-stock item cannot be added @regression', async ({ shop }) => {
  await shop.open();
  await expect(shop.product('Studio Headphones').getByRole('button')).toBeDisabled();
});

for (const value of ['0', '-1', '1.5', '6']) {
  test(`EDGE-02 rejects backpack quantity ${value} and preserves total @regression`, async ({ page, shop }) => {
    await shop.open(); await shop.add('Everyday Backpack'); await shop.viewCart();
    await page.getByLabel('Quantity for Everyday Backpack').fill(value);
    await page.getByLabel('Quantity for Everyday Backpack').press('Tab');
    await expect(page.getByRole('alert')).toHaveText('Quantity must be between 1 and 5.');
    await expect(page.getByTestId('total')).toHaveText('€53.95');
    await expect(page.getByLabel('Quantity for Everyday Backpack')).toHaveValue('1');
  });
}

test('EDGE-03 stock boundary prevents a sixth backpack @regression', async ({ page, shop }) => {
  await shop.open();
  for (let i = 0; i < 5; i++) await shop.add('Everyday Backpack');
  await expect(shop.product('Everyday Backpack').getByRole('button')).toBeDisabled();
  await shop.viewCart();
  await expect(page.getByLabel('Quantity for Everyday Backpack')).toHaveValue('5');
});

test('EDGE-04 signed-in empty cart cannot enter checkout @regression', async ({ page, signedInShop }) => {
  await signedInShop.viewCart(); await page.goto('/#checkout');
  await expect(page).toHaveURL(/#cart$/);
  await expect(page.getByText('Your cart is empty.', { exact: true })).toBeVisible();
});

test('EDGE-05 failed order preserves cart and supports retry @regression', async ({ page, signedInShop, checkout }) => {
  await signedInShop.add('Trail Bottle'); await signedInShop.viewCart();
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await checkout.fill();
  // Deliberate fault injection; all other E2E requests use the real local API.
  await page.route('**/api/orders', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Service temporarily unavailable' }) }), { times: 1 });
  await checkout.submit();
  await expect(page.getByRole('alert')).toHaveText('Service temporarily unavailable');
  await expect(page.getByRole('link', { name: 'Cart 1', exact: true })).toBeVisible();
  expect((await (await page.request.get('/api/orders')).json()).orders).toEqual([]);
  await checkout.submit();
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  expect((await (await page.request.get('/api/orders')).json()).orders).toHaveLength(1);
});

test('EDGE-06 unavailable catalog shows a recoverable error @regression', async ({ page }) => {
  await page.route('**/api/products', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Shop unavailable' })).toBeVisible();
  await page.unroute('**/api/products'); await page.reload();
  await expect(page.getByRole('article')).toHaveCount(4);
});
