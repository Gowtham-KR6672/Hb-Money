import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email;
  const purpose = location.state?.purpose || 'register';
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.post('/auth/register', {
        name: location.state?.name,
        phone: location.state?.phone,
        email,
        password: location.state?.password,
        otp
      });
      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md rounded-[36px] bg-white p-6 shadow-panel">
        <h1 className="text-3xl font-bold text-ink">Verify OTP</h1>
        <p className="mt-2 text-sm text-slateSoft">
          Enter the code sent to {email} to complete your {purpose === 'register' ? 'account creation' : 'verification'}.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">OTP</span>
            <input type="text" className="field tracking-[0.5em]" maxLength={6} placeholder="000000" value={otp} onChange={(event) => setOtp(event.target.value)} required />
          </label>
          {message ? <p className="text-sm text-expense">{message}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft disabled:opacity-70">
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
