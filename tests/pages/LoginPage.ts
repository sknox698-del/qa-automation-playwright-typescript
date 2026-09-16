import { type Page } from '@playwright/test';
import { customer } from '../data.js';

export class LoginPage {
  constructor(readonly page: Page) {}
  async open() { await this.page.goto('/#login'); }
  async signIn(email = customer.email, password = customer.password) {
    await this.page.getByLabel('Email', { exact: true }).fill(email);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();
  }
}
