import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/search-results.page';
import { ListingDetailPage } from '../pages/listing-detail.page';
import { LoginPage } from '../pages/login.page';
import { ProfilePage } from '../pages/profile.page';

type PageFixtures = {
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  listingDetailPage: ListingDetailPage;
  loginPage: LoginPage;
  profilePage: ProfilePage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  listingDetailPage: async ({ page }, use) => {
    await use(new ListingDetailPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
});

export { expect } from '@playwright/test';
