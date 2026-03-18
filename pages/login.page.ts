import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the login modal.
 * The login form appears as a modal overlay, not a separate page.
 * Uses data-test attributes because the modal is a React portal.
 */
export class LoginPage extends BasePage {
  /** "Přihlásit se" link in the side menu */
  readonly loginMenuLink: Locator;
  /** Email input field in the login modal */
  readonly emailInput: Locator;
  /** Password input field in the login modal */
  readonly passwordInput: Locator;
  /** Submit button in the login modal */
  readonly submitButton: Locator;
  /** Close button on the login modal */
  readonly closeModalButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginMenuLink = page.getByText('Přihlásit se', { exact: true }).first();
    this.emailInput = page.getByTestId('loginModal.signIn.form.emailInput');
    this.passwordInput = page.getByTestId('loginModal.signIn.form.passwordInput');
    this.submitButton = page.getByTestId('loginModal.signIn.form.button');
    this.closeModalButton = page.getByTestId('loginModal.closeButton');
  }

  /** Open the login modal via hamburger menu → "Přihlásit se" */
  async openLoginModal() {
    await this.menuButton.waitFor({ state: 'visible' });
    await this.menuButton.click();
    await this.loginMenuLink.waitFor({ state: 'visible' });
    await this.loginMenuLink.click();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill email and password fields and submit the login form.
   * @param email - User email address
   * @param password - User password
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  /** Verify login was successful — the modal should disappear */
  async verifyLoggedIn() {
    await expect(this.emailInput).toBeHidden({ timeout: 10000 });
  }
}
