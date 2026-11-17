import { describe, expect, it, vi } from 'vitest';
import { UnitOfWork } from '../../src/db/unitOfWork';
import { Account } from '../../src/domain/models';
import { AccountRepository, TransactionRepository } from '../../src/repositories';
import { AccountService } from '../../src/services/accountService';

// Exemple de test unitaire d'un service : les repositories sont remplacés par des doublures,
// aucune base de données n'est nécessaire.
function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    userId: 42,
    iban: 'FR7612345000011428616124159',
    type: 'checking',
    name: 'Compte courant',
    balance: 100,
    overdraftLimit: 200,
    status: 'active',
    createdAt: new Date(),
    closedAt: null,
    ...overrides,
  };
}

describe('AccountService.get', () => {
  it("renvoie 404 si le compte n'appartient pas à l'utilisateur", async () => {
    const accounts = { findOwned: vi.fn().mockResolvedValue(null) } as unknown as AccountRepository;
    const service = new AccountService(accounts, {} as TransactionRepository, {} as UnitOfWork);

    await expect(service.get(1, 42)).rejects.toMatchObject({ status: 404 });
    expect(accounts.findOwned).toHaveBeenCalledWith(1, 42);
  });

  it("n'ajoute pas de projection d'intérêts pour un compte courant", async () => {
    const accounts = { findOwned: vi.fn().mockResolvedValue(makeAccount()) } as unknown as AccountRepository;
    const service = new AccountService(accounts, {} as TransactionRepository, {} as UnitOfWork);

    const account = await service.get(1, 42);

    expect(account.projectedInterest12Months).toBeNull();
  });
});
