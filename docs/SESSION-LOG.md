# Session Log — 23. marca 2026

Podrobný rozpis všetkého čo sme urobili, aké problémy sme riešili a čo sme sa naučili.

---

## 1. Inicializácia projektu

**Čo:** Vytvorili sme Playwright E2E test projekt od nuly pre externý web ulovdomov.cz.

**Štruktúra:**

```
ulovdomov/
├── pages/           # Page Object Models
├── fixtures/        # Playwright fixtures
├── helpers/         # Reusable utilities
├── data/            # Test constants
├── tests/           # Test specs
├── .github/workflows/  # CI pipeline
├── .husky/          # Pre-commit hooks
├── playwright.config.ts
├── eslint.config.mjs
├── .prettierrc
├── .env             # Credentials (gitignored)
└── .gitignore
```

**Technológie:** Playwright, TypeScript, dotenv, ESLint, Prettier, Husky, GitHub Actions.

---

## 2. Prieskum stránky

**Problém:** ulovdomov.cz je SPA (React/Next.js) — statický fetch (WebFetch) nevidí dynamický obsah.

**Riešenie:** Kombinácia WebFetch pre základnú štruktúru + "exploration testy" s `console.log` a force-fail pre accessibility snapshoty. Toto bol najrýchlejší spôsob ako získať presné selektory.

**Zistenia:**

- Cookie consent banner sa objavuje opakovane (nielen pri prvom načítaní)
- Login je cez modal (React portal), nie samostatná stránka
- Stránka používa `data-test` atribúty (nie štandardné `data-testid`)
- Autocomplete inputy vyžadujú `pressSequentially()`, nie `fill()`
- Listing detail stránky občas vracajú server 500

---

## 3. Prvá verzia testov — problémy a opravy

### 3.1 Cookie consent blokoval interakciu

**Problém:** Po sort/filter reload sa cookie banner objavil znova a blokoval kliky na listing cards.
**Riešenie:** `dismissOverlay()` v BasePage, volaný pred každou click-heavy interakciou, nielen pri `navigate()`.

### 3.2 Autocomplete nefungovalo s `fill()`

**Problém:** `fill()` nastaví hodnotu bez JS eventov — autocomplete suggestions sa nezobrazili.
**Riešenie:** `pressSequentially('Praha', { delay: 100 })` + čakanie na suggestions dialog + klik na presnú zhodu.

### 3.3 Selektor matchoval viacero elementov

**Problém:** `a[href*="/inzerat/"]` matchoval aj card link aj "Zobrazit inzerát" button — flaky kliky.
**Riešenie:** Presnejší selektor cez heading: `getByRole('heading', { level: 2 }).locator('xpath=ancestor::a[...]')`.

### 3.4 Server 500 na listing detail

**Problém:** Niektoré inzeráty konzistentne vracali server error 500.
**Riešenie:** `test.skip()` pri detekcii error page — infra problém nie je bug v aplikácii.

### 3.5 SPA navigácia — klik nenavigovalo

**Problém:** Klik na listing card v accessibility tree ukázal `[active]` ale URL sa nezmenila.
**Riešenie:** `page.goto(href)` spúšťalo bot protection. Riešenie: klikať cez UI + `dismissOverlay()` pred klikom.

### 3.6 `page.goto()` na detail URL vracia 500

**Problém:** Programatická navigácia na `/inzerat/...` vracia server error, ale UI klik funguje.
**Riešenie:** Navigovať vždy cez UI kliky na externých stránkach.

---

## 4. Vylepšenie testov — z "len prechádzajú" na "chytia bugy"

### Pred:

| Test       | Čo overoval                   |
| ---------- | ----------------------------- |
| Sort       | "výsledky sú stále viditeľné" |
| Search     | "URL obsahuje praha"          |
| Responsive | kópia homepage testu          |
| Map        | `[class*="map"]` existuje     |

### Po:

| Test       | Čo overuje                                                     |
| ---------- | -------------------------------------------------------------- |
| Sort       | **ceny sú v ascending poradí**                                 |
| Search     | **adresy výsledkov obsahujú "Praha"** + heading + count        |
| Responsive | **mapa je hidden, edit button je visible** (mobilné správanie) |
| Map        | mapa + **listings sú stále prístupné** (prices, count)         |

**Kľúčové pravidlo:** Ak test prejde aj keď je feature rozbitý, test je zbytočný.

---

## 5. POM refaktoring

### Zmeny:

- `page` zmenený z `protected` na `private` — testy nepristupujú k page priamo
- Pridaný `getPage()` pre subclassy
- `dismissCookieConsent()` premenovaný na `dismissOverlay()` (všeobecnejšie)
- Pridaný `waitForPageLoad()` — testy volajú cez POM
- Pridaný `verifyUrlMatches()` — žiadny priamy `page.toHaveURL()` v testoch
- `HomePage` — nové metódy `clickPostAd()`, `clickLogo()` s plným wait patternom
- `SearchResultsPage.getListingPrices()` — používa `helpers/parsers.ts`

