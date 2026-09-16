import { test as base, expect } from '@playwright/test';
import { customer } from './data.js';
import { LoginPage } from './pages/LoginPage.js';
import { ShopPage } from './pages/ShopPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';

export const test = base.extend<{ login: LoginPage; shop: ShopPage; checkout: CheckoutPage; signedInShop: ShopPage }>({
  login: async ({ page }, use) => { await use(new LoginPage(page)); },
  shop: async ({ page }, use) => { await use(new ShopPage(page)); },
  checkout: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  signedInShop: async ({ page, shop }, use) => {
    // API setup shares cookies with this test's browser; UI login has separate tests.
    const response = await page.request.post('/api/login', { data: customer });
    expect(response.status()).toBe(200);
    await shop.open();
    await use(shop);
  },
});
export { expect };
