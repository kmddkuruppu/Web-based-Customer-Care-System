import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MENUS, ROLE_LABELS } from '../utils/constants';
import Icon from './Icon';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = MENUS[user.role] || [];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-logo"><Icon name="headphones" size={22} /></span>
          <div>
            <div className="brand-name">CareDesk</div>
            <div className="brand-sub">Customer Care</div>
          </div>
        </div>

        <div className="nav-label">Menu</div>
        <nav>
          {items.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon name={i.icon} size={19} />
              {i.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="role-chip">{ROLE_LABELS[user.role]}</div>
          <small>Signed in as</small>
          <strong>{user.name}</strong>
        </div>
      </aside>
    </>
  );
}
