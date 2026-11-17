export const SAVINGS_ANNUAL_RATE = 0.03;

/**
 * Intérêts projetés d'un livret sur `months` mois,
 * avec capitalisation mensuelle (taux mensuel = taux annuel / 12).
 */
export function projectSavingsInterest(
  balance: number,
  months = 12,
  annualRate = SAVINGS_ANNUAL_RATE,
): number {
  if (balance <= 0) return 0;
  let projected = balance;
  for (let month = 1; month < months; month++) {
    projected += projected * (annualRate / 12);
  }
  return Math.round((projected - balance) * 100) / 100;
}
