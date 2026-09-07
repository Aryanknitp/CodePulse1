import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi.js';
import { ROUTES } from '../../constants/routes.js';
import { validatePassword } from '../../utils/validators.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const pwErrs = validatePassword(form.password);
    if (pwErrs.length) errs.password = pwErrs[0];
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password });
      setDone(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      if (err?.status === 410) setServerError('This reset link has expired. Please request a new one.');
      else setServerError(err?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-[#ef4444]">Invalid or missing reset token.</p>
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-[#6366f1] text-sm hover:underline">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#e8eaf0]">Set new password</h1>
        </div>
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          {done ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-[#e8eaf0]">Password reset successfully.</p>
              <p className="text-xs text-[#6b7280]">Redirecting to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="New Password" type="password" placeholder="New password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} error={errors.password} required />
              <Input label="Confirm Password" type="password" placeholder="Repeat new password" value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} error={errors.confirm} required />
              {serverError && <p className="text-xs text-[#ef4444]" role="alert">{serverError}</p>}
              <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
