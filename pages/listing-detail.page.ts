import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ListingDetailPage extends BasePage {
  readonly price: Locator;
  readonly title: Locator;
  readonly propertyParams: Locator;
  readonly contactSection: Locator;

  constructor(page: Page) {
    super(page);
    this.price = page.getByTestId('visual.price').or(page.getByText(/[\d\s]+Kč/i).first());
    this.title = page.getByRole('heading', { level: 1 });
    this.propertyParams = page.getByTestId('visual.params');
    this.contactSection = page.getByTestId('visual.contact');
  }

  async verifyLoaded() {
    await expect(this.title).toBeVisible();
    await expect(this.price).toBeVisible();
  }

  async verifyUrl() {
    await this.verifyUrlMatches(/\/inzerat\//);
  }

  /**
   * @returns Price text as displayed (e.g. "15 000 Kč / měsíc")
   */
  async getPriceText(): Promise<string> {
    return (await this.price.textContent()) ?? '';
  }
}
