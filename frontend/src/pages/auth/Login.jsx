import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import AuthLayout from '../../components/AuthLayout';
import FormField from '../../components/FormField';
import { HOME_PATH } from '../../utils/constants';
import { errMsg } from '../../utils/helpers';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={HOME_PATH[user.role] || '/'} replace />;

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.login(form);
      const u = login(res.data);
      navigate(HOME_PATH[u.role] || '/', { replace: true });
    } catch (err) {
      setError(err.response?.status === 401 || err.response?.status === 403
        ? 'Invalid email or password.' : errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your CareDesk account to continue.">
      <form onSubmit={submit} noValidate>
        <Alert type="success" message={location.state?.message} />
        <Alert message={error} onClose={() => setError('')} />
        <FormField label="Email" error={errors.email}>
          <input className={`input ${errors.email ? 'invalid' : ''}`} type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input className={`input ${errors.password ? 'invalid' : ''}`} type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
        </FormField>
        <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <p className="center muted auth-switch">New customer? <Link to="/register">Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}
