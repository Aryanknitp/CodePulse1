import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi.js';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail, validatePassword, getPasswordStrength } from '../../utils/validators.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);
  const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{ backgroundColor: i <= strength ? colors[strength] : '#1e2030' }} />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: colors[strength] }}>{labels[strength]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Enter a valid email';
    const pwErrs = validatePassword(form.password);
    if (pwErrs.length) errs.password = pwErrs[0];
    if (!form.confirm) errs.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password });
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: form.email } });
    } catch (err) {
      if (err?.status === 409) {
        setServerError('An account with this email already exists.');
      } else {
        setServerError(err?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] items-center justify-center mb-4">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#e8eaf0]">Create your account</h1>
          <p className="text-sm text-[#6b7280] mt-1">Start your personalized DSA journey</p>
        </div>

        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input label="Full Name" type="text" placeholder="John Doe" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={errors.name} required autoComplete="name" />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} error={errors.email} required autoComplete="email" />
            <div className="space-y-1.5">
              <Input label="Password" type="password" placeholder="Create a strong password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} error={errors.password} required autoComplete="new-password" />
              <PasswordStrength password={form.password} />
            </div>
            <Input label="Confirm Password" type="password" placeholder="Repeat your password" value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} error={errors.confirm} required autoComplete="new-password" />

            {serverError && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md px-3 py-2 text-xs text-[#ef4444]" role="alert">{serverError}</div>
            )}

            <Button type="submit" loading={loading} className="w-full">Create Account</Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-[#6366f1] hover:text-[#818cf8]">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
