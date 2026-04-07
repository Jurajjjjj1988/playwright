import { test, expect } from '../fixtures/pages.fixture';

test.describe('Error Handling', () => {
  test('should_handle_nonexistent_listing_gracefully', async ({ page }) => {
    await test.step('Navigate to a listing URL that does not exist', async () => {
      const response = await page.goto('/inzerat/neexistujuci-inzerat-999999');
      const status = response?.status() ?? 0;

      // App should either redirect to homepage or show a friendly error page
      // It should NOT return a raw 500 server error
      expect(status).not.toBe(500);
    });

    await test.step('Verify user is not stuck on a broken page', async () => {
      // Either redirected to homepage or showing an error page with navigation
      const url = page.url();
      const hasNavigation = await page
        .getByTestId('navbar')
        .isVisible()
        .catch(() => false);
      const isHomepage = /ulovdomov\.cz\/?$/.test(url);

      expect(hasNavigation || isHomepage).toBe(true);
    });
  });

  test('should_handle_invalid_search_path_gracefully', async ({ page }) => {
    await test.step('Navigate to a malformed search URL', async () => {
      const response = await page.goto('/pronajem/neexistujuci-typ/neexistujuce-mesto');
      const status = response?.status() ?? 0;

      expect(status).not.toBe(500);
    });
  });
});
