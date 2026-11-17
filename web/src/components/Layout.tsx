import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app">
      <header className="header">
        <span className="brand">🏦 CodeGarage Bank</span>
        <nav className="nav">
          <NavLink to="/" end>
            Mes comptes
          </NavLink>
          <NavLink to="/transfer">Virement</NavLink>
          <NavLink to="/profile">Profil</NavLink>
        </nav>
        <div className="header-user">
          {user && <span data-testid="current-user">{user.firstName}</span>}
          <button type="button" className="secondary" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
