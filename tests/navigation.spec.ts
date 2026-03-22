import { test, expect } from '../fixtures/pages.fixture';

test.describe('Navigation', () => {
  test('should_navigate_to_post_ad_page_and_back_via_logo', async ({ homePage }) => {
    await test.step('Open homepage', async () => {
      await homePage.open();
    });

    await test.step('Click "Vložit inzerát" and verify navigation', async () => {
      await homePage.clickPostAd();
    });

    await test.step('Navigate back via logo and verify homepage', async () => {
      await homePage.clickLogo();
      await homePage.verifyLoaded();
    });
  });
});
