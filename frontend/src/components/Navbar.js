import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        {t('common.app_name')}
      </Link>
      
      {user && (
        <>
          <ul className="navbar-nav">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                {t('nav.dashboard')}
              </Link>
            </li>
            <li>
              <Link to="/accounts" className={`nav-link ${location.pathname === '/accounts' ? 'active' : ''}`}>
                {t('nav.accounts')}
              </Link>
            </li>
            <li>
              <Link to="/transactions" className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}>
                {t('nav.transactions')}
              </Link>
            </li>
            <li>
              <Link to="/transfer" className={`nav-link ${location.pathname === '/transfer' ? 'active' : ''}`}>
                {t('nav.transfer')}
              </Link>
            </li>
            <li>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                {t('nav.profile')}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('nav.logout')}
              </button>
            </li>
          </ul>
          <div className="navbar-right">
            <LanguageSelector />
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;