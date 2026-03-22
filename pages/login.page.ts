import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly menuButton: Locator;
  readonly loginMenuLink: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly closeModalButton: Locator;

  constructor(page: Page) {
    super(page);
    this.menuButton = page.getByRole('button', { name: /otevřít menu/i });
    this.loginMenuLink = page.getByText('Přihlásit se').first();
    this.emailInput = page.locator('[data-test="loginModal.signIn.form.emailInput"]');
    this.passwordInput = page.locator('[data-test="loginModal.signIn.form.passwordInput"]');
    this.submitButton = page.locator('[data-test="loginModal.signIn.form.button"]');
    this.closeModalButton = page.locator('[data-test="loginModal.closeButton"]');
  }

  /** Open the login modal from any page */
  async openLoginModal() {
    await this.menuButton.waitFor({ state: 'visible' });
    await this.menuButton.click();
    await this.loginMenuLink.waitFor({ state: 'visible' });
    await this.loginMenuLink.click();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /** Fill and submit login form */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  /** Verify login was successful by checking modal disappeared */
  async verifyLoggedIn() {
    await expect(this.emailInput).toBeHidden({ timeout: 10000 });
  }
}
