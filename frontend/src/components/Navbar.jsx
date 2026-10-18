import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';
import Icon from './Icon';

export default function Navbar({ onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <header className="navbar">
      <button className="icon-btn menu-btn" onClick={onToggle} aria-label="Toggle menu">
        <Icon name="menu" />
      </button>
      <div className="navbar-title">
        <strong>Web-Based Customer Care System</strong>
        <small>{today}</small>
      </div>
      <div className="navbar-user">
        <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
        <div className="user-meta">
          <strong>{user.name}</strong>
          <small>{ROLE_LABELS[user.role]}</small>
        </div>
        <button className="btn btn-outline btn-sm btn-icon" onClick={handleLogout}>
          <Icon name="log-out" size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
