# ulovdomov.cz — Selenium Test Suite

> **This branch is archived.** Tests were migrated to Playwright (TypeScript) — see [main](https://github.com/Jurajjjjj1988/playwright).
>
> Migration reasons: verbose setup per test class, manual `Thread.sleep` for dynamic content, no built-in auto-wait, harder TypeScript integration.

---

## Stack

- Java 11
- Selenium 4.18
- JUnit 5
- WebDriverManager (automatic chromedriver setup)
- Maven

## Structure

```
src/test/java/ulovdomov/
  pages/        ← Page Object Model
  tests/        ← Test classes
```

## Running

```bash
mvn test
```

Environment variables:

| Variable             | Default                    |
| -------------------- | -------------------------- |
| `BASE_URL`           | `https://www.ulovdomov.cz` |
| `TEST_USER_EMAIL`    | —                          |
| `TEST_USER_PASSWORD` | —                          |

## Coverage

| Test class     | What it covers                                  |
| -------------- | ----------------------------------------------- |
| `HomepageTest` | Hero heading, listing promo sections            |
| `SearchTest`   | Location autocomplete, results load, price sort |
| `LoginTest`    | Login modal flow, success verification          |
