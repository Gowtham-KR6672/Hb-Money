import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginPage() {
  const [mode, setMode] = useState('user');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (mode === 'admin') {
        const { data } = await api.post('/auth/admin-login', { email, password });
        login(data.token, data.user);
        navigate('/admin', { replace: true });
      } else if (mode === 'register') {
        await api.post('/auth/send-otp', { email, purpose: 'register' });
        navigate('/verify', {
          state: {
            purpose: 'register',
            email,
            name,
            phone,
            password
          }
        });
      } else {
        const { data } = await api.post('/auth/login', { email, password });
        login(data.token, data.user);
        navigate(from, { replace: true });
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          (mode === 'admin'
            ? 'Unable to sign in as admin right now.'
            : mode === 'register'
              ? 'Unable to send registration OTP right now.'
              : 'Unable to sign in right now.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="h-20 w-20 overflow-hidden rounded-2xl">
            <img src="/icon.ico" alt="HB Money" className="h-full w-full scale-150 object-cover" />
          </div>
          <p className="text-lg font-semibold uppercase tracking-[0.28em] text-brand-700">HB Money</p>
        </div>
        <div className="rounded-[36px] bg-brand p-6 text-white shadow-panel">
          <div className="px-1 py-2">
            <h1 className="mt-1 text-3xl font-bold">
            {mode === 'admin' ? 'Admin Login' : mode === 'register' ? 'Create Account' : 'User Login'}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              {mode === 'admin'
                ? 'Use the admin email and password to open the HB Money control panel.'
                : mode === 'register'
                  ? 'Create your account, receive an OTP, and finish setup securely.'
                  : 'Use your email and password to sign in to HB Money.'}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 rounded-full bg-white/20 p-1 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              setMode('user');
              setMessage('');
            }}
            className={`rounded-full px-4 py-3 text-sm font-semibold ${mode === 'user' ? 'bg-white text-brand-700 shadow-soft' : 'text-white/80'}`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setMessage('');
            }}
            className={`rounded-full px-4 py-3 text-sm font-semibold ${mode === 'register' ? 'bg-white text-brand-700 shadow-soft' : 'text-white/80'}`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setMessage('');
            }}
            className={`rounded-full px-4 py-3 text-sm font-semibold ${mode === 'admin' ? 'bg-white text-brand-700 shadow-soft' : 'text-white/80'}`}
          >
            Admin
          </button>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' ? (
              <>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white">Name</span>
                  <input className="field border-white/20 bg-white text-ink placeholder:text-slate-400" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white">Phone</span>
                  <input className="field border-white/20 bg-white text-ink placeholder:text-slate-400" placeholder="+1 234 567 890" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </label>
              </>
            ) : null}
            <label className="space-y-2">
              <span className="text-sm font-medium text-white">Email</span>
              <input type="email" className="field border-white/20 bg-white text-ink placeholder:text-slate-400" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            {mode === 'admin' || mode === 'user' || mode === 'register' ? (
              <label className="space-y-2">
                <span className="text-sm font-medium text-white">Password</span>
                <input
                  type="password"
                  className="field border-white/20 bg-white text-ink placeholder:text-slate-400"
                  placeholder={mode === 'admin' ? 'Enter admin password' : 'Enter your password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
            ) : null}
            {message ? <p className="text-sm text-white">{message}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-brand-700 shadow-soft disabled:opacity-70">
              {loading
                ? mode === 'register'
                  ? 'Sending OTP...'
                  : 'Signing In...'
                : mode === 'admin'
                  ? 'Sign In as Admin'
                  : mode === 'register'
                    ? 'Send Registration OTP'
                    : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
