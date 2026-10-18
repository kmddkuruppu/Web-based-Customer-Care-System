import { useMemo, useState } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../utils/useFetch';
import { asList, errMsg } from '../../utils/helpers';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import FormField from '../../components/FormField';

const EMPTY = { fullName: '', email: '', contactNumber: '', role: ROLES.AGENT, password: '' };

export default function UserManagement() {
  const { user: me } = useAuth();
  const { data, loading, error, reload } = useFetch(() => userService.list(), []);
  const users = asList(data);

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [toggle, setToggle] = useState(null);
  const [success, setSuccess] = useState('');
  const [pageErr, setPageErr] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, search]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setApiErr(''); setShow(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({ fullName: u.fullName || '', email: u.email || '', contactNumber: u.contactNumber || '', role: u.role, password: '' });
    setErrors({}); setApiErr(''); setShow(true);
  };

  const validate = () => {
    const e = {};
    if (form.fullName.trim().length < 3) e.fullName = 'Full name is required (min 3 characters)';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.contactNumber && !/^\+?\d{9,15}$/.test(form.contactNumber.replace(/[\s-]/g, ''))) e.contactNumber = 'Enter a valid contact number';
    if (!editing && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (editing && form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = async () => {
    if (!validate()) return;
    setBusy(true); setApiErr('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) await userService.update(editing.id, payload);
      else await userService.create(payload);
      setSuccess(editing ? 'User updated.' : 'User created.');
      setShow(false);
      reload();
    } catch (e) {
      setApiErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const confirmToggle = async () => {
    const u = toggle;
    setToggle(null);
    try {
      await userService.setStatus(u.id, !(u.enabled ?? true));
      setSuccess(`User ${(u.enabled ?? true) ? 'disabled' : 'enabled'}.`);
      reload();
    } catch (e) {
      setPageErr(errMsg(e));
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const roleOptions = editing ? Object.values(ROLES) : Object.values(ROLES).filter((r) => r !== ROLES.CUSTOMER);

  return (
    <>
      <div className="page-head">
        <h2 className="page-title">User Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Staff User</button>
      </div>
      <Alert message={error || pageErr} onClose={() => setPageErr('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <div className="card filters">
        <input className="input" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? <Loader /> : (
        <div className="card">
          {filtered.length === 0 ? <div className="empty">No users found.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((u) => {
                    const enabled = u.enabled ?? true;
                    return (
                      <tr key={u.id}>
                        <td><strong>{u.fullName}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.contactNumber || '—'}</td>
                        <td>{ROLE_LABELS[u.role] || u.role}</td>
                        <td><span className={`badge ${enabled ? 'badge-RESOLVED' : 'badge-ESCALATED'}`}>{enabled ? 'Active' : 'Disabled'}</span></td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(u)}>Edit</button>
                            <button
                              className={`btn btn-sm ${enabled ? 'btn-danger' : 'btn-success'}`}
                              disabled={String(u.id) === String(me.userId)}
                              onClick={() => setToggle(u)}
                            >
                              {enabled ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        show={show}
        title={editing ? 'Update User' : 'Create Staff User'}
        onClose={() => setShow(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <Alert message={apiErr} />
        <FormField label="Full Name" error={errors.fullName}>
          <input className={`input ${errors.fullName ? 'invalid' : ''}`} value={form.fullName} onChange={set('fullName')} />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input className={`input ${errors.email ? 'invalid' : ''}`} type="email" value={form.email} onChange={set('email')} />
        </FormField>
        <FormField label="Contact Number" error={errors.contactNumber}>
          <input className={`input ${errors.contactNumber ? 'invalid' : ''}`} value={form.contactNumber} onChange={set('contactNumber')} />
        </FormField>
        <FormField label="Role">
          <select className="input" value={form.role} onChange={set('role')}>
            {roleOptions.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </FormField>
        <FormField label={editing ? 'New Password (leave blank to keep)' : 'Password'} error={errors.password}>
          <input className={`input ${errors.password ? 'invalid' : ''}`} type="password" value={form.password} onChange={set('password')} />
        </FormField>
      </Modal>

      <ConfirmModal
        show={!!toggle}
        message={toggle ? `Are you sure you want to ${(toggle.enabled ?? true) ? 'disable' : 'enable'} ${toggle.fullName}?` : ''}
        variant={toggle && (toggle.enabled ?? true) ? 'danger' : 'success'}
        onConfirm={confirmToggle}
        onCancel={() => setToggle(null)}
      />
    </>
  );
}
