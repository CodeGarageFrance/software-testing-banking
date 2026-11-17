export const TRANSFER_FEE_RATE = 0.005;
export const MAX_TRANSFER_FEE = 5;

/**
 * Frais d'un virement.
 * Les virements entre comptes d'un même client sont gratuits.
 * Les virements vers un autre client coûtent 0,5 % du montant, plafonnés à 5 €.
 */
export function computeTransferFee(amount: number, isExternal: boolean): number {
  if (!isExternal) return 0;
  const fee = Math.round(amount * TRANSFER_FEE_RATE * 100) / 100;
  return Math.min(fee, MAX_TRANSFER_FEE);
}
