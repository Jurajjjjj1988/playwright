import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Login form appears as a modal overlay, not a separate page.
 * Uses data-test attributes because the modal is a React portal.
 */
export class LoginPage extends BasePage {
  readonly loginMenuLink: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly closeModalButton: Locator;

  constructor(page: Page) {
    super(page);
    this.loginMenuLink = page.getByText('Přihlásit se', { exact: true }).first();
    this.emailInput = page.getByTestId('loginModal.signIn.form.emailInput');
    this.passwordInput = page.getByTestId('loginModal.signIn.form.passwordInput');
    this.submitButton = page.getByTestId('loginModal.signIn.form.button');
    this.closeModalButton = page.getByTestId('loginModal.closeButton');
  }

  async openLoginModal() {
    await this.menuButton.waitFor({ state: 'visible' });
    await this.menuButton.click();
    await this.loginMenuLink.waitFor({ state: 'visible' });
    await this.loginMenuLink.click();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async verifyLoggedIn() {
    await expect(this.emailInput).toBeHidden({ timeout: 10000 });
  }
}
