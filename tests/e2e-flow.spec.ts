import { test, expect } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('E2E Flow', () => {
  test('should_complete_full_user_journey_from_homepage_to_listing_detail', async ({
    homePage,
    searchResultsPage,
    listingDetailPage,
  }) => {
    await test.step('Open homepage', async () => {
      await homePage.open();
    });

    await test.step('Verify homepage loaded', async () => {
      await homePage.verifyLoaded();
    });

    await test.step('Search for apartments in Prague', async () => {
      await homePage.searchByLocation(TEST_DATA.LOCATIONS.PRAGUE);
      await homePage.submitSearch();
    });

    await test.step('Verify search results loaded', async () => {
      await expect(searchResultsPage.page).toHaveURL(/praha/);
      await searchResultsPage.verifyResultsLoaded();
    });

    await test.step('Sort by newest', async () => {
      await searchResultsPage.sortBy(TEST_DATA.SORT_OPTIONS.NEWEST);
    });

    await test.step('Verify results still visible after sort', async () => {
      await searchResultsPage.verifyResultsLoaded();
    });

    await test.step('Click first listing', async () => {
      await searchResultsPage.clickFirstListing();
    });

    await test.step('Verify listing detail page', async () => {
      await listingDetailPage.verifyUrl();
      await listingDetailPage.verifyLoaded();
    });
  });
});
