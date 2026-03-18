/** Parse a displayed price string into a number (e.g. "26 990 Kč" → 26990) */
export function parsePrice(text: string): number {
  return parseInt(text.replace(/\s/g, '').replace(/Kč.*/, ''), 10);
}

/** Parse a displayed count string into a number (e.g. "3 761 pronájmů" → 3761) */
export function parseCount(text: string): number {
  const match = text.match(/[\d\s]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/\s/g, ''), 10);
}
