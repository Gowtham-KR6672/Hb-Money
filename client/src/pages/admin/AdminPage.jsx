import { useEffect, useState } from 'react';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

function CategoryBreakdown({ title, items, tone }) {
  const amountClass = tone === 'income' ? 'text-income' : 'text-red-500';
  const badgeClass = tone === 'income' ? 'bg-emerald-50' : 'bg-red-50';

  return (
    <div className="rounded-2xl bg-mist/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slateSoft">{title}</p>
      {items.length ? (
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={`${title}-${item.category}`} className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{item.category}</p>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeClass} ${amountClass}`}>{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slateSoft">No {title.toLowerCase()} recorded this month.</p>
      )}
    </div>
  );
}

function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    try {
      const [{ data: statsData }, { data: usersData }] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function updateStatus(userId, status) {
    setMessage('');
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update account status.');
    }
  }

  async function resetPassword(userId) {
    setMessage('');
    try {
      await api.post(`/admin/users/${userId}/reset-password`, { password: 'TempPass123!' });
      setMessage('Password reset to TempPass123!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to reset password.');
    }
  }

  async function deleteUser(userId) {
    setMessage('');
    try {
      await api.delete(`/admin/users/${userId}`);
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete user.');
    }
  }

  if (loading) {
    return <LoadingScreen label="Loading admin control center..." inline />;
  }

  return (
    <div className="space-y-5 px-4 pb-28 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Admin Panel</h1>
        <p className="text-sm text-slateSoft">Review users, account status, and platform-wide transaction volume.</p>
      </div>
      {message ? <p className={`text-sm ${message.includes('Unable') ? 'text-expense' : 'text-income'}`}>{message}</p> : null}
      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-card bg-white p-4 shadow-panel">
          <p className="text-xs text-slateSoft">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-ink">{stats?.totalUsers || 0}</p>
        </article>
        <article className="rounded-card bg-white p-4 shadow-panel">
          <p className="text-xs text-slateSoft">Active Users</p>
          <p className="mt-2 text-3xl font-bold text-income">{stats?.activeUsers || 0}</p>
        </article>
        <article className="rounded-card bg-white p-4 shadow-panel">
          <p className="text-xs text-slateSoft">Disabled Users</p>
          <p className="mt-2 text-3xl font-bold text-expense">{stats?.disabledUsers || 0}</p>
        </article>
        <article className="rounded-card bg-white p-4 shadow-panel">
          <p className="text-xs text-slateSoft">Transactions</p>
          <p className="mt-2 text-3xl font-bold text-ink">{stats?.totalTransactions || 0}</p>
        </article>
      </section>
      <section className="space-y-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-card bg-white p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">{user.name}</p>
                <p className="text-sm text-slateSoft">{user.totalTransactions} transactions</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.accountStatus === 'active' ? 'bg-emerald-50 text-income' : 'bg-blue-50 text-expense'}`}>
                {user.accountStatus}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => updateStatus(user.id, user.accountStatus === 'active' ? 'disabled' : 'active')}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-ink"
              >
                {user.accountStatus === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button type="button" onClick={() => resetPassword(user.id)} className="rounded-2xl border border-slate-200 px-3 py-2 text-ink">
                Reset
              </button>
              <button type="button" onClick={() => deleteUser(user.id)} className="rounded-2xl bg-expense px-3 py-2 text-white">
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function UserCardsPanel() {
  const [message, setMessage] = useState('');
  const [generated, setGenerated] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!generated?.expiresAt) {
      setSecondsLeft(0);
      return undefined;
    }

    function updateCountdown() {
      const remaining = Math.max(0, Math.ceil((new Date(generated.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining === 0) {
        setGenerated(null);
      }
    }

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [generated]);

  async function handleGenerateCode() {
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.post('/transactions/share-code/generate');
      setGenerated(data);
      setSharedData(null);
      setCodeInput('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewCode(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.post('/transactions/share-code/view', { code: codeInput });
      setSharedData(data);
      setMessage('Code verified. Shared monthly totals are visible until this page is reloaded.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to view shared monthly data.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 px-4 pb-28 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Cards</h1>
        <p className="text-sm text-slateSoft">Share the security code with your friend to give them access to your current month’s data.</p>
      </div>
      {message ? <p className={`text-sm ${message.includes('verified') ? 'text-income' : 'text-expense'}`}>{message}</p> : null}
      <section className="rounded-[30px] bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-ink">Generate Code</p>
            <p className="text-sm text-slateSoft">Click Generate to create a temporary access code.</p>
          </div>
          <button type="button" onClick={handleGenerateCode} disabled={loading} className="rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft disabled:opacity-70">
            Generate
          </button>
        </div>
        {generated ? (
          <div className="mt-4 rounded-2xl bg-mist p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slateSoft">Active Code</p>
            <p className="mt-2 text-4xl font-extrabold tracking-[0.2em] text-brand-700">{generated.code}</p>
            <p className="mt-2 text-sm text-slateSoft">Valid for {secondsLeft} seconds.</p>
          </div>
        ) : null}
      </section>
      <section className="rounded-[30px] bg-white p-5 shadow-panel">
        <p className="text-lg font-semibold text-ink">Enter Code</p>
        <p className="mt-1 text-sm text-slateSoft">Use someone's access code to view their current month Data.</p>
        <form onSubmit={handleViewCode} className="mt-4 space-y-4">
          <input
            className="field text-center text-lg font-bold tracking-[0.35em]"
            placeholder="000000"
            maxLength={6}
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" disabled={loading || codeInput.length !== 6} className="w-full rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft disabled:opacity-70">
            View Monthly Totals
          </button>
        </form>
      </section>
      {sharedData ? (
        <section className="rounded-[30px] bg-white p-5 shadow-panel">
          <p className="text-lg font-semibold text-ink">{sharedData.owner.name}</p>
          <p className="mt-1 text-sm text-slateSoft">{sharedData.owner.email}</p>
          <p className="mt-2 rounded-2xl bg-mist px-4 py-3 text-sm text-slateSoft">
            This shared view is temporary and will disappear if the page is reloaded.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slateSoft">Current Month Income</p>
              <p className="mt-2 text-2xl font-bold text-income">{formatCurrency(sharedData.currentMonthIncome)}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slateSoft">Current Month Expense</p>
              <p className="mt-2 text-2xl font-bold text-red-500">{formatCurrency(sharedData.currentMonthExpense)}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <CategoryBreakdown title="Income" items={sharedData.incomeByCategory || []} tone="income" />
            <CategoryBreakdown title="Expense" items={sharedData.expenseByCategory || []} tone="expense" />
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminPanel />;
  }

  return <UserCardsPanel />;
}
