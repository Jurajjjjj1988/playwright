import { type Page, type Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly logo: Locator;
  readonly postAdButton: Locator;
  readonly navigation: Locator;
  readonly cookieAllowButton: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.getByRole('link', { name: /domovská stránka/i });
    this.postAdButton = page.getByRole('link', { name: /vložit inzerát/i });
    this.navigation = page.getByRole('navigation');
    this.cookieAllowButton = page.getByRole('button', { name: /allow all/i });
  }

  /** Navigate to a path relative to BASE_URL and dismiss overlays */
  async navigate(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlay();
  }

  /** Dismiss cookie consent banner if visible */
  async dismissOverlay() {
    try {
      await this.cookieAllowButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.cookieAllowButton.click();
      await this.cookieAllowButton.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Overlay not present or already dismissed
    }
  }

  /** Wait for page content to be loaded */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Verify the page navigated to a URL matching the given pattern */
  async verifyUrlMatches(pattern: RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  /** Get the current page URL */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /** Get the underlying page for Playwright operations (use sparingly in POM subclasses) */
  protected getPage(): Page {
    return this.page;
  }
}
