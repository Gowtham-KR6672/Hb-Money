import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || ''
  });
  const [message, setMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({ otp: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await api.get('/profile');
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.profileImage || ''
        });
        setImagePreview(data.profileImage || '');
        updateUser(data);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('email', form.email);
      payload.append('phone', form.phone);
      if (selectedFile) {
        payload.append('profilePhoto', selectedFile);
      }

      const { data } = await api.put('/profile', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      updateUser(data);
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        profileImage: data.profileImage || ''
      });
      setImagePreview(data.profileImage || '');
      setSelectedFile(null);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update profile.');
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function requestPasswordOtp() {
    setMessage('');
    try {
      const { data } = await api.post('/profile/password/request-otp');
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to send password OTP.');
    }
  }

  async function verifyPasswordOtp(event) {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await api.post('/profile/password/verify-otp', passwordForm);
      setMessage(data.message);
      setPasswordForm({ otp: '', password: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update password.');
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading your profile..." inline />;
  }

  return (
    <div className="space-y-5 px-4 pb-28 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Profile</h1>
        <p className="text-sm text-slateSoft">App Version 1.0.0</p>
      </div>
      {message ? <p className={`text-sm ${message.includes('success') ? 'text-income' : 'text-expense'}`}>{message}</p> : null}
      <div className="space-y-4 rounded-[30px] bg-white p-5 shadow-panel">
        <div className="flex items-center gap-4">
          <img src={imagePreview || 'https://placehold.co/200x200/E9F3EE/0F172A?text=HB'} alt={form.name || 'Profile'} className="h-20 w-20 rounded-3xl object-cover" />
          <div>
            <p className="text-lg font-semibold text-ink">{form.name || 'HB Money User'}</p>
            <p className="text-sm text-slateSoft">Upload your profile Photo</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Profile Image</span>
            <input type="file" accept="image/*" className="field file:mr-4 file:rounded-xl file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-white" onChange={handleFileChange} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Name</span>
            <input className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Email</span>
            <input type="email" className="field" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Phone</span>
            <input className="field" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
          <button type="submit" className="w-full rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft">
            Save Profile
          </button>
        </form>
        <button type="button" onClick={requestPasswordOtp} className="w-full rounded-2xl border border-brand px-4 py-3 font-semibold text-brand-700">
          Send Password Change OTP
        </button>
        <div className="space-y-3 rounded-2xl bg-mist p-4">
          <p className="text-sm font-semibold text-ink">Change Password With OTP</p>
          <form onSubmit={verifyPasswordOtp} className="space-y-3">
            <input
              className="field"
              placeholder="Enter OTP"
              value={passwordForm.otp}
              onChange={(event) => setPasswordForm({ ...passwordForm, otp: event.target.value })}
            />
            <input
              type="password"
              className="field"
              placeholder="New password"
              value={passwordForm.password}
              onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
            />
            <button type="submit" className="w-full rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft">
              Verify OTP & Update Password
            </button>
          </form>
        </div>
        <button type="button" onClick={logout} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-ink">
          Log Out
        </button>
      </div>
    </div>
  );
}
