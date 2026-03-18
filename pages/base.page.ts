import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Abstract base page containing shared elements and actions
 * present on every page (header, navigation, cookie consent).
 * All page objects extend this class.
 */
export abstract class BasePage {
  /** Logo link — navigates to homepage */
  readonly logo: Locator;
  /** "Vložit inzerát" link in header */
  readonly postAdButton: Locator;
  /** Hamburger menu button */
  readonly menuButton: Locator;
  /** Main navigation bar */
  readonly navbar: Locator;
  /** Cookie consent "Allow all" button */
  readonly cookieAllowButton: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.getByTestId('navbar.logoUlovDomov');
    this.postAdButton = page.getByTestId('navbar.content.addOffer');
    this.menuButton = page.getByTestId('navbar.hamburgerButton');
    this.navbar = page.getByTestId('navbar');
    this.cookieAllowButton = page.getByRole('button', { name: /allow all/i });
  }

  /**
   * Navigate to a path relative to BASE_URL and dismiss cookie consent.
   * @param path - URL path to navigate to (e.g. '/', '/pronajem/byty/praha')
   */
  async navigate(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlay();
  }

  /**
   * Dismiss cookie consent banner if visible.
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

  /** Wait for page DOM content to be fully loaded */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify the current URL matches the given pattern.
   * @param pattern - RegExp pattern to match against the URL
   */
  async verifyUrlMatches(pattern: RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  /**
   * Get the current page URL.
   * @returns The full URL string
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Access the underlying Playwright Page object.
   * @returns The Playwright Page instance
   */
  protected getPage(): Page {
    return this.page;
  }
}
