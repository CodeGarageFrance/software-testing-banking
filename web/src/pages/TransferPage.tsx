import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api';
import { Alert } from '../components/Alert';
import { useAccounts } from '../state/AccountsContext';
import { formatIban, formatMoney, parseAmount } from '../utils/format';

export function TransferPage() {
  const { accounts } = useAccounts();
  const activeAccounts = accounts.filter((a) => a.status === 'active');

  const [fromAccountId, setFromAccountId] = useState<number | ''>('');
  const [toIban, setToIban] = useState('');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (fromAccountId === '' && activeAccounts.length > 0) {
      setFromAccountId(activeAccounts[0].id);
    }
  }, [activeAccounts, fromAccountId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const value = parseAmount(amount);
    if (Number.isNaN(value) || value <= 0) {
      setError('Montant invalide');
      return;
    }
    if (fromAccountId === '') {
      setError('Choisissez un compte à débiter');
      return;
    }

    try {
      const result = await api.transfer({
        fromAccountId,
        toIban,
        amount: value,
        label: label || undefined,
      });
      setSuccess(
        `Virement de ${formatMoney(result.amount)} envoyé à ${formatIban(result.toIban)}` +
          (result.fee > 0 ? ` (frais : ${formatMoney(result.fee)}).` : '.'),
      );
      setLabel('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1>Effectuer un virement</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <label htmlFor="from-account">Compte à débiter</label>
        <select
          id="from-account"
          value={fromAccountId}
          onChange={(e) => setFromAccountId(Number(e.target.value))}
          required
        >
          {activeAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {formatMoney(a.balance)}
            </option>
          ))}
        </select>

        <label htmlFor="to-iban">IBAN du bénéficiaire</label>
        <input
          id="to-iban"
          list="own-ibans"
          value={toIban}
          onChange={(e) => setToIban(e.target.value)}
          placeholder="FR76 …"
          required
        />
        <datalist id="own-ibans">
          {activeAccounts.map((a) => (
            <option key={a.id} value={a.iban}>
              {a.name}
            </option>
          ))}
        </datalist>

        <label htmlFor="amount">Montant (€)</label>
        <input
          id="amount"
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label htmlFor="label">Libellé (optionnel)</label>
        <input id="label" maxLength={140} value={label} onChange={(e) => setLabel(e.target.value)} />

        <small className="muted">
          Virements entre vos comptes : gratuits. Vers un autre client : 0,5 % de frais (max 5 €).
        </small>

        <button type="submit">Envoyer le virement</button>
      </form>
    </div>
  );
}
