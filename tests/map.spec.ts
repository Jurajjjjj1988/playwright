import { test, expect } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('Map View', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should_display_map_alongside_results_on_desktop', async ({ searchResultsPage }) => {
    await test.step('Open search results on desktop viewport', async () => {
      await searchResultsPage.open(TEST_DATA.URLS.RENTAL_APARTMENTS_PRAGUE);
    });

    await test.step('Verify listing results are loaded', async () => {
      await searchResultsPage.verifyResultsLoaded();
    });

    await test.step('Verify map container is visible on desktop', async () => {
      await searchResultsPage.verifyMapVisible();
    });

    await test.step('Verify results and map coexist — listings still accessible', async () => {
      await searchResultsPage.verifyResultCountVisible();
      const prices = await searchResultsPage.getListingPrices();
      expect(prices.length).toBeGreaterThan(0);
    });
  });
});
