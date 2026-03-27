import { test, expect } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

const hasCredentials = TEST_DATA.CREDENTIALS.EMAIL && TEST_DATA.CREDENTIALS.PASSWORD;

test.describe('Profile', () => {
  test.skip(!hasCredentials, 'TEST_USER_EMAIL and TEST_USER_PASSWORD not set');
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate('/');
    await loginPage.openLoginModal();
    await loginPage.login(TEST_DATA.CREDENTIALS.EMAIL, TEST_DATA.CREDENTIALS.PASSWORD);
    await loginPage.verifyLoggedIn();
  });

  test('should_update_personal_data_and_persist_changes', async ({ profilePage }) => {
    await test.step('Navigate to profile edit page', async () => {
      await profilePage.open();
      await profilePage.verifyLoaded();
    });

    await test.step('Read current profile data', async () => {
      const currentData = await profilePage.getPersonalData();
      expect(currentData.firstName).not.toBe('');
      expect(currentData.lastName).not.toBe('');
    });

    await test.step('Fill profile with test data', async () => {
      await profilePage.fillPersonalData(
        TEST_DATA.PROFILE.FIRST_NAME,
        TEST_DATA.PROFILE.LAST_NAME,
        TEST_DATA.PROFILE.OCCUPATION,
        TEST_DATA.PROFILE.YEAR_OF_BIRTH,
        TEST_DATA.PROFILE.ABOUT_ME,
      );
    });

    await test.step('Save profile changes', async () => {
      await profilePage.save();
    });

    await test.step('Reload page and verify data persisted', async () => {
      await profilePage.open();
      await profilePage.verifyLoaded();

      const savedData = await profilePage.getPersonalData();
      expect(savedData.firstName).toBe(TEST_DATA.PROFILE.FIRST_NAME);
      expect(savedData.lastName).toBe(TEST_DATA.PROFILE.LAST_NAME);
      expect(savedData.occupation).toBe(TEST_DATA.PROFILE.OCCUPATION);
      expect(savedData.yearOfBirth).toBe(TEST_DATA.PROFILE.YEAR_OF_BIRTH);
      expect(savedData.aboutMe).toBe(TEST_DATA.PROFILE.ABOUT_ME);
    });
  });
});
