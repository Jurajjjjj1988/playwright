import { test } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('Login', () => {
  test('should_login_successfully_with_valid_credentials', async ({ loginPage }) => {
    await test.step('Open homepage', async () => {
      await loginPage.navigate('/');
    });

    await test.step('Open login modal', async () => {
      await loginPage.openLoginModal();
    });

    await test.step('Fill credentials and submit', async () => {
      await loginPage.login(TEST_DATA.CREDENTIALS.EMAIL, TEST_DATA.CREDENTIALS.PASSWORD);
    });

    await test.step('Verify login was successful', async () => {
      await loginPage.verifyLoggedIn();
    });
  });
});
