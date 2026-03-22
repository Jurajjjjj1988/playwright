import { test, expect } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('Sorting', () => {
  test('should_sort_results_by_cheapest_price', async ({ searchResultsPage }) => {
    await test.step('Open search results page', async () => {
      await searchResultsPage.open(TEST_DATA.URLS.RENTAL_APARTMENTS_PRAGUE);
    });

    await test.step('Verify default results are loaded', async () => {
      await searchResultsPage.verifyResultsLoaded();
    });

    await test.step('Sort by cheapest and verify prices are in ascending order', async () => {
      await searchResultsPage.sortBy(TEST_DATA.SORT_OPTIONS.CHEAPEST);
      const prices = await searchResultsPage.getListingPrices();

      expect(prices.length).toBeGreaterThan(1);

      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    await test.step('Verify result count is still visible after sorting', async () => {
      await searchResultsPage.verifyResultCountVisible();
    });
  });
});
