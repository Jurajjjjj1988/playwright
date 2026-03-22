export const TEST_DATA = {
  LOCATIONS: {
    PRAGUE: 'Praha',
    BRNO: 'Brno',
  },
  SEARCH_TYPES: {
    RENTAL: 'Pronájem' as const,
    SALE: 'Prodej' as const,
  },
  SORT_OPTIONS: {
    BEST: 'Nejlepší' as const,
    NEWEST: 'Nejnovější' as const,
    CHEAPEST: 'Nejlevnější' as const,
  },
  URLS: {
    RENTAL_APARTMENTS_PRAGUE: '/pronajem/byty/praha',
    SALE_HOUSES: '/prodej/domu',
    POST_AD: '/vlozeni-inzeratu',
  },
  CREDENTIALS: {
    EMAIL: process.env.TEST_USER_EMAIL ?? '',
    PASSWORD: process.env.TEST_USER_PASSWORD ?? '',
  },
  PROFILE: {
    FIRST_NAME: 'Juraj',
    LAST_NAME: 'Kapušanský',
    OCCUPATION: 'QA Engineer',
    YEAR_OF_BIRTH: '1990',
    ABOUT_ME: 'Hledám příjemné bydlení v Praze. Nekuřák, spolehlivý nájemník.',
  },
} as const;
