import { test, expect } from '../fixtures.js';
import { shipping } from '../data.js';

test.beforeEach(async ({ page, signedInShop }) => {
  await signedInShop.add('Trail Bottle'); await signedInShop.viewCart();
  await page.getByRole('button', { name: 'Checkout', exact: true }).click();
});

const invalid = [
  { id: 'FORM-01', label: 'blank name', field: 'name', value: '', error: 'Full name must be 2–60 characters.' },
  { id: 'FORM-02', label: 'whitespace name', field: 'name', value: '   ', error: 'Full name must be 2–60 characters.' },
  { id: 'FORM-03', label: 'one character name', field: 'name', value: 'S', error: 'Full name must be 2–60 characters.' },
  { id: 'FORM-04', label: '61 character name', field: 'name', value: 'S'.repeat(61), error: 'Full name must be 2–60 characters.' },
  { id: 'FORM-05', label: 'invalid email', field: 'email', value: 'steve@', error: 'Enter a valid email address.' },
  { id: 'FORM-06', label: 'short postcode', field: 'postcode', value: '1011', error: 'Postcode must contain exactly 5 digits.' },
  { id: 'FORM-07', label: 'long postcode', field: 'postcode', value: '101155', error: 'Postcode must contain exactly 5 digits.' },
  { id: 'FORM-08', label: 'non-numeric postcode', field: 'postcode', value: 'ABCDE', error: 'Postcode must contain exactly 5 digits.' },
];
for (const item of invalid) {
  test(`${item.id} rejects ${item.label} without creating an order @regression`, async ({ page, checkout }) => {
    await checkout.fill({ ...shipping, [item.field]: item.value }); await checkout.submit();
    await expect(page.getByRole('alert')).toHaveText(item.error);
    expect((await (await page.request.get('/api/orders')).json()).orders).toEqual([]);
  });
}
for (const length of [2, 60]) {
  test(`FORM-${length === 2 ? '09' : '10'} accepts name boundary ${length} and leading-zero postcode @regression`, async ({ page, checkout }) => {
    await checkout.fill({ ...shipping, name: 'S'.repeat(length), postcode: '01234' });
    await checkout.submit();
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  });
}
