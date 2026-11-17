import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Account, api, MonthlySummary, TransactionPage } from '../api';
import { Alert } from '../components/Alert';
import { useAccounts } from '../state/AccountsContext';
import {
  accountTypeLabel,
  formatDate,
  formatIban,
  formatMoney,
  isCredit,
  MONTHS_FR,
  parseAmount,
  transactionTypeLabel,
} from '../utils/format';
import { highlight } from '../utils/highlight';

type SortOption = 'created_at:desc' | 'created_at:asc' | 'amount:desc' | 'amount:asc';

export function AccountPage() {
  const { id } = useParams();
  const accountId = Number(id);
  const navigate = useNavigate();
  const { refresh } = useAccounts();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionPage | null>(null);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('created_at:desc');
  const [search, setSearch] = useState('');
  const [operationAmount, setOperationAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      const [acc, sum] = await Promise.all([api.getAccount(accountId), api.getSummary(accountId)]);
      setAccount(acc);
      setSummary(sum);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [accountId]);

  const loadTransactions = useCallback(async () => {
    const [field, order] = sort.split(':') as [string, 'asc' | 'desc'];
    try {
      setTransactions(await api.listTransactions(accountId, { page, sort: field, order }));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [accountId, page, sort]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handleOperation(e: FormEvent, kind: 'deposit' | 'withdraw') {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const amount = parseAmount(operationAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError('Montant invalide');
      return;
    }
    try {
      if (kind === 'deposit') {
        await api.deposit(accountId, amount);
        setSuccess(`Dépôt de ${formatMoney(amount)} effectué.`);
      } else {
        await api.withdraw(accountId, amount);
        setSuccess(`Retrait de ${formatMoney(amount)} effectué.`);
      }
      setOperationAmount('');
      await Promise.all([loadAccount(), loadTransactions(), refresh()]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleClose() {
    if (!window.confirm('Voulez-vous vraiment clôturer ce compte ?')) return;
    setError(null);
    try {
      await api.closeAccount(accountId);
      await refresh();
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!account) {
    return (
      <div>
        <Alert type="error" message={error} />
        {!error && <p className="muted">Chargement…</p>}
      </div>
    );
  }

  const isActive = account.status === 'active';
  const items = (transactions?.items ?? []).filter((t) =>
    search.trim() ? (t.label ?? '').toLowerCase().includes(search.trim().toLowerCase()) : true,
  );

  return (
    <div>
      <h1>{account.name}</h1>
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      <section className="card account-summary">
        <div>
          <span className="muted">{accountTypeLabel(account.type)}</span>
          <span className="iban" data-testid="account-iban">
            {formatIban(account.iban)}
          </span>
          {!isActive && <span className="badge">Clôturé</span>}
        </div>
        <div className="account-summary-balance">
          <span className="muted">Solde</span>
          <strong data-testid="account-balance">{formatMoney(account.balance)}</strong>
          {account.overdraftLimit > 0 && (
            <small className="muted">Découvert autorisé : {formatMoney(account.overdraftLimit)}</small>
          )}
          {account.projectedInterest12Months != null && (
            <small className="muted" data-testid="projected-interest">
              Intérêts estimés sur 12 mois : {formatMoney(account.projectedInterest12Months)}
            </small>
          )}
        </div>
      </section>

      {isActive && (
        <section className="card">
          <h2>Dépôt / retrait</h2>
          <form className="inline-form" onSubmit={(e) => handleOperation(e, 'deposit')}>
            <div className="field">
              <label htmlFor="operation-amount">Montant (€)</label>
              <input
                id="operation-amount"
                inputMode="decimal"
                placeholder="0,00"
                value={operationAmount}
                onChange={(e) => setOperationAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit">Déposer</button>
            <button type="button" className="secondary" onClick={(e) => handleOperation(e, 'withdraw')}>
              Retirer
            </button>
          </form>
        </section>
      )}

      <section className="card">
        <div className="section-head">
          <h2>Opérations</h2>
          <div className="filters">
            <input
              aria-label="Rechercher dans les libellés"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Trier les opérations"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption);
                setPage(1);
              }}
            >
              <option value="created_at:desc">Plus récentes</option>
              <option value="created_at:asc">Plus anciennes</option>
              <option value="amount:desc">Montant décroissant</option>
              <option value="amount:asc">Montant croissant</option>
            </select>
          </div>
        </div>
        <table className="table" data-testid="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Libellé</th>
              <th>Contrepartie</th>
              <th className="right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {items.map((tx) => (
              <tr key={tx.id}>
                <td>{formatDate(tx.createdAt)}</td>
                <td>{transactionTypeLabel(tx.type)}</td>
                <td dangerouslySetInnerHTML={{ __html: highlight(tx.label ?? '', search) }} />
                <td className="iban">{tx.counterpartyIban ? formatIban(tx.counterpartyIban) : '—'}</td>
                <td className={`right ${isCredit(tx.type) ? 'credit' : 'debit'}`}>
                  {isCredit(tx.type) ? '+' : '−'} {formatMoney(tx.amount)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="muted center">
                  Aucune opération
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination">
          <button type="button" className="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
            ← Précédent
          </button>
          <span data-testid="current-page">Page {page}</span>
          <button
            type="button"
            className="secondary"
            disabled={!transactions?.hasMore}
            onClick={() => setPage(page + 1)}
          >
            Suivant →
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Synthèse mensuelle</h2>
        <table className="table" data-testid="summary-table">
          <thead>
            <tr>
              <th>Mois</th>
              <th className="right">Entrées</th>
              <th className="right">Sorties</th>
              <th className="right">Opérations</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={`${row.year}-${row.month}`}>
                <td>
                  {MONTHS_FR[row.month - 1]} {row.year}
                </td>
                <td className="right credit">{formatMoney(row.totalIn)}</td>
                <td className="right debit">{formatMoney(row.totalOut)}</td>
                <td className="right">{row.operations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isActive && (
        <button type="button" className="danger" onClick={handleClose}>
          Clôturer ce compte
        </button>
      )}
    </div>
  );
}
