import { randomInt } from 'node:crypto';

const BANK_CODE = '12345';
const BRANCH_CODE = '00001';
const COUNTRY = 'FR';

function mod97(numeric: string): number {
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = Number(String(remainder) + numeric.slice(i, i + 7)) % 97;
  }
  return remainder;
}

function lettersToDigits(value: string): string {
  return value
    .split('')
    .map((char) => (/[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char))
    .join('');
}

function ribKey(bank: string, branch: string, account: string): string {
  const key = 97 - ((89 * Number(bank) + 15 * Number(branch) + 3 * Number(account)) % 97);
  return String(key).padStart(2, '0');
}

export function computeCheckDigits(country: string, bban: string): string {
  const remainder = mod97(lettersToDigits(`${bban}${country}00`));
  return String(98 - remainder).padStart(2, '0');
}

export function normalizeIban(iban: string): string {
  return iban.replace(/\s+/g, '').toUpperCase();
}

export function isValidIban(raw: string): boolean {
  const iban = normalizeIban(raw);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  return mod97(lettersToDigits(rearranged)) === 1;
}

export function generateIban(): string {
  const account = String(randomInt(0, 100_000_000_000)).padStart(11, '0');
  const bban = `${BANK_CODE}${BRANCH_CODE}${account}${ribKey(BANK_CODE, BRANCH_CODE, account)}`;
  return `${COUNTRY}${computeCheckDigits(COUNTRY, bban)}${bban}`;
}
