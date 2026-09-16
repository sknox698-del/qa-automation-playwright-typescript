import { test, expect } from '../../tests/fixtures.js';

test('DEMO-01 detects an intentionally injected one-cent price regression', async ({ page, shop }) => {
  await page.route('**/api/products', async route => {
    const response = await route.fetch();
    const body = await response.json();
    body.products.find((product: { id: string }) => product.id === 'bottle').priceCents = 1801;
    await route.fulfill({ response, json: body });
  });
  await shop.open(); await shop.add('Trail Bottle'); await shop.viewCart();
  // Deliberately fails: real UI displays €22.96 after the injected price change.
  await expect(page.getByTestId('total')).toHaveText('€22.95');
});
