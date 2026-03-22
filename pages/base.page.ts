import { type Page, type Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly logo: Locator;
  readonly postAdButton: Locator;
  readonly menuButton: Locator;
  readonly navbar: Locator;
  readonly cookieAllowButton: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.getByTestId('navbar.logoUlovDomov');
    this.postAdButton = page.getByTestId('navbar.content.addOffer');
    this.menuButton = page.getByTestId('navbar.hamburgerButton');
    this.navbar = page.getByTestId('navbar');
    this.cookieAllowButton = page.getByRole('button', { name: /allow all/i });
  }

  async navigate(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlay();
  }

  /**
   * Safe to call multiple times — does nothing if banner is already dismissed.
   */
  async dismissOverlay() {
    try {
      await this.cookieAllowButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.cookieAllowButton.click();
      await this.cookieAllowButton.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Overlay not present or already dismissed
    }
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyUrlMatches(pattern: RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  protected getPage(): Page {
    return this.page;
  }
}
