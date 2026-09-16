import { test, expect } from '../fixtures.js';

test('AUTH-01 valid login and reload retain the session @smoke @regression', async ({ page, login }) => {
  await login.open();
  await login.signIn();
  await expect(page.getByRole('link', { name: 'Hi, Steve' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
});

test('AUTH-02 invalid password leaves user signed out @regression', async ({ page, login }) => {
  await login.open(); await login.signIn('steve@example.test', 'incorrect');
  await expect(page.getByRole('alert')).toHaveText('Invalid email or password');
  expect((await page.request.get('/api/me')).status()).toBe(401);
});

test('AUTH-03 empty credentials show required validation @regression', async ({ page, login }) => {
  await login.open(); await login.signIn('', '');
  await expect(page.getByRole('alert')).toHaveText('Email and password are required.');
});

test('AUTH-04 logout revokes server session and guards checkout @regression', async ({ page, signedInShop }) => {
  await signedInShop.add('Trail Bottle');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  expect((await page.request.get('/api/orders')).status()).toBe(401);
  await page.goto('/#checkout');
  await expect(page).toHaveURL(/#login$/);
});

test('AUTH-05 guest checkout redirects to login @regression', async ({ page, shop }) => {
  await shop.open(); await shop.add('Trail Bottle'); await shop.viewCart();
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
  await expect(page).toHaveURL(/#login$/);
});
