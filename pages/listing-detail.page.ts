import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for a listing detail page (/inzerat/...).
 * Contains listing title and price.
 */
export class ListingDetailPage extends BasePage {
  /** Listing price element */
  readonly price: Locator;
  /** Listing title (h1 heading) */
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.price = page.getByText(/[\d\s]+Kč/i).first();
    this.title = page.getByRole('heading', { level: 1 });
  }

  /**
   * Verify the listing detail page loaded with title and price visible.
   * Deterministic — if the page shows an error, the test fails.
   */
  async verifyLoaded() {
    await expect(this.title).toBeVisible();
    await expect(this.price).toBeVisible();
  }

  /** Verify the URL matches the listing detail pattern (/inzerat/) */
  async verifyUrl() {
    await this.verifyUrlMatches(/\/inzerat\//);
  }
}
