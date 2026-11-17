import type { AccountType, TransactionType } from '../api';

const moneyFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formate un montant en euros : 1234.5 -> "1 234,50 €" */
export function formatMoney(amount: number): string {
  return `${moneyFormatter.format(Math.abs(amount))} €`;
}

/** Formate une date ISO au format JJ/MM/AAAA HH:mm (heure locale) */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth())}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

/** Convertit la saisie utilisateur d'un montant en nombre */
export function parseAmount(input: string): number {
  return parseFloat(input.trim());
}

/** Affiche un IBAN par blocs de 4 caractères */
export function formatIban(iban: string): string {
  return iban
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export function accountTypeLabel(type: AccountType): string {
  return type === 'checking' ? 'Compte courant' : 'Livret d’épargne';
}

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  transfer_in: 'Virement reçu',
  transfer_out: 'Virement émis',
  fee: 'Frais',
};

export function transactionTypeLabel(type: TransactionType): string {
  return TRANSACTION_LABELS[type];
}

export function isCredit(type: TransactionType): boolean {
  return type === 'deposit' || type === 'transfer_in';
}
