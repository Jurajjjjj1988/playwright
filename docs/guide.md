# Test Automation Guide — Selenium → Playwright

> Kompletný sprievodca architektúrou tohto projektu, teóriou za rozhodnutiami a porovnaním Selenium vs Playwright.
> Vetva `legacy/selenium` = pôvodný stav. Vetva `main` = finálny stav po migrácii.

---

## Obsah

1. [Prečo automatizovať testy?](#1-prečo-automatizovať-testy)
2. [Selenium — teória a architektura](#2-selenium--teória-a-architektura)
3. [Playwright — teória a architektura](#3-playwright--teória-a-architektura)
4. [Page Object Model (POM)](#4-page-object-model-pom)
5. [Selenium vs Playwright — priame porovnanie](#5-selenium-vs-playwright--priame-porovnanie)
6. [Popis každého súboru v projekte](#6-popis-každého-súboru-v-projekte)
7. [CI/CD — ako testy behajú automaticky](#7-cicd--ako-testy-behajú-automaticky)
8. [Docker a Kubernetes](#8-docker-a-kubernetes)
9. [Prečo sme migrovali](#9-prečo-sme-migrovali)

---

## 1. Prečo automatizovať testy?

Ručné testovanie funguje pre malé projekty. Ako aplikácia rastie, každé vydanie si vyžaduje prechádzať desiatky scenárov ručne — to je pomalé, únavné a ľahko sa niečo prehliadne.

**Automatické testy riešia tri problémy:**

| Problém                                              | Riešenie                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| Ručné testery robia chyby pri opakovaní              | Počítač robí to isté vždy rovnako                                  |
| Každý deploy treba otestovať odznova                 | CI spustí testy automaticky pri každom push                        |
| Regresie (stará chyba sa vráti) sa ťažko zachytávajú | Testy pokrývajú celé toky — ak sa niečo rozbije, okamžite vieš kde |

---

## 2. Selenium — teória a architektura

### Čo je Selenium?

Selenium je **knižnica** (nie framework) na ovládanie prehliadača cez WebDriver protokol. WebDriver je štandard W3C — čo znamená, že každý prehliadač (Chrome, Firefox, Edge) implementuje vlastný driver, a Selenium s ním komunikuje.

```
[Java test kód]
       ↓  HTTP (WebDriver Protocol W3C)
[ChromeDriver server :9515]
       ↓  DevTools / CDP
[Chrome prehliadač]
```

### Ako WebDriver funguje

Selenium posiela HTTP requesty na driver server. Každá akcia je jeden request:

```
POST /session/{id}/element       → nájdi element
POST /session/{id}/element/{id}/click  → klikni naň
GET  /session/{id}/url           → vráť aktuálnu URL
```

Toto je dôvod prečo je Selenium pomalé a prečo musia byť explicitné waity — každá akcia je round-trip cez HTTP.

### WebDriverWait a ExpectedConditions

Selenium samo o sebe **nečaká** na nič. Ak klikneš na element ktorý ešte neexistuje, dostaneš `NoSuchElementException`. Preto existuje `WebDriverWait`:

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit")));
```

`ExpectedConditions` je zbierka podmienok:

- `visibilityOfElementLocated` — element existuje v DOM a je viditeľný
- `elementToBeClickable` — element je viditeľný a nie je disabled
- `invisibilityOfElementLocated` — element zmizol (dobré na modaly)

**Problém:** musíš to písať ručne všade. Zabudneš → `NoSuchElementException`.

### Štruktúra Selenium projektu

```
pom.xml                          ← Maven config (závislosti, build)
src/test/java/ulovdomov/
  pages/
    BasePage.java                ← abstraktná trieda — shared logika
    HomePage.java                ← konkrétna stránka
    LoginPage.java
    SearchResultsPage.java
  tests/
    HomepageTest.java            ← test triedy s JUnit 5
    SearchTest.java
    LoginTest.java
```

---

## 3. Playwright — teória a architektura

### Čo je Playwright?

Playwright je **kompletný testovací framework** od Microsoftu. Nekomunikuje cez HTTP ako Selenium — používa **Chrome DevTools Protocol (CDP)** priamo.

```
[TypeScript test kód]
       ↓  WebSocket (CDP)
[Chrome/Firefox/WebKit prehliadač]
```

Pretože WebSocket je trvalé spojenie (nie request-response), akcie sú rýchlejšie a Playwright má **plnú kontrolu** nad prehliadačom v reálnom čase.

### Auto-wait — hlavná výhoda

Playwright **automaticky čaká** pred každou akciou:

```typescript
await page.click('#button'); // čaká kým je button viditeľný, enabled, nie skrytý za iným elementom
```

Interne pred každým `click()`, `fill()`, `check()` Playwright:

1. Čaká kým element existuje v DOM
2. Čaká kým je visible (nie `display:none`, nie `opacity:0`)
3. Čaká kým nie je za iným elementom (overlapping)
4. Čaká kým je stable (neanimuje)
5. Čaká kým je enabled (nie `disabled` atribút)
6. Klikne

To eliminuje celé triedy chýb, ktoré v Selenium riešiš cez `WebDriverWait`.

### Assertions s auto-retry

Playwright assertions (`expect`) tiež automaticky opakujú:

```typescript
await expect(page.locator('.card')).toBeVisible();
// Playwright skúša každých 100ms počas max 10 sekúnd (konfigurovateľné)
// Ak element nie je viditeľný hneď, čaká — nefailuje okamžite
```

Toto je zásadný rozdiel od JUnit `assertTrue(element.isDisplayed())` — ten sa zavolá raz.

### Fixtures systém

Playwright má zabudovaný **dependency injection** cez fixtures. Namiesto toho aby každý test sám vytváral `page` objekt, Playwright ho injektuje:

```typescript
test('my test', async ({ page }) => {
  // page je pripravená, izolovaná, automaticky zatvorená po teste
});
```

V tomto projekte rozširujeme tieto fixtures o vlastné Page Objects:

```typescript
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page)); // injektuj HomePage do každého testu
  },
});
```

Výsledok:

```typescript
test('homepage loads', async ({ homePage }) => {
  await homePage.open(); // priamo dostaneš hotový HomePage objekt
});
```

### Štruktúra Playwright projektu

```
playwright.config.ts             ← celá konfigurácia (timeout, workers, reporters...)
.env                             ← premenné prostredia (nie v git)
pages/
  base.page.ts                   ← abstraktná trieda — shared locators + metódy
  home.page.ts
  search-results.page.ts
  login.page.ts
  profile.page.ts
  listing-detail.page.ts
fixtures/
  pages.fixture.ts               ← injectuje Page Objects do testov
data/
  test-data.ts                   ← konštanty (URL, lokácie, credentials)
helpers/
  parsers.ts                     ← utility (parsovanie cien)
tests/
  homepage.spec.ts
  search.spec.ts
  login.spec.ts
  ...
.github/workflows/               ← CI pipeline
Dockerfile                       ← image pre spustenie v kontajneri
job.yaml                         ← Kubernetes Job definícia
```

---

## 4. Page Object Model (POM)

### Čo je POM a prečo ho používame

POM je **návrhový vzor** (design pattern). Hlavná myšlienka: selektory a akcie na stránke patria do jedného miesta, nie sú rozsypané po testoch.

**Bez POM:**

```typescript
// test 1
await page.locator('[data-test="loginModal.signIn.form.emailInput"]').fill(email);

// test 2
await page.locator('[data-test="loginModal.signIn.form.emailInput"]').fill(email);

// test 3 — rovnaký selektor znova
await page.locator('[data-test="loginModal.signIn.form.emailInput"]').fill(email);
```

Ak sa `data-test` atribút zmení → musíš opraviť na 20 miestach.

**S POM:**

```typescript
// login.page.ts — jeden selektor na jednom mieste
readonly emailInput = page.getByTestId('loginModal.signIn.form.emailInput');

// testy len volajú metódu
await loginPage.login(email, password);  // selektor nevedia, nestarajú sa
```

Zmena selektora = jedna oprava v page súbore.

### Triedy POM v tomto projekte

```
BasePage (abstraktná)
    ├── HomePage
    ├── SearchResultsPage
    ├── LoginPage
    ├── ProfilePage
    └── ListingDetailPage
```

`BasePage` obsahuje:

- Shared locators (logo, navbar, cookie banner)
- `navigate(path)` — navigácia + dismiss cookie bannera
- `dismissOverlay()` — vyhodí cookie banner ak existuje
- `verifyUrlMatches()` — kontrola URL pomocou regex

Každá podtrieda (napr. `HomePage`) rozširuje `BasePage` cez `extends`:

- Pridáva vlastné locators (len pre tú stránku)
- Pridáva vlastné metódy (akcie špecifické pre tú stránku)
- `super(page)` zavolá konštruktor `BasePage` a nastaví shared locators

---

## 5. Selenium vs Playwright — priame porovnanie

### Selektory

**Selenium:**

```java
// CSS selektor
By.cssSelector("[data-test='navbar.hamburgerButton']")

// XPath — verbose, krehký
By.xpath("//button[contains(translate(text(),'ABC...','abc...'),'allow all')]")

// Vlastné ID
By.id("submit")
```

**Playwright:**

```typescript
// Sémantické — testujú čo používateľ vidí
page.getByRole('button', { name: /allow all/i });
page.getByLabel('Email address');
page.getByPlaceholder('Hledat...');

// data-test atribút (skrátená syntax)
page.getByTestId('navbar.hamburgerButton'); // = page.locator('[data-test="..."]')

// CSS / XPath ako fallback
page.locator('[data-test="submit"]');
```

Playwright selektory sú **odolnejšie** — `getByRole('button', {name: 'Odoslať'})` funguje aj keď sa zmení CSS, ID, alebo pozícia elementu.

### Čakanie

|                    | Selenium                                  | Playwright                                          |
| ------------------ | ----------------------------------------- | --------------------------------------------------- |
| Základné správanie | `NoSuchElementException` hneď             | Auto-wait pred každou akciou                        |
| Explicitné waity   | `WebDriverWait` + `ExpectedConditions`    | Potrebné len výnimočne (`waitFor`)                  |
| Assertions         | `assertTrue(element.isDisplayed())` — raz | `expect(locator).toBeVisible()` — retry do timeoutu |
| Hard wait          | `Thread.sleep(2000)`                      | Zakázané — `waitForTimeout` sa nepoužíva            |

### Paralelizmus

**Selenium:**

- Každý test má vlastný `driver` (v `@BeforeAll` alebo `@BeforeEach`)
- Paralelné spúšťanie = komplikované, treba JUnit5 Parallel Execution config
- Zdieľaný `driver` = testy sa navzájom ovplyvňujú (stav prehliadača)

**Playwright:**

- Každý test dostane **izolovaný browser context** automaticky
- `workers: 2` v config = 2 testy súčasne, každý v svojom kontexte
- Netreba nič konfigurovať — izolácia je default

### Jazyk a ekosystém

|           | Selenium                             | Playwright                                       |
| --------- | ------------------------------------ | ------------------------------------------------ |
| Jazyky    | Java, Python, JS, C#, Ruby           | TypeScript/JS, Python, Java, C#                  |
| Framework | Knižnica (musíš pridať JUnit/TestNG) | Kompletný framework                              |
| Reporty   | Treba Allure alebo Surefire          | Zabudovaný HTML report, JSON, GitHub annotations |
| Trace     | Manuálne screenshoty                 | Trace Viewer (video + screenshot + sieť)         |
| Inšpekcia | Selenium IDE (zastaralé)             | `--ui` mode, Inspector, Codegen                  |

### Kód — porovnanie rovnakého testu

**Selenium (Java):**

```java
@Test
void searchByLocationShowsResults() {
    driver.get(BASE_URL + "/pronajem/byty/praha");
    assertTrue(searchResultsPage.urlContains("praha"));
    assertTrue(searchResultsPage.areResultsLoaded());
}

// SearchResultsPage.java
public boolean areResultsLoaded() {
    try {
        waitForVisible(LISTING_CARDS);
        return true;
    } catch (Exception e) {
        return false;
    }
}
```

**Playwright (TypeScript):**

```typescript
test('should display relevant results when searching by location', async ({ homePage, searchResultsPage }) => {
  await homePage.open();
  await homePage.searchByLocation('Praha');
  await homePage.submitSearch();

  await searchResultsPage.verifyUrlMatches(/praha/i);
  await searchResultsPage.verifyResultsLoaded();
});

// search-results.page.ts
async verifyResultsLoaded() {
  await expect(this.listingCards.first()).toBeVisible();
}
```

---

## 6. Popis každého súboru v projekte

### `playwright.config.ts`

Centrálna konfigurácia celého testu. **Jeden súbor riadi všetko.**

```typescript
export default defineConfig({
  testDir: './tests', // kde sú testy
  timeout: 30_000, // max čas na jeden test (30s)
  expect: { timeout: 10_000 }, // max čas na assertion retry (10s)
  retries: process.env.CI ? 2 : 1, // v CI skúsi 2× pred failom, lokálne 1×
  workers: process.env.CI ? 1 : 2, // CI: 1 vlákno (rate limiting), lokálne: 2
  use: {
    baseURL: process.env.BASE_URL, // zo .env — nie hardcoded
    testIdAttribute: 'data-test', // getByTestId() hľadá data-test="..."
    trace: 'on-first-retry', // zachytí trace len keď test failuje
    screenshot: 'only-on-failure', // screenshot len pri faile
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

**Prečo `retries: process.env.CI ? 2 : 1`?** Lokálne nechceš čakať na retry pri vlastnej chybe. V CI chceš znova skúsiť kvôli flakinesse siete alebo pomalému serveru.

**Prečo `workers: 1` v CI?** ulovdomov.cz má rate limiting. 2 paralelné testy = IP ban. Lokálne to nevadí.

---

### `pages/base.page.ts`

Abstraktná trieda. Nemôžeš vytvoriť `new BasePage(page)` — je to len základ pre ostatné stránky.

```typescript
export abstract class BasePage {
  readonly logo: Locator; // shared locator — logo je na každej stránke
  readonly cookieAllowButton: Locator;

  constructor(private readonly page: Page) {
    this.logo = page.getByTestId('navbar.logoUlovDomov');
    this.cookieAllowButton = page.getByRole('button', { name: /allow all/i });
  }

  async navigate(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlay(); // vždy vyhodí cookie po navigácii
  }
}
```

**Kľúčové rozhodnutia:**

- `private readonly page` — podtriedy k `page` pristupujú cez `protected getPage()`. Tým zabraňuješ priamemu volaniu `this.page.locator(...)` z testov — testy musia ísť cez metódy page objectu.
- `waitUntil: 'domcontentloaded'` — čaká len na HTML, nie na obrázky a fonty. Rýchlejšie, dostatočné pre testy.
- Cookie banner dismiss v `navigate()` — nemusíš na to myslieť v každom teste.

---

### `pages/home.page.ts`

Reprezentuje domovskú stránku ulovdomov.cz.

```typescript
constructor(page: Page) {
  super(page);  // zavolá BasePage konštruktor → nastaví shared locators
  this.locationInput = page.getByRole('textbox', { name: /město, ulice/i });
  this.searchButton = page.getByRole('link', { name: /hledat bydlení/i });
}
```

**Prečo `getByRole` a nie CSS selektor?**

`getByRole('textbox', { name: /město, ulice/i })` testuje to čo používateľ vidí a počuje (screen reader). CSS triedy sa menia pri rebrandingu, `role` a `aria-label` sú stabilnejšie.

**Autocomplete — `searchByLocation`:**

```typescript
async searchByLocation(location: string) {
  await this.locationInput.pressSequentially(location, { delay: 100 });
  // delay 100ms medzi klávesmi — simuluje písanie, triggertne autocomplete
  const autocompleteDialog = this.getPage().getByRole('dialog').last();
  await autocompleteDialog.waitFor({ state: 'visible' });
  await autocompleteDialog.getByText(location, { exact: true }).first().click();
}
```

Toto je **SPA problém** — autocomplete sa renderuje asynchrónne po každom stlačení klávesu. `pressSequentially` s `delay` simuluje reálneho používateľa a dáva Reactu čas render dropdown. V Selenium toto spôsobovalo prerušovaný fail pretože `Thread.sleep` nie je deterministický.

---

### `pages/search-results.page.ts`

Výsledky vyhľadávania.

```typescript
async sortBy(option: 'Nejlepší' | 'Nejnovější' | 'Nejlevnější') {
  await this.sortSelect.selectOption({ label: option });
  await this.waitForPageLoad();
  await expect(this.listingCards.first()).toBeVisible();
}
```

**TypeScript union type** `'Nejlepší' | 'Nejnovější' | 'Nejlevnější'` — IDE ti napoví možnosti a kompilátor ti nedovolí napísať neplatnú hodnotu. V Selenium si posielal `String` a na chybu si prišiel až za behu.

```typescript
async getListingPrices(): Promise<number[]> {
  const priceTexts = await this.listingPrices.allTextContents();
  return priceTexts.map(parsePrice).filter((n) => !isNaN(n));
}
```

Vracia **pole čísel** — test môže skontrolovať zoradenie `prices[0] <= prices[1]`. V Selenium by si musel texty parsovať v teste — POM to encapsuluje.

---

### `pages/login.page.ts`

```typescript
/**
 * Login form appears as a modal overlay, not a separate page.
 * Uses data-test attributes because the modal is a React portal.
 */
```

**Prečo komentár?** Login modal je React portal — renderuje sa mimo DOM hierarchie kde by si ho hľadal. `data-test` atribúty sú tu zámer (vývojári ich pridali pre testovanie), nie hack.

```typescript
async login(email: string, password: string) {
  await this.emailInput.fill(email);
  await expect(this.emailInput).toHaveValue(email);  // overenie pred submit
  await this.passwordInput.fill(password);
  await expect(this.passwordInput).toHaveValue(password);
  await this.submitButton.click();
}
```

**Prečo `expect().toHaveValue()` pred kliknutím?** `fill()` môže na niektorých SPA inputoch zlyhať (React controlled input neakceptuje programmatic fill). Assertion to overí pred submit — ak value nesedí, test failuje s jasnou správou namiesto "nesprávne credentials".

---

### `fixtures/pages.fixture.ts`

```typescript
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
```

**Čo `use` robí?** Je to "yield" — hovorí Playwright "odovzdaj tento objekt testu, počkaj kým test dobehne, potom pokračuj." Playwright tým zaručuje cleanup (zatvorí page, browser context) aj keď test failuje.

**Prečo fixture a nie `beforeEach`?**

```typescript
// BEZ fixture — každý test súbor kopíruje setup
beforeEach(async ({ page }) => {
  homePage = new HomePage(page);
});

// S fixture — raz definuješ, všade dostaneš
test('test', async ({ homePage }) => {  // priamo dostaneš HomePage
```

Fixture je **dependency injection** — test deklaruje čo potrebuje, Playwright to poskytne.

---

### `data/test-data.ts`

```typescript
export const TEST_DATA = {
  LOCATIONS: { PRAGUE: 'Praha', BRNO: 'Brno' },
  SORT_OPTIONS: {
    CHEAPEST: 'Nejlevnější' as const, // TypeScript literal type
  },
} as const; // celý objekt je readonly
```

**Prečo `as const`?** Zabraňuje tomu, aby niekto omylom prepísal `TEST_DATA.LOCATIONS.PRAGUE = 'Brno'`. TypeScript zároveň chápe `'Praha'` ako literal type (nie generický `string`) — TypeScript kontrola funguje presnejšie.

**Prečo testovacie dáta v súbore a nie priamo v teste?**

Keď sa zmení URL schéma (`/pronajem/byty/` → `/najem/byty/`), opravíš na jednom mieste. Testy zostanú čisté — popisujú správanie, nie implementačné detaily.

---

### `helpers/parsers.ts`

```typescript
export function parsePrice(text: string): number {
  return parseInt(text.replace(/\s/g, '').replace(/Kč/g, ''), 10);
}
```

Pomocná funkcia na parsovanie cien z textu (`"15 000 Kč"` → `15000`). Oddelená od page objektu pretože nie je zodpovednosť stránky parsovať čísla — je to utility.

**1 funkcia = 1 zodpovednosť** — ak sa zmení formát ceny, opravíš tu.

---

### `pom.xml` (Selenium branch)

```xml
<properties>
  <selenium.version>4.18.1</selenium.version>
  <junit.version>5.10.2</junit.version>
  <webdrivermanager.version>5.7.0</webdrivermanager.version>
</properties>
```

**Prečo verzie v `<properties>`?** DRY princíp — ak použiješ tú istú verziu na 3 miestach a chceš upgradovať, zmeníš ju len tu.

**WebDriverManager** — Selenium samo o sebe nevie kde je ChromeDriver. Musíš si ho stiahnuť a nastaviť cestu. `WebDriverManager.chromedriver().setup()` to robí automaticky pred každou test triedou.

**maven-surefire-plugin** — Maven build tool nevie spúšťať JUnit 5 testy bez tohto pluginu. Surefire je bridge medzi Maven a JUnit.

---

### `BasePage.java` (Selenium)

```java
public abstract class BasePage {
  protected WebDriver driver;
  protected WebDriverWait wait;

  public BasePage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
  }
}
```

**Prečo `protected` a nie `private`?** Podtriedy (`HomePage`, `LoginPage`) potrebujú priamo používať `driver` a `wait`. `protected` im to dovoľuje, ale zvonka (z testov) nie je prístupné.

**Prečo `Duration.ofSeconds(10)` a nie `10`?** Selenium 4 vyžaduje `Duration` objekt namiesto `long`. Je to typovo bezpečnejšie — `Duration.ofSeconds(10)` je jasné, `10` mohlo byť aj milisekundy.

```java
protected void dismissCookieBanner() {
  try {
    WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(5));
    WebElement btn = shortWait.until(
      ExpectedConditions.elementToBeClickable(
        By.xpath("//button[contains(translate(text(),'ABCDE...','abcde...'),'allow all')]")
      )
    );
    btn.click();
  } catch (Exception e) {
    // banner not present or already dismissed
  }
}
```

**Prečo `translate()` v XPath?** XPath je case-sensitive. `translate()` prekonvertuje text na malé písmená pred porovnaním — takto zachytíš "Allow all", "ALLOW ALL" aj "allow all".

**Prečo samostatný `shortWait` (5s) namiesto globálneho `wait` (10s)?** Banner nemusí existovať — nechceme čakať 10 sekúnd na niečo čo tam nie je. 5 sekúnd je dostatočné pre normálny load.

---

## 7. CI/CD — ako testy behajú automaticky

### GitHub Actions workflow

```yaml
on:
  push:
    branches: [main] # každý push na main
  pull_request: # každý PR
  schedule:
    - cron: '0 8 * * 1-5' # Mon-Fri 8:00 UTC

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci # inštalácia závislostí
      - run: npx playwright install chromium # inštalácia browsera
      - run: npx playwright test
```

**Prečo `npm ci` a nie `npm install`?**

- `npm install` môže updatovať `package-lock.json`
- `npm ci` inštaluje **presne** verzie z `package-lock.json` — deterministické buildy

**Prečo `actions/checkout@v4` pred `setup-node`?** `checkout` naklonuje repo. `setup-node` číta `.nvmrc` alebo `engines` z `package.json` — ten súbor musí existovať skôr.

### Reporty v CI

```typescript
reporter: process.env.CI
  ? [['html', { open: 'never' }], ['json'], ['github']]
  : [['html', { open: 'on-failure' }]],
```

- `github` reporter — pridáva anotácie priamo do PR diff (červená čiara pri faile)
- `html` → deployuje sa na GitHub Pages
- `json` → číta ho Slack webhook pre štatistiky

---

## 8. Docker a Kubernetes

### Dockerfile

```dockerfile
FROM node:20-slim          # slim = menší image, obsahuje len Node runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci                 # závislosti
RUN npx playwright install --with-deps chromium  # Chrome + system libs
COPY . .
CMD ["npx", "playwright", "test", "--project=chromium"]
```

**Prečo `node:20-slim` a nie `node:20`?** Full image obsahuje kompilátor, header súbory, build tools — pre runtime testovania nepotrebné. `slim` je cca 3× menší (300 MB vs 1 GB).

**Prečo `COPY package*.json ./` pred `COPY . .`?**

Docker cache — ak sa `package.json` nezmení, vrstva `npm ci` sa **nevykonáva znova** (cache hit). Ak by si dal `COPY . .` na začiatok, každá zmena v kóde by invalidovala cache a npm ci by bežal odznova (~2-3 minúty navyše).

### Kubernetes Job

```yaml
kind: Job # Job = jednorázová úloha, nie permanentná služba
spec:
  backoffLimit: 1 # ak job failne, skús 1× znova
  activeDeadlineSeconds: 1800 # max 30 minút celkovo — zabrání viseniu
  ttlSecondsAfterFinished: 300 # 5 minút po dokončení sa Job automaticky zmaže
  template:
    spec:
      restartPolicy: Never # nereštartuj kontajner — job buď uspeje alebo nie
```

**Prečo `Job` a nie `Deployment`?**

- `Deployment` = permanentná služba (webserver, API) — udržuje N replík nažive
- `Job` = jednorazová úloha (testy, migrácia DB, batch processing) — skončí, uvoľní resources

**Prečo `imagePullPolicy: IfNotPresent` a nie `Always`?**

- `Always` = vždy stiahni image z registry pred spustením
- `IfNotPresent` = použi lokálnu ak existuje, stiahni len keď chýba

Pre lokálne K8s (minikube, kind) neexistuje registry — `Always` by failovalo. `IfNotPresent` funguje pre oba prípady.

---

## 9. Prečo sme migrovali

Selenium branch existuje ako "before" stav. Toto sú konkrétne problémy ktoré viedli k migrácii:

### 1. Boilerplate v každej test triede

```java
// Selenium — toto je v KAŽDEJ test triede
@BeforeAll
static void setUp() {
  WebDriverManager.chromedriver().setup();
  ChromeOptions options = new ChromeOptions();
  options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage");
  driver = new ChromeDriver(options);
  driver.manage().window().maximize();
}

@AfterAll
static void tearDown() {
  if (driver != null) driver.quit();
}
```

```typescript
// Playwright — nič z toho, browser setup je v playwright.config.ts
test('my test', async ({ page }) => { ... });
```

### 2. SPA autocomplete fragility

```java
// Selenium — Thread.sleep je nepresný, SPA nestíha rendrovať
input.sendKeys(location);
Thread.sleep(1500);  // ???
List<WebElement> suggestions = driver.findElements(
    By.xpath("//div[@role='dialog']//span[text()='" + location + "']")
);
```

Tento test neprechádzal spoľahlivo — autocomplete sa niekedy renderoval po 800ms, inokedy po 1800ms. `Thread.sleep(1500)` zachytil väčšinu prípadov ale nie všetky.

```typescript
// Playwright — čaká kým dialog reálne existuje
await this.locationInput.pressSequentially(location, { delay: 100 });
const dialog = this.getPage().getByRole('dialog').last();
await dialog.waitFor({ state: 'visible' }); // presne správny moment
await dialog.getByText(location, { exact: true }).first().click();
```

### 3. TypeScript vs Java pre webový frontend

Aplikácia je React/TypeScript. `data-test` atribúty pridávajú vývojári — v TypeScripte. Test suite v rovnakom jazyku = ľahšia spolupráca, zdieľané typy, rovnaké tooling.

### 4. Reporting a debugging

Selenium: loguje do konzoly. Ak test failne v CI o 3 v noci, máš stack trace a screenshot (ak si ho explicitne naprogramoval).

Playwright: **Trace Viewer** zachytí screenshot každého kroku, console logy, network requesty, timeline — vieš presne čo sa stalo aj bez prístupu k stroju.

---

_Tento dokument popisuje projekt v stave k marcu 2026._
