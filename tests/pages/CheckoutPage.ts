import { type Page } from '@playwright/test';
import { shipping } from '../data.js';

export class CheckoutPage {
  constructor(readonly page: Page) {}
  async fill(details: typeof shipping = shipping) {
    await this.page.getByLabel('Full name', { exact: true }).fill(details.name);
    await this.page.getByLabel('Email', { exact: true }).fill(details.email);
    await this.page.getByLabel('Postcode', { exact: true }).fill(details.postcode);
  }
  async submit() { await this.page.getByRole('button', { name: 'Place demo order' }).click(); }
}
