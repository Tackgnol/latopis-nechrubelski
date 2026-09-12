const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

export function toRomanNumeral(arabic: number): string {
  const numeral = ROMAN_NUMERALS[arabic - 1];
  if (!numeral) throw new RangeError(`No roman numeral for psalm ${arabic}`);
  return numeral;
}
