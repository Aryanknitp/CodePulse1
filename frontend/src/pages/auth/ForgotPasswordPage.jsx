import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/authApi.js';
import { ROUTES } from '../../constants/routes.js';
import { validateEmail } from '../../utils/validators.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) { setError('Enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#e8eaf0]">Reset your password</h1>
          <p className="text-sm text-[#6b7280] mt-1">We&apos;ll send a reset link to your email</p>
        </div>
        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-[#e8eaf0]">Reset link sent to <span className="text-[#818cf8]">{email}</span></p>
              <p className="text-xs text-[#6b7280]">Check your inbox and follow the link to reset your password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} error={error} required autoComplete="email" />
              <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
            </form>
          )}
        </div>
        <p className="text-center text-sm text-[#6b7280] mt-6">
          <Link to={ROUTES.LOGIN} className="text-[#6366f1] hover:text-[#818cf8]">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
