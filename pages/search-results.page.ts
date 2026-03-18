import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { parsePrice } from '../helpers/parsers';

/**
 * Page object for the search results page.
 * Contains listing cards, sort controls, result count, and map.
 */
export class SearchResultsPage extends BasePage {
  /** Sort dropdown */
  readonly sortSelect: Locator;
  /** Result count text (e.g. "3762 pronájmů") */
  readonly resultCount: Locator;
  /** Listing card containers */
  readonly listingCards: Locator;
  /** Listing card headings (h2 inside cards) */
  readonly listingHeadings: Locator;
  /** Price headings on listing cards */
  readonly listingPrices: Locator;
  /** "Upravit hledání" button (mobile) */
  readonly editSearchButton: Locator;
  /** Map container */
  readonly mapContainer: Locator;
  /** Page heading (h1) */
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

  /**
   * Navigate to search results page.
   * @param path - URL path (e.g. '/pronajem/byty/praha')
   */
  async open(path: string) {
    await this.navigate(path);
  }

  /**
   * Sort results by given option and wait for page to reload.
   * @param option - Sort option label ('Nejlepší', 'Nejnovější', 'Nejlevnější')
   */
  async sortBy(option: 'Nejlepší' | 'Nejnovější' | 'Nejlevnější') {
    await this.sortSelect.waitFor({ state: 'visible' });
    await this.sortSelect.selectOption({ label: option });
    await this.waitForPageLoad();
    await this.dismissOverlay();
    await expect(this.listingCards.first()).toBeVisible();
  }

  /** Verify search results page loaded and at least one listing is visible */
  async verifyResultsLoaded() {
    await this.waitForPageLoad();
    await expect(this.listingCards.first()).toBeVisible();
  }

  /** Verify the result count text is displayed */
  async verifyResultCountVisible() {
    await expect(this.resultCount).toBeVisible();
  }

  /**
   * Extract all visible listing prices as numbers.
   * @returns Array of price numbers (e.g. [15000, 26990, 42000])
   */
  async getListingPrices(): Promise<number[]> {
    const priceTexts = await this.listingPrices.allTextContents();
    return priceTexts.map(parsePrice).filter((n) => !isNaN(n));
  }

  /**
   * Extract listing address texts from visible cards.
   * @returns Array of address strings (e.g. ["Praha - Michle, U plynárny"])
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

  /** Click the first listing card and wait for detail page to load */
  async clickFirstListing() {
    const card = this.listingCards.first();
    await card.waitFor({ state: 'visible' });
    await card.scrollIntoViewIfNeeded();
    await this.dismissOverlay();
    await card.click();
    await this.waitForPageLoad();
  }

  /** Verify map is visible (desktop viewport) */
  async verifyMapVisible() {
    await expect(this.mapContainer).toBeVisible();
  }

  /** Verify map is hidden (mobile viewport) */
  async verifyMapHidden() {
    await expect(this.mapContainer).toBeHidden();
  }

  /**
   * Get the page heading text.
   * @returns Heading text (e.g. "Pronájem bytů Praha")
   */
  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) ?? '';
  }
}
