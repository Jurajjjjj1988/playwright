import { test, expect } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('Responsive - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should_adapt_layout_for_mobile_viewport', async ({ homePage, searchResultsPage }) => {
    await test.step('Open homepage on mobile and verify core elements', async () => {
      await homePage.open();
      await homePage.verifyLoaded();
    });

    await test.step('Verify search form is accessible on mobile', async () => {
      await homePage.verifySearchFormVisible();
    });

    await test.step('Navigate to search results on mobile', async () => {
      await searchResultsPage.open(TEST_DATA.URLS.RENTAL_APARTMENTS_PRAGUE);
      await searchResultsPage.verifyResultsLoaded();
    });

    await test.step('Verify map is hidden on mobile viewport', async () => {
      await searchResultsPage.verifyMapHidden();
    });

    await test.step('Verify edit search button is available on mobile', async () => {
      await expect(searchResultsPage.editSearchButton).toBeVisible();
    });
  });
});
