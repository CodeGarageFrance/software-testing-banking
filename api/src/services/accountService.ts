import { UnitOfWork } from '../db/unitOfWork';
import { generateIban } from '../domain/iban';
import { projectSavingsInterest } from '../domain/interest';
import { Account, MonthlySummary, TransactionListItem } from '../domain/models';
import {
  DEFAULT_PAGE_SIZE,
  MAX_ACTIVE_ACCOUNTS_PER_USER,
  MAX_DEPOSIT_AMOUNT,
  MAX_PAGE_SIZE,
} from '../domain/rules';
import { parseAmount, parseLabel, requireName } from '../domain/validation';
import { HttpError } from '../errors';
import { AccountRepository, TransactionRepository } from '../repositories';

export interface AccountDetails extends Account {
  projectedInterest12Months: number | null;
}

export interface TransactionQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
}

export interface TransactionPage {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  items: TransactionListItem[];
}

export class AccountService {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly transactions: TransactionRepository,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  private async getOwned(accountId: number, userId: number): Promise<Account> {
    const account = await this.accounts.findOwned(accountId, userId);
    if (!account) {
      throw new HttpError(404, 'Compte introuvable');
    }
    return account;
  }

  list(userId: number): Promise<Account[]> {
    return this.accounts.listByUser(userId);
  }

  async open(userId: number, type: unknown, rawName: unknown): Promise<Account> {
    if (type !== 'checking' && type !== 'savings') {
      throw new HttpError(400, 'Type de compte invalide (checking ou savings)');
    }
    const name = requireName(rawName, 'nom du compte');

    const activeCount = await this.accounts.countActiveByUser(userId);
    if (activeCount > MAX_ACTIVE_ACCOUNTS_PER_USER) {
      throw new HttpError(409, `Vous ne pouvez pas avoir plus de ${MAX_ACTIVE_ACCOUNTS_PER_USER} comptes actifs`);
    }

    const id = await this.accounts.create({ userId, iban: generateIban(), type, name });
    return this.getOwned(id, userId);
  }

  async get(accountId: number, userId: number): Promise<AccountDetails> {
    const account = await this.getOwned(accountId, userId);
    return {
      ...account,
      projectedInterest12Months: account.type === 'savings' ? projectSavingsInterest(account.balance) : null,
    };
  }

  async close(accountId: number, userId: number): Promise<Account> {
    const account = await this.getOwned(accountId, userId);
    if (account.status === 'closed') {
      throw new HttpError(409, 'Ce compte est déjà clôturé');
    }
    if (account.balance > 0) {
      throw new HttpError(409, 'Le solde doit être nul pour clôturer le compte');
    }
    await this.accounts.close(account.id);
    return this.getOwned(account.id, userId);
  }

  async deposit(accountId: number, userId: number, rawAmount: unknown, rawLabel?: unknown): Promise<Account> {
    const account = await this.getOwned(accountId, userId);
    const amount = parseAmount(rawAmount);
    if (amount > MAX_DEPOSIT_AMOUNT) {
      throw new HttpError(400, `Un dépôt ne peut pas dépasser ${MAX_DEPOSIT_AMOUNT} €`);
    }
    if (account.status !== 'active') {
      throw new HttpError(409, 'Ce compte est clôturé');
    }
    const label = parseLabel(rawLabel) ?? 'Dépôt';

    await this.unitOfWork(async ({ accounts, transactions }) => {
      await accounts.addToBalance(account.id, amount);
      await transactions.create({ accountId: account.id, type: 'deposit', amount, label });
    });
    return this.getOwned(account.id, userId);
  }

  async withdraw(accountId: number, userId: number, rawAmount: unknown, rawLabel?: unknown): Promise<Account> {
    const account = await this.getOwned(accountId, userId);
    const amount = parseAmount(rawAmount);
    if (account.status !== 'active') {
      throw new HttpError(409, 'Ce compte est clôturé');
    }
    const label = parseLabel(rawLabel) ?? 'Retrait';

    await this.unitOfWork(async ({ accounts, transactions }) => {
      if (!(await accounts.withdrawWithinOverdraft(account.id, amount))) {
        throw new HttpError(422, 'Solde insuffisant');
      }
      await transactions.create({ accountId: account.id, type: 'withdrawal', amount, label });
    });
    return this.getOwned(account.id, userId);
  }

  async listTransactions(accountId: number, query: TransactionQuery): Promise<TransactionPage> {
    const account = await this.accounts.findById(accountId);
    if (!account) {
      throw new HttpError(404, 'Compte introuvable');
    }

    const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(query.limit ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
    );
    const sort = query.sort ?? 'created_at';
    const order = (query.order ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const items = await this.transactions.findPage(account.id, {
      sort,
      order,
      limit: limit + 1,
      offset: (page - 1) * limit,
    });
    const total = await this.transactions.countByAccount(account.id);

    return { page, limit, total, hasMore: items.length > limit, items };
  }

  async monthlySummary(accountId: number, userId: number): Promise<MonthlySummary[]> {
    const account = await this.getOwned(accountId, userId);
    return this.transactions.monthlySummary(account.id, 12);
  }
}
