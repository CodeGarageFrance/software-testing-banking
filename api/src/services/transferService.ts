import { UnitOfWork } from '../db/unitOfWork';
import { computeTransferFee } from '../domain/fees';
import { isValidIban, normalizeIban } from '../domain/iban';
import { parseAmount, parseId, parseLabel } from '../domain/validation';
import { HttpError } from '../errors';

export interface TransferRequest {
  fromAccountId: unknown;
  toIban: unknown;
  amount: unknown;
  label?: unknown;
}

export interface TransferResult {
  amount: number;
  fee: number;
  fromAccountId: number;
  toIban: string;
  balanceAfter: number;
}

const DAILY_LIMIT_WINDOW_HOURS = 24;

export class TransferService {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async transfer(userId: number, request: TransferRequest): Promise<TransferResult> {
    const fromAccountId = parseId(request.fromAccountId);
    const amount = parseAmount(request.amount);
    const label = parseLabel(request.label);
    if (typeof request.toIban !== 'string' || !isValidIban(request.toIban)) {
      throw new HttpError(400, 'IBAN destinataire invalide');
    }
    const toIban = normalizeIban(request.toIban);

    return this.unitOfWork(async ({ users, accounts, transactions }) => {
      const source = await accounts.findOwned(fromAccountId, userId);
      if (!source) {
        throw new HttpError(404, 'Compte source introuvable');
      }
      if (source.status !== 'active') {
        throw new HttpError(409, 'Le compte source est clôturé');
      }

      const destination = await accounts.findByIban(toIban);
      if (!destination) {
        throw new HttpError(404, 'Compte destinataire introuvable');
      }

      const isExternal = destination.userId !== userId;
      if (source.type === 'savings' && isExternal) {
        throw new HttpError(403, 'Un livret ne peut alimenter que vos propres comptes');
      }

      if (isExternal) {
        const user = await users.findById(userId);
        const alreadySent = await transactions.sumExternalTransfersSince(userId, DAILY_LIMIT_WINDOW_HOURS);
        if (!user || alreadySent > user.dailyTransferLimit) {
          throw new HttpError(422, 'Plafond de virement journalier dépassé');
        }
      }

      const fee = computeTransferFee(amount, isExternal);
      if (source.balance - amount < -source.overdraftLimit) {
        throw new HttpError(422, 'Solde insuffisant');
      }

      const balanceAfter = source.balance - amount - fee;
      await accounts.setBalance(source.id, balanceAfter);
      await accounts.setBalance(destination.id, destination.balance + amount);

      await transactions.create({
        accountId: source.id,
        type: 'transfer_out',
        amount,
        label,
        counterpartyAccountId: destination.id,
      });
      await transactions.create({
        accountId: destination.id,
        type: 'transfer_in',
        amount,
        label,
        counterpartyAccountId: source.id,
      });
      if (fee > 0) {
        await transactions.create({ accountId: source.id, type: 'fee', amount: fee, label: 'Frais de virement' });
      }

      return { amount, fee, fromAccountId: source.id, toIban, balanceAfter };
    });
  }
}
