import { test, expect } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('Profile', () => {
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
      await profilePage.fillPersonalData({
        firstName: TEST_DATA.PROFILE.FIRST_NAME,
        lastName: TEST_DATA.PROFILE.LAST_NAME,
        occupation: TEST_DATA.PROFILE.OCCUPATION,
        yearOfBirth: TEST_DATA.PROFILE.YEAR_OF_BIRTH,
        aboutMe: TEST_DATA.PROFILE.ABOUT_ME,
      });
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
