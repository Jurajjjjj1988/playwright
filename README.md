# UlovDomov.cz — E2E Test Suite

Playwright test automation for [ulovdomov.cz](https://www.ulovdomov.cz), the Czech real estate platform.

## What's covered

| Test | What it verifies |
|------|-----------------|
| Homepage | Hero section, search form, listing sections, navigation |
| Search | Autocomplete location input, results match searched location |
| Sort | Price order after sorting by cheapest |
| Navigation | Post ad link, logo back to homepage |
| Map | Map visible on desktop, hidden on mobile |
| Responsive | Mobile layout — search form, edit button, map hidden |
| Login | Login via modal with email/password |
| Profile | Edit personal data, save, reload and verify persistence |

## Setup

```bash
npm install
npx playwright install chromium
```

Create `.env` in the project root:

```
BASE_URL=https://www.ulovdomov.cz
TEST_USER_EMAIL=your@email.com
TEST_USER_PASSWORD=yourpassword
```

## Run tests

```bash
# All tests
npx playwright test --project=chromium

# Single test file
npx playwright test tests/search.spec.ts --project=chromium

# With UI
npx playwright test --project=chromium --ui
```

## Project structure

```
├── pages/              # Page Object Models
│   ├── base.page.ts    # Shared: navigation, overlay dismiss, URL checks
│   ├── home.page.ts    # Homepage: search form, listings
│   ├── search-results.page.ts  # Results: sort, prices, addresses
│   ├── login.page.ts   # Login modal
│   └── profile.page.ts # Profile edit form
├── fixtures/           # Playwright fixtures for POM injection
├── helpers/            # Reusable utilities (price parsing, etc.)
├── data/               # Test constants and credentials reference
├── tests/              # Test specs
├── playwright.config.ts
└── .env                # Environment variables (not committed)
```

## Notes

- Cookie consent is automatically dismissed via `BasePage.dismissOverlay()`
- Login uses a modal, not a separate page — selectors use `data-test` attributes
- Listing detail tests may be skipped if the server returns 500 (external site instability)
- Tests run with 2 workers by default to avoid rate limiting
