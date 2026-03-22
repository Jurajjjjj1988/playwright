import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProfilePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly occupationInput: Locator;
  readonly yearOfBirthInput: Locator;
  readonly phoneInput: Locator;
  readonly phonePrefixInput: Locator;
  readonly aboutMeTextarea: Locator;
  readonly saveButton: Locator;
  readonly profileHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="profil.edit.nameInput"]');
    this.lastNameInput = page.locator('[data-test="profil.edit.lastNameInput"]');
    this.occupationInput = page.locator('[data-test="profil.edit.ocupation"]');
    this.yearOfBirthInput = page.locator('[data-test="profil.edit.yearOfBirth"]');
    this.phoneInput = page.locator('[data-test="profil.offerContact.phone"]');
    this.phonePrefixInput = page.locator('[data-test="global.phoneInput.suggestPrefix"]');
    this.aboutMeTextarea = page.locator('[data-test="global.textarea"]');
    this.saveButton = page.getByRole('button', { name: /uložit/i });
    this.profileHeading = page.getByRole('heading', { name: /moje vizitka/i });
  }

  /** Navigate to the profile edit page */
  async open() {
    await this.navigate('/nastaveni/moje-vizitka');
  }

  /** Verify the profile edit page loaded */
  async verifyLoaded() {
    await expect(this.profileHeading).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
  }

  /** Fill personal data fields */
  async fillPersonalData(data: {
    firstName?: string;
    lastName?: string;
    occupation?: string;
    yearOfBirth?: string;
    aboutMe?: string;
  }) {
    if (data.firstName !== undefined) {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.occupation !== undefined) {
      await this.occupationInput.clear();
      await this.occupationInput.fill(data.occupation);
    }
    if (data.yearOfBirth !== undefined) {
      await this.yearOfBirthInput.clear();
      await this.yearOfBirthInput.fill(data.yearOfBirth);
    }
    if (data.aboutMe !== undefined) {
      await this.aboutMeTextarea.clear();
      await this.aboutMeTextarea.fill(data.aboutMe);
    }
  }

  /** Click save and wait for response */
  async save() {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.scrollIntoViewIfNeeded();
    await this.dismissOverlay();
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /** Get current values of all personal data fields */
  async getPersonalData(): Promise<{
    firstName: string;
    lastName: string;
    occupation: string;
    yearOfBirth: string;
    aboutMe: string;
  }> {
    return {
      firstName: await this.firstNameInput.inputValue(),
      lastName: await this.lastNameInput.inputValue(),
      occupation: await this.occupationInput.inputValue(),
      yearOfBirth: await this.yearOfBirthInput.inputValue(),
      aboutMe: await this.aboutMeTextarea.inputValue(),
    };
  }
}
