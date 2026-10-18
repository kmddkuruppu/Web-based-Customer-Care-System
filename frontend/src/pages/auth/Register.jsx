import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Alert from '../../components/Alert';
import AuthLayout from '../../components/AuthLayout';
import FormField from '../../components/FormField';
import { errMsg } from '../../utils/helpers';

const INITIAL = { fullName: '', email: '', contactNumber: '', address: '', password: '', confirmPassword: '' };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.fullName.trim().length < 3) e.fullName = 'Full name must be at least 3 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!/^\+?\d{9,15}$/.test(form.contactNumber.replace(/[\s-]/g, ''))) e.contactNumber = 'Enter a valid contact number (9–15 digits)';
    if (form.address.trim().length < 5) e.address = 'Address is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await authService.register(payload);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text') => (
    <FormField label={label} error={errors[key]}>
      <input className={`input ${errors[key] ? 'invalid' : ''}`} type={type} value={form[key]} onChange={set(key)} />
    </FormField>
  );

  return (
    <AuthLayout wide title="Create your account" subtitle="Register to submit and track your complaints.">
      <form onSubmit={submit} noValidate>
        <Alert message={error} onClose={() => setError('')} />
        <div className="form-row">
          {field('fullName', 'Full Name')}
          {field('contactNumber', 'Contact Number')}
        </div>
        {field('email', 'Email', 'email')}
        <FormField label="Address" error={errors.address}>
          <textarea className={`input ${errors.address ? 'invalid' : ''}`} rows={2} value={form.address} onChange={set('address')} />
        </FormField>
        <div className="form-row">
          {field('password', 'Password', 'password')}
          {field('confirmPassword', 'Confirm Password', 'password')}
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="center muted auth-switch">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </AuthLayout>
  );
}
