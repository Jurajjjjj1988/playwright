import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ListingDetailPage extends BasePage {
  readonly price: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.price = page.getByText(/[\d\s]+Kč/i).first();
    this.title = page.getByRole('heading', { level: 1 });
  }

  async verifyLoaded() {
    await expect(this.title).toBeVisible();
    await expect(this.price).toBeVisible();
  }

  async verifyUrl() {
    await this.verifyUrlMatches(/\/inzerat\//);
  }
}
