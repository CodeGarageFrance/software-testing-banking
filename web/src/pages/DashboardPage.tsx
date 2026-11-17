import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountType, api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/Alert';
import { useAccounts } from '../state/AccountsContext';
import { accountTypeLabel, formatIban, formatMoney } from '../utils/format';

export function DashboardPage() {
  const { user } = useAuth();
  const { accounts, loading, error, refresh } = useAccounts();
  const [type, setType] = useState<AccountType>('checking');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeAccounts = accounts.filter((a) => a.status === 'active');
  const total = activeAccounts.reduce((sum, a) => sum + a.balance, 0);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    try {
      const account = await api.createAccount(type, name);
      setSuccess(`Le compte « ${account.name} » a été ouvert.`);
      setName('');
      await refresh();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <div>
      <h1>Bonjour{user ? ` ${user.firstName}` : ''} 👋</h1>
      <Alert type="error" message={error} />

      <section className="card total">
        <span className="muted">Solde total</span>
        <strong data-testid="total-balance">{formatMoney(total)}</strong>
      </section>

      <h2>Mes comptes</h2>
      {loading && accounts.length === 0 && <p className="muted">Chargement…</p>}
      <div className="accounts-grid">
        {accounts.map((account) => (
          <Link
            key={account.id}
            to={`/accounts/${account.id}`}
            className={`card account-card ${account.status === 'closed' ? 'closed' : ''}`}
            data-testid={`account-card-${account.id}`}
          >
            <div className="account-card-head">
              <strong>{account.name}</strong>
              <span className="badge">{account.status === 'closed' ? 'Clôturé' : accountTypeLabel(account.type)}</span>
            </div>
            <span className="iban">{formatIban(account.iban)}</span>
            <span className="balance" data-testid="account-balance">
              {formatMoney(account.balance)}
            </span>
          </Link>
        ))}
      </div>

      <h2>Ouvrir un nouveau compte</h2>
      <form className="card inline-form" onSubmit={handleCreate}>
        <Alert type="error" message={formError} />
        <Alert type="success" message={success} />
        <div className="field">
          <label htmlFor="account-type">Type</label>
          <select id="account-type" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            <option value="checking">Compte courant</option>
            <option value="savings">Livret d’épargne</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="account-name">Nom du compte</label>
          <input
            id="account-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex : Vacances"
            required
          />
        </div>
        <button type="submit">Ouvrir le compte</button>
      </form>
    </div>
  );
}
