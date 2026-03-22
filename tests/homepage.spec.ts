import { test, expect } from '../fixtures/pages.fixture';

test.describe('Homepage', () => {
  test('should_display_all_key_sections_when_page_loads', async ({ homePage }) => {
    await test.step('Open homepage', async () => {
      await homePage.open();
    });

    await test.step('Verify page title and hero section', async () => {
      await homePage.verifyLoaded();
      await expect(homePage.heroSubheading).toBeVisible();
    });

    await test.step('Verify search form is complete', async () => {
      await homePage.verifySearchFormVisible();
    });

    await test.step('Verify listing sections with show-more links', async () => {
      await homePage.verifyListingSectionsVisible();
    });

    await test.step('Verify header navigation elements', async () => {
      await expect(homePage.logo).toBeVisible();
      await expect(homePage.postAdButton).toBeVisible();
    });
  });
});
