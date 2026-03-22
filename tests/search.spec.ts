import { test, expect } from '../fixtures/pages.fixture';
import { TEST_DATA } from '../data/test-data';

test.describe('Search', () => {
  test('should_display_relevant_results_when_searching_by_location', async ({ homePage, searchResultsPage }) => {
    await test.step('Open homepage and search for Prague', async () => {
      await homePage.open();
      await homePage.searchByLocation(TEST_DATA.LOCATIONS.PRAGUE);
      await homePage.submitSearch();
    });

    await test.step('Verify URL contains the searched location', async () => {
      await searchResultsPage.verifyUrlMatches(/praha/i);
    });

    await test.step('Verify results are displayed with count', async () => {
      await searchResultsPage.verifyResultsLoaded();
      await searchResultsPage.verifyResultCountVisible();
    });

    await test.step('Verify listing addresses contain the searched location', async () => {
      const addresses = await searchResultsPage.getListingAddresses();
      expect(addresses.length).toBeGreaterThan(0);
      for (const address of addresses) {
        expect(address.toLowerCase()).toContain('praha');
      }
    });

    await test.step('Verify page heading references the location', async () => {
      const heading = await searchResultsPage.getPageHeadingText();
      expect(heading.toLowerCase()).toContain('praha');
    });
  });
});
