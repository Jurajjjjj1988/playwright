import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly locationInput: Locator;
  readonly searchButton: Locator;
  readonly heroHeading: Locator;
  readonly heroSubheading: Locator;
  readonly listingPromoHeadings: Locator;
  readonly showMoreRentals: Locator;
  readonly showMoreSales: Locator;
  readonly propertyTypeLabel: Locator;
  readonly searchTypeLabel: Locator;
  readonly searchForm: Locator;
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

  async open() {
    await this.navigate('/');
  }

  /**
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

  async submitSearch() {
    await this.searchButton.waitFor({ state: 'visible' });
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async clickPostAd() {
    await this.postAdButton.waitFor({ state: 'visible' });
    await this.postAdButton.click();
    await this.waitForPageLoad();
    await this.verifyUrlMatches(/vlozeni-inzeratu|vlozit/i);
  }

  async clickLogo() {
    await this.dismissOverlay();
    await this.logo.waitFor({ state: 'visible' });
    await this.logo.click();
    await this.waitForPageLoad();
  }

  async verifyLoaded() {
    await expect(this.getPage()).toHaveTitle(/ulovdomov/i);
    await expect(this.heroHeading).toBeVisible();
  }

  async verifySearchFormVisible() {
    await expect(this.searchTypeLabel).toBeVisible();
    await expect(this.propertyTypeLabel).toBeVisible();
    await expect(this.locationInput).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  async verifyListingSectionsVisible() {
    await expect(this.listingPromoHeadings.first()).toBeVisible();
    await expect(this.showMoreRentals).toBeVisible();
    await expect(this.showMoreSales).toBeVisible();
  }
}
