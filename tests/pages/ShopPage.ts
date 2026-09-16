import { type Page } from '@playwright/test';

export class ShopPage {
  constructor(readonly page: Page) {}
  async open() { await this.page.goto('/#catalog'); }
  product(name: string) { return this.page.getByRole('article', { name, exact: true }); }
  async add(name: string) { await this.product(name).getByRole('button', { name: 'Add to cart' }).click(); }
  async viewCart() { await this.page.getByRole('link', { name: /^Cart / }).click(); }
}
