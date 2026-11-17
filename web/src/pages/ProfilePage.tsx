import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/Alert';
import { formatDate, formatMoney } from '../utils/format';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm('Supprimer définitivement votre profil ? Cette action est irréversible.')) return;
    setError(null);
    try {
      await api.deleteMe();
      logout();
      navigate('/login');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!user) return <p className="muted">Chargement…</p>;

  return (
    <div>
      <h1>Mon profil</h1>
      <Alert type="error" message={error} />
      <section className="card">
        <dl className="details">
          <dt>Prénom</dt>
          <dd>{user.firstName}</dd>
          <dt>Nom</dt>
          <dd>{user.lastName}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Plafond de virement (24 h glissantes)</dt>
          <dd>{formatMoney(user.dailyTransferLimit)}</dd>
          <dt>Client depuis le</dt>
          <dd>{formatDate(user.createdAt)}</dd>
        </dl>
      </section>
      <section className="card danger-zone">
        <h2>Zone de danger</h2>
        <p className="muted">Tous vos comptes doivent être clôturés avant de pouvoir supprimer votre profil.</p>
        <button type="button" className="danger" onClick={handleDelete}>
          Supprimer mon profil
        </button>
      </section>
    </div>
  );
}
