import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly locationInput: Locator;
  readonly searchButton: Locator;
  readonly heroHeading: Locator;
  readonly heroSubheading: Locator;
  readonly listingCards: Locator;
  readonly showMoreRentals: Locator;
  readonly showMoreSales: Locator;
  readonly propertyTypeLabel: Locator;
  readonly searchTypeLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.locationInput = page.getByRole('textbox', { name: /město, ulice/i });
    this.searchButton = page.getByRole('link', { name: /hledat bydlení/i });
    this.heroHeading = page.getByRole('heading', { name: /nový domov na jeden klik/i });
    this.heroSubheading = page.getByRole('heading', { name: /najděte bydlení/i });
    this.listingCards = page.locator('a[href*="/inzerat/"]');
    this.showMoreRentals = page.getByRole('link', { name: /zobrazit další pronájmy/i });
    this.showMoreSales = page.getByRole('link', { name: /zobrazit další prodeje/i });
    this.propertyTypeLabel = page.getByText('Jakou nemovitost?');
    this.searchTypeLabel = page.getByText('Co hledáte?');
  }

  /** Open the homepage */
  async open() {
    await this.navigate('/');
  }

  /** Search for properties by location using autocomplete dropdown */
  async searchByLocation(location: string) {
    await this.locationInput.waitFor({ state: 'visible' });
    await this.locationInput.click();
    await this.locationInput.pressSequentially(location, { delay: 100 });
    const autocompleteDialog = this.getPage().getByRole('dialog').last();
    await autocompleteDialog.waitFor({ state: 'visible' });
    await autocompleteDialog.getByText(location, { exact: true }).first().click();
  }

  /** Click the search submit button and wait for navigation */
  async submitSearch() {
    await this.searchButton.waitFor({ state: 'visible' });
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /** Click the post ad button and wait for navigation */
  async clickPostAd() {
    await this.postAdButton.waitFor({ state: 'visible' });
    await this.postAdButton.click();
    await this.waitForPageLoad();
    await this.verifyUrlMatches(/vlozeni-inzeratu|vlozit/i);
  }

  /** Click the logo and wait for homepage to load */
  async clickLogo() {
    await this.dismissOverlay();
    await this.logo.waitFor({ state: 'visible' });
    await this.logo.click();
    await this.waitForPageLoad();
  }

  /** Verify the homepage loaded correctly with all key sections */
  async verifyLoaded() {
    await expect(this.getPage()).toHaveTitle(/ulovdomov/i);
    await expect(this.heroHeading).toBeVisible();
  }

  /** Verify the search form is complete and functional */
  async verifySearchFormVisible() {
    await expect(this.searchTypeLabel).toBeVisible();
    await expect(this.propertyTypeLabel).toBeVisible();
    await expect(this.locationInput).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  /** Verify listing sections with "show more" links are present */
  async verifyListingSectionsVisible() {
    await expect(this.listingCards.first()).toBeVisible();
    await expect(this.showMoreRentals).toBeVisible();
    await expect(this.showMoreSales).toBeVisible();
  }
}
