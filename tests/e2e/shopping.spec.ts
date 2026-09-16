import { test, expect } from '../fixtures.js';

test('SHOP-01 purchase verifies totals and saved order through the API @smoke @regression', async ({ page, signedInShop, checkout }) => {
  await signedInShop.add('Everyday Backpack'); await signedInShop.add('Trail Bottle');
  await signedInShop.viewCart();
  await expect(page.getByTestId('subtotal')).toHaveText('€67.00');
  await expect(page.getByTestId('shipping')).toHaveText('€0.00');
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await checkout.fill(); await checkout.submit();
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  await expect(page.getByTestId('total')).toHaveText('€67.00');
  const id = await page.getByTestId('order-id').innerText();
  const response = await page.request.get('/api/orders');
  expect(response.status()).toBe(200);
  expect((await response.json()).orders).toEqual([{
    id, items: [{ id: 'bag', quantity: 1 }, { id: 'bottle', quantity: 1 }],
    subtotalCents: 6700, shippingCents: 0, totalCents: 6700,
  }]);
  await signedInShop.viewCart();
  await expect(page.getByText('Your cart is empty.', { exact: true })).toBeVisible();
});

test('SHOP-02 quantity update persists on reload and removal empties cart @regression', async ({ page, signedInShop }) => {
  await signedInShop.add('Trail Bottle'); await signedInShop.viewCart();
  await page.getByLabel('Quantity for Trail Bottle').fill('2');
  await page.getByLabel('Quantity for Trail Bottle').press('Tab');
  await expect(page.getByTestId('total')).toHaveText('€40.95');
  await page.reload();
  await expect(page.getByLabel('Quantity for Trail Bottle')).toHaveValue('2');
  await page.getByRole('button', { name: 'Remove Trail Bottle' }).click();
  await expect(page.getByText('Your cart is empty.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Checkout', exact: true })).toHaveCount(0);
});

test('SHOP-03 search trims whitespace and ignores case @regression', async ({ page, shop }) => {
  await shop.open(); await page.getByLabel('Search products').fill('  bOtTlE  ');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(shop.product('Trail Bottle')).toBeVisible();
});

test('SHOP-04 price sorting gives the correct product order @regression', async ({ page, shop }) => {
  await shop.open(); await page.getByLabel('Sort by').selectOption('low');
  await expect(page.getByRole('article').getByRole('heading')).toHaveText(['Pocket Notebook', 'Trail Bottle', 'Everyday Backpack', 'Studio Headphones']);
  await page.getByLabel('Sort by').selectOption('high');
  await expect(page.getByRole('article').getByRole('heading')).toHaveText(['Studio Headphones', 'Everyday Backpack', 'Trail Bottle', 'Pocket Notebook']);
});

test('SHOP-05 no search results can be recovered by clearing @regression', async ({ page, shop }) => {
  await shop.open(); await page.getByLabel('Search products').fill('unobtainium');
  await expect(page.getByText('No products found.', { exact: true })).toBeVisible();
  await page.getByLabel('Search products').fill('');
  await expect(page.getByRole('article')).toHaveCount(4);
});
