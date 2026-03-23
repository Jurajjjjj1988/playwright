import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { parsePrice } from '../helpers/parsers';

export class SearchResultsPage extends BasePage {
  readonly sortSelect: Locator;
  readonly resultCount: Locator;
  readonly listingCardLinks: Locator;
  readonly listingPrices: Locator;
  readonly editSearchButton: Locator;
  readonly mapContainer: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.sortSelect = page.getByRole('combobox').first();
    this.resultCount = page.getByText(/\d+\s+(pronájm|nejlevněj|prodej)/i);
    this.listingCardLinks = page
      .getByRole('heading', { level: 2 })
      .locator('xpath=ancestor::a[contains(@href, "/inzerat/")]');
    this.listingPrices = page.getByRole('heading', { level: 3 }).filter({ hasText: /Kč/ });
    this.editSearchButton = page.getByRole('button', { name: /upravit hledání/i });
    this.mapContainer = page.locator('[class*="map"]').first();
    this.pageHeading = page.getByRole('heading', { level: 1 });
  }

  /** Open search results for a specific path */
  async open(path: string) {
    await this.navigate(path);
  }

  /** Sort results by given option and wait for page to reload */
  async sortBy(option: 'Nejlepší' | 'Nejnovější' | 'Nejlevnější') {
    await this.sortSelect.waitFor({ state: 'visible' });
    await this.sortSelect.selectOption({ label: option });
    await this.waitForPageLoad();
    await this.dismissOverlay();
    await expect(this.listingCardLinks.first()).toBeVisible();
  }

  /** Verify search results page loaded with results */
  async verifyResultsLoaded() {
    await this.waitForPageLoad();
    await expect(this.listingCardLinks.first()).toBeVisible();
  }

  /** Verify the result count text is displayed */
  async verifyResultCountVisible() {
    await expect(this.resultCount).toBeVisible();
  }

  /** Get all visible listing prices as numbers */
  async getListingPrices(): Promise<number[]> {
    const priceTexts = await this.listingPrices.allTextContents();
    return priceTexts.map(parsePrice).filter((n) => !isNaN(n));
  }

  /** Get all visible listing address texts */
  async getListingAddresses(): Promise<string[]> {
    const count = await this.listingCardLinks.count();
    const addresses: string[] = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = this.listingCardLinks.nth(i);
      const addressLocator = card.locator('p').first();
      const text = await addressLocator.textContent();
      if (text) addresses.push(text);
    }
    return addresses;
  }

  /** Click the first listing card to navigate to its detail page */
  async clickFirstListing() {
    const card = this.listingCardLinks.first();
    await card.waitFor({ state: 'visible' });
    await card.scrollIntoViewIfNeeded();
    await this.dismissOverlay();
    await card.click();
    await this.waitForPageLoad();
  }

  /** Verify map container is visible (desktop only) */
  async verifyMapVisible() {
    await expect(this.mapContainer).toBeVisible();
  }

  /** Verify map container is hidden (mobile) */
  async verifyMapHidden() {
    await expect(this.mapContainer).toBeHidden();
  }

  /** Get the page heading text (e.g. "Pronájem bytů Praha") */
  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) ?? '';
  }
}
