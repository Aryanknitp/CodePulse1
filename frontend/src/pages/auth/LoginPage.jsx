import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail } from '../../utils/validators.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [notVerified, setNotVerified] = useState(false);

  const { login } = useAuth();
  const { toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setNotVerified(false);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      const status = err?.status;
      if (status === 403 && err?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setNotVerified(true);
      } else if (status === 429) {
        setServerError('Too many attempts. Please wait before trying again.');
      } else if (status === 401) {
        setServerError('Invalid email or password.');
      } else {
        setServerError(err?.message || 'Something went wrong. Please try again.');
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
          <h1 className="text-xl font-bold text-[#e8eaf0]">Sign in to CF Insights</h1>
          <p className="text-sm text-[#6b7280] mt-1">Your competitive programming intelligence</p>
        </div>

        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              error={errors.password}
              required
              autoComplete="current-password"
            />

            {serverError && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md px-3 py-2 text-xs text-[#ef4444]" role="alert">
                {serverError}
              </div>
            )}

            {notVerified && (
              <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-md px-3 py-2 space-y-2">
                <p className="text-xs text-[#f59e0b]">Your email is not verified.</p>
                <Link to={ROUTES.VERIFY_EMAIL} className="text-xs text-[#6366f1] hover:underline block">
                  Verify Email →
                </Link>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>

          <div className="mt-4 text-center">
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-[#6b7280] hover:text-[#9ca3c4]">
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-[#6b7280] mt-6">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-[#6366f1] hover:text-[#818cf8]">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
