import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the profile edit page (/nastaveni/moje-vizitka).
 * Contains personal data form fields and save functionality.
 */
export class ProfilePage extends BasePage {
  /** First name input field */
  readonly firstNameInput: Locator;
  /** Last name input field */
  readonly lastNameInput: Locator;
  /** Occupation input field */
  readonly occupationInput: Locator;
  /** Year of birth input field */
  readonly yearOfBirthInput: Locator;
  /** Phone number input field */
  readonly phoneInput: Locator;
  /** Phone prefix selector */
  readonly phonePrefixInput: Locator;
  /** "About me" textarea */
  readonly aboutMeTextarea: Locator;
  /** Save button */
  readonly saveButton: Locator;
  /** Page heading "Moje vizitka" */
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

  /** Navigate to the profile edit page */
  async open() {
    await this.navigate('/nastaveni/moje-vizitka');
  }

  /** Verify the profile edit page loaded — heading and first name visible */
  async verifyLoaded() {
    await expect(this.profileHeading).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
  }

  /**
   * Fill all personal data fields with provided values.
   * Clears each field before typing.
   * @param firstName - First name value
   * @param lastName - Last name value
   * @param occupation - Occupation value
   * @param yearOfBirth - Year of birth value
   * @param aboutMe - About me text value
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

  /** Click save button and wait for page to process */
  async save() {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.scrollIntoViewIfNeeded();
    await this.dismissOverlay();
    await this.saveButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Get current values of all personal data fields.
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
