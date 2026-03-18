import { test } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('Listing Detail', () => {
  test('should_display_listing_details_when_clicking_a_result', async ({
    searchResultsPage,
    listingDetailPage,
  }) => {
    await test.step('Open search results page', async () => {
      await searchResultsPage.open(TEST_DATA.URLS.RENTAL_APARTMENTS_PRAGUE);
    });

    await test.step('Wait for results to load', async () => {
      await searchResultsPage.verifyResultsLoaded();
    });

    await test.step('Click first listing and navigate to detail', async () => {
      await searchResultsPage.clickFirstListing();
    });

    await test.step('Verify listing detail URL', async () => {
      await listingDetailPage.verifyUrl();
    });

    await test.step('Verify listing detail shows title and price', async () => {
      await listingDetailPage.verifyLoaded();
    });
  });
});
