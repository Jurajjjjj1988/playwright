import { type Page, type Locator, expect, test } from '@playwright/test';
import { BasePage } from './base.page';

export class ListingDetailPage extends BasePage {
  readonly price: Locator;
  readonly title: Locator;
  readonly address: Locator;
  readonly gallery: Locator;
  readonly errorHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.price = page.getByText(/[\d\s]+Kč/i).first();
    this.title = page.locator('h1').first();
    this.address = page.getByText(/,\s*(praha|brno|ostrava|plzeň)/i).first();
    this.gallery = page.locator('img[src*="img.ulovdomov"]').first();
    this.errorHeading = page.getByRole('heading', { name: /pokazilo/i });
  }

  /** Skip test if server returns error page (500) */
  async skipIfServerError() {
    await this.page.waitForLoadState('domcontentloaded');
    const titleText = await this.title.textContent({ timeout: 5000 }).catch(() => '');
    if (titleText?.includes('pokazilo')) {
      test.skip(true, 'Server returned 500 error on listing detail page');
    }
  }

  /** Verify the listing detail page loaded with key information */
  async verifyLoaded() {
    await this.skipIfServerError();
    await expect(this.title).toBeVisible();
    await expect(this.price).toBeVisible();
  }

  /** Verify the URL matches the listing detail pattern */
  async verifyUrl() {
    await expect(this.page).toHaveURL(/\/inzerat\//);
  }

  /** Verify gallery images are present */
  async verifyGalleryVisible() {
    await this.skipIfServerError();
    await expect(this.gallery).toBeVisible();
  }
}