### Nové POM:

- **LoginPage** — `openLoginModal()`, `login()`, `verifyLoggedIn()`
- **ProfilePage** — `fillPersonalData()`, `save()`, `getPersonalData()`

---

## 6. Login a profil testy

### Login flow:

1. Hamburger menu → "Přihlásit se" → otvára sa modal (React portal)
2. Modal používa `data-test` atribúty (nie `data-testid`!)
3. `getByTestId()` nefungovalo — Playwright hľadá `data-testid`
4. Riešenie: `page.locator('[data-test="loginModal.signIn.form.emailInput"]')`
5. Submit button je `<button>`, nie `<input type="submit">`

### Profil flow:

1. Po logine navigácia na `/nastaveni/moje-vizitka`
2. Formulár s poliami: meno, priezvisko, povolanie, rok narodenia, o mne
3. **Kľúčový assertion:** po save → reload → overenie že dáta sa uložili
4. Login v `beforeEach` — autentifikácia je setup, nie test

---

## 7. Skills aktualizácia

Počas session sme doplnili tieto pravidlá do `.claude/skills/write-tests/`:

### Nové súbory:

- **`patterns/project-setup.md`** — folder layout, config templates, BasePage skeleton
- **`patterns/input-types.md`** — kedy fill() vs pressSequentially() vs selectOption()
- **`patterns/assertions.md`** — assertion decision tree (sort, search, filter, form, responsive)
- **`patterns/stability.md`** — wait strategy decision tree, before/after click checklist

### Aktualizované:

- **`SKILL.md`** — pridaná Phase 0 (Project Setup), referencie na nové patterns, exploration test v Phase 1
- **`patterns/selectors.md`** — "before writing selectors" sekcia, uniqueness check, `data-test` vs `data-testid`
- **`patterns/pom.md`** — private page, data extraction via helpers, auth je setup
- **`patterns/fixtures.md`** — overlay handling, helper functions
- **`antipatterns/common.md`** — stability antipatterns (no wait, overlay only on navigate, fill for autocomplete)

### Kľúčové pravidlá pridané:

1. Pred písaním selektorov — zisti konvencie appky
2. Autentifikácia je setup, nie test
3. Po uložení formulára — reload a over persistenciu
4. Ak selektor nenájde viditeľný element — skús iný typ
5. Neznámu stránku najprv preskúmaj exploration testom
6. Wait strategy: before click (visible + viewport + no overlay) + after click (URL/response/content)
7. Never assert on empty data — vždy check length first

---

## 8. CI/CD pipeline

### GitHub Actions (`tests.yml`):

- **Triggery:** push na main, PR, scheduled (Mon-Fri 8:00 UTC), manual
- **Lint:** ESLint + Prettier check pred testami
- **Testy:** Playwright s chromium, retries=2 v CI
- **Cache:** npm + Playwright browsers cache
- **Reporty:** HTML (GitHub Pages), JSON (Slack stats), GitHub annotations
- **Slack:** Block Kit správy s passed/failed/skipped counts, duration, link na report
- **Concurrency:** zruší starý run ak príde nový push

### Slack integrácia:

- Webhook URL uložený v GitHub Secrets
- Failure: červený kruh + detaily + button na report a Actions run
- Success (push): zelený kruh + counts + button na report

### GitHub Pages:

- Report sa deployne na `gh-pages` branch po každom main rune
- URL: `https://jurajjjjj1988.github.io/playwright/report/`

---

## 9. Code quality

- **ESLint** — typescript-eslint + prettier config, no-unused-vars, no-explicit-any, no-console
- **Prettier** — single quotes, trailing commas, 100 char line width
- **Husky** — pre-commit hook spúšťa `npm run lint`
- **`.gitignore`** — node_modules, test-results, playwright-report, .env

---

## 10. Čo sme sa naučili (pre budúce projekty)

1. **Exploration test je rýchlejší než hádanie** — na SPA stránkach napíš test čo loguje čo vidí
2. **Cookie consent sa objavuje opakovane** — dismiss pred každou interakciou
3. **`fill()` ≠ `pressSequentially()`** — autocomplete potrebuje character-by-character input
4. **`data-testid` ≠ `data-test`** — over aký atribút appka používa
5. **Modaly/portaly nie sú v accessibility tree** — použi CSS/data selektory
6. **Assertion musí chytiť bug** — sort over poradie, search over obsah, form over persistenciu
7. **Nikdy neassertuj na prázdnych dátach** — empty array loop prejde vždy
8. **`page` je `private`** — testy pristupujú k page len cez POM metódy
9. **Auth je setup** — login v beforeEach alebo fixture, nie v teste
10. **Externé stránky: klikaj cez UI** — `page.goto()` na detail URL môže spustiť bot protection
