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
    this.firstNameInput = page.getByTestId('profil.edit.nameInput');
    this.lastNameInput = page.getByTestId('profil.edit.lastNameInput');
    this.occupationInput = page.getByTestId('profil.edit.ocupation');
    this.yearOfBirthInput = page.getByTestId('profil.edit.yearOfBirth');
    this.phoneInput = page.getByTestId('profil.offerContact.phone');
    this.phonePrefixInput = page.getByTestId('global.phoneInput.suggestPrefix');
    this.aboutMeTextarea = page.getByTestId('global.textarea');
    this.saveButton = page.getByRole('button', { name: /uložit/i });
    this.profileHeading = page.getByRole('heading', { name: /moje vizitka/i });
  }

  async open() {
    await this.navigate('/nastaveni/moje-vizitka');
  }

  async verifyLoaded() {
    await expect(this.profileHeading).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
  }

  /**
   * Clears each field before typing.
   */
  async fillPersonalData(
    firstName: string,
    lastName: string,
    occupation: string,
    yearOfBirth: string,
    aboutMe: string,
  ) {
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.clear();
    await this.lastNameInput.fill(lastName);
    await this.occupationInput.clear();
    await this.occupationInput.fill(occupation);
    await this.yearOfBirthInput.clear();
    await this.yearOfBirthInput.fill(yearOfBirth);
    await this.aboutMeTextarea.clear();
    await this.aboutMeTextarea.fill(aboutMe);
  }

  async save() {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.scrollIntoViewIfNeeded();
    await this.dismissOverlay();
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /**
   * @returns Object with firstName, lastName, occupation, yearOfBirth, aboutMe
   */
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
