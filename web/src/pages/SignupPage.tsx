import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/Alert';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', confirm: '' };

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function checkConfirm() {
    setConfirmError(form.confirm !== form.password ? 'Les mots de passe ne correspondent pas' : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Ouvrir un compte</h1>
        <Alert type="error" message={error} />
        <label htmlFor="firstName">Prénom</label>
        <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
        <label htmlFor="lastName">Nom</label>
        <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <small className="muted">8 caractères minimum, dont au moins une lettre et un chiffre.</small>
        <label htmlFor="confirm">Confirmation du mot de passe</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handleChange}
          onBlur={checkConfirm}
          required
        />
        {confirmError && <small className="field-error">{confirmError}</small>}
        <button type="submit" disabled={loading || confirmError !== null}>
          Créer mon compte
        </button>
        <p className="muted">
          Déjà client ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
