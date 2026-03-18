import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the ulovdomov.cz homepage.
 * Contains search form, hero section, and listing preview sections.
 */
export class HomePage extends BasePage {
  /** Location search input */
  readonly locationInput: Locator;
  /** Search submit button "Hledat bydlení" */
  readonly searchButton: Locator;
  /** Main hero heading */
  readonly heroHeading: Locator;
  /** Hero subheading */
  readonly heroSubheading: Locator;
  /** Listing promo section headings */
  readonly listingPromoHeadings: Locator;
  /** "Zobrazit další pronájmy" link */
  readonly showMoreRentals: Locator;
  /** "Zobrazit další prodeje" link */
  readonly showMoreSales: Locator;
  /** "Jakou nemovitost?" label */
  readonly propertyTypeLabel: Locator;
  /** "Co hledáte?" label */
  readonly searchTypeLabel: Locator;
  /** Search form container */
  readonly searchForm: Locator;
  /** Address input wrapper */
  readonly addressInputWrapper: Locator;

  constructor(page: Page) {
    super(page);
    this.heroHeading = page.getByTestId('undefined.content.title');
    this.heroSubheading = page.getByTestId('undefined.content.subtitle');
    this.searchForm = page.getByTestId('global.writeBox');
    this.addressInputWrapper = page.getByTestId('searchAdressInput');
    this.listingPromoHeadings = page.getByTestId('listingsPromo.heading');
    this.locationInput = page.getByRole('textbox', { name: /město, ulice/i });
    this.searchButton = page.getByRole('link', { name: /hledat bydlení/i });
    this.showMoreRentals = page.getByRole('link', { name: /zobrazit další pronájmy/i });
    this.showMoreSales = page.getByRole('link', { name: /zobrazit další prodeje/i });
    this.propertyTypeLabel = page.getByText('Jakou nemovitost?');
    this.searchTypeLabel = page.getByText('Co hledáte?');
  }

  /** Navigate to the homepage */
  async open() {
    await this.navigate('/');
  }

  /**
   * Search for properties by location using the autocomplete dropdown.
   * @param location - Location name to search for (e.g. 'Praha')
   */
  async searchByLocation(location: string) {
    await this.locationInput.waitFor({ state: 'visible' });
    await this.locationInput.click();
    await this.locationInput.pressSequentially(location, { delay: 100 });
    const autocompleteDialog = this.getPage().getByRole('dialog').last();
    await autocompleteDialog.waitFor({ state: 'visible' });
    await autocompleteDialog.getByText(location, { exact: true }).first().click();
  }

  /** Click the search submit button and wait for page to load */
  async submitSearch() {
    await this.searchButton.waitFor({ state: 'visible' });
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /** Click the "Vložit inzerát" link and verify navigation */
  async clickPostAd() {
    await this.postAdButton.waitFor({ state: 'visible' });
    await this.postAdButton.click();
    await this.waitForPageLoad();
    await this.verifyUrlMatches(/vlozeni-inzeratu|vlozit/i);
  }

  /** Click the logo to navigate back to homepage */
  async clickLogo() {
    await this.dismissOverlay();
    await this.logo.waitFor({ state: 'visible' });
    await this.logo.click();
    await this.waitForPageLoad();
  }

  /** Verify homepage loaded — checks page title and hero heading */
  async verifyLoaded() {
    await expect(this.getPage()).toHaveTitle(/ulovdomov/i);
    await expect(this.heroHeading).toBeVisible();
  }

  /** Verify the search form displays all fields and submit button */
  async verifySearchFormVisible() {
    await expect(this.searchTypeLabel).toBeVisible();
    await expect(this.propertyTypeLabel).toBeVisible();
    await expect(this.locationInput).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  /** Verify listing preview sections are present */
  async verifyListingSectionsVisible() {
    await expect(this.listingPromoHeadings.first()).toBeVisible();
    await expect(this.showMoreRentals).toBeVisible();
    await expect(this.showMoreSales).toBeVisible();
  }
}
