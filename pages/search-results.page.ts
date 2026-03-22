import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { parsePrice } from '../helpers/parsers';

/**
 * Contains listing cards, sort controls, result count, and map.
 */
export class SearchResultsPage extends BasePage {
  readonly sortSelect: Locator;
  readonly resultCount: Locator;
  readonly listingCards: Locator;
  readonly listingHeadings: Locator;
  readonly listingPrices: Locator;
  readonly editSearchButton: Locator;
  readonly mapContainer: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.sortSelect = page.getByRole('combobox');
    this.resultCount = page.getByTestId('countOfOffers');
    this.listingCards = page.getByTestId('previewOfferLeases');
    this.listingHeadings = page.getByTestId('headingOfLeasesPreview');
    this.listingPrices = page.getByRole('heading', { level: 3 }).filter({ hasText: /Kč/ });
    this.editSearchButton = page.getByTestId('editSearchButton');
    this.mapContainer = page.getByTestId('mapOfLeases');
    this.pageHeading = page.getByRole('heading', { level: 1 });
  }

  async open(path: string) {
    await this.navigate(path);
  }

  /**
   * @param option - Sort option label ('Nejlepší' | 'Nejnovější' | 'Nejlevnější')
   */
  async sortBy(option: 'Nejlepší' | 'Nejnovější' | 'Nejlevnější') {
    await this.sortSelect.waitFor({ state: 'visible' });
    await this.sortSelect.selectOption({ label: option });
    await this.waitForPageLoad();
    await this.dismissOverlay();
    await expect(this.listingCards.first()).toBeVisible();
  }

  async verifyResultsLoaded() {
    await this.waitForPageLoad();
    await expect(this.listingCards.first()).toBeVisible();
  }

  async verifyResultCountVisible() {
    await expect(this.resultCount).toBeVisible();
  }

  /**
   * @returns Array of price numbers (e.g. [15000, 26990, 42000])
   */
  async getListingPrices(): Promise<number[]> {
    const priceTexts = await this.listingPrices.allTextContents();
    return priceTexts.map(parsePrice).filter((n) => !isNaN(n));
  }

  /**
   * @returns Array of address strings from the first 5 visible cards
   */
  async getListingAddresses(): Promise<string[]> {
    const count = await this.listingCards.count();
    const addresses: string[] = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = this.listingCards.nth(i);
      const text = await card.textContent();
      if (text) addresses.push(text);
    }
    return addresses;
  }

  async clickFirstListing() {
    const card = this.listingCards.first();
    await card.waitFor({ state: 'visible' });
    await card.scrollIntoViewIfNeeded();
    await this.dismissOverlay();
    await card.click();
    await this.waitForPageLoad();
  }

  async verifyMapVisible() {
    await expect(this.mapContainer).toBeVisible();
  }

  async verifyMapHidden() {
    await expect(this.mapContainer).toBeHidden();
  }

  /**
   * @returns Heading text (e.g. "Pronájem bytů Praha")
   */
  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) ?? '';
  }
}
