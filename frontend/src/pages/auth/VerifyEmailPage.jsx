import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../services/authApi.js';
import { ROUTES } from '../../constants/routes.js';
import Button from '../../components/common/Button.jsx';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[i] = value;
    setOtp(next);
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp: code });
      navigate(ROUTES.CONNECT_CODEFORCES);
    } catch (err) {
      if (err?.status === 410) setError('This code has expired. Please request a new one.');
      else if (err?.status === 429) setError('Too many attempts. Please wait before trying again.');
      else setError(err?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      await authApi.resendOTP({ email });
      setCountdown(60);
    } catch (err) {
      setError(err?.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#e8eaf0]">Verify your email</h1>
          {email && <p className="text-sm text-[#6b7280] mt-1">Code sent to <span className="text-[#9ca3c4]">{email}</span></p>}
        </div>

        <div className="bg-[#111218] border border-[#1e2030] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#e8eaf0] mb-3 text-center">Enter the 6-digit code</label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-10 h-12 text-center text-lg font-mono font-semibold bg-[#0d0e14] border border-[#1e2030] rounded-lg text-[#e8eaf0] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-colors"
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#6b7280] text-center mt-3">Code expires in 10 minutes · Limited attempts</p>
            </div>

            {error && <p className="text-xs text-[#ef4444] text-center" role="alert">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">Verify Email</Button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-[#6b7280]">Resend in {countdown}s</p>
              ) : (
                <button type="button" onClick={handleResend} disabled={resending} className="text-xs text-[#6366f1] hover:text-[#818cf8] disabled:opacity-50">
                  {resending ? 'Sending…' : 'Resend code'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
