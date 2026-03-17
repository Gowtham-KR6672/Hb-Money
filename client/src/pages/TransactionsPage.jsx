import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import TransactionList from '../components/TransactionList';
import api from '../services/api';
import { buildTransactionViewModel, formatCurrency } from '../utils/formatters';

const incomeCategories = ['Freelance', 'Salary', 'Business', 'Interest'];
const expenseCategories = ['Food', 'Transport', 'Rent', 'Bills', 'Shopping', 'Other'];

export default function TransactionsPage() {
  const [form, setForm] = useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    notes: '',
    date: new Date().toISOString().slice(0, 10)
  });
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statementRange, setStatementRange] = useState({
    from: '',
    to: ''
  });
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementSummary, setStatementSummary] = useState(null);
  const [statementItems, setStatementItems] = useState([]);
  const [showStatementResults, setShowStatementResults] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [downloadPassword, setDownloadPassword] = useState('');

  const categoryOptions = form.type === 'income' ? incomeCategories : expenseCategories;

  async function loadTransactions(nextPage = 1) {
    try {
      const { data } = await api.get(`/transactions?page=${nextPage}&limit=10`);
      setItems(data.items.map(buildTransactionViewModel));
      setPagination(data.pagination);
      setPage(nextPage);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load transactions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/transactions', {
        ...form,
        amount: Number(form.amount)
      });
      setForm((current) => ({ ...current, amount: '', notes: '' }));
      await loadTransactions(1);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save transaction.');
    }
  }

  async function handleViewStatement() {
    setStatementLoading(true);
    setMessage('');
    try {
      const { data } = await api.get(`/transactions/statement?from=${statementRange.from}&to=${statementRange.to}`);
      setStatementSummary(data.summary);
      setStatementItems(data.items.map(buildTransactionViewModel));
      setShowStatementResults(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load transactions for that date range.');
    } finally {
      setStatementLoading(false);
    }
  }

  async function downloadStatement(password) {
    setStatementLoading(true);
    setMessage('');
    try {
      const response = await api.post(
        '/transactions/statement/download',
        {
          from: statementRange.from,
          to: statementRange.to,
          password
        },
        {
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hb-money-statement-${statementRange.from}-to-${statementRange.to}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          setMessage(parsed.message || 'Unable to download statement.');
        } catch {
          setMessage('Unable to download statement.');
        }
      } else {
        setMessage(error.response?.data?.message || 'Unable to download statement.');
      }
    } finally {
      setStatementLoading(false);
    }
  }

  async function handleDownloadStatement() {
    if (!canUseStatementActions) {
      return;
    }
    setDownloadPassword('');
    setShowPasswordModal(true);
  }

  async function handlePasswordConfirm(event) {
    event.preventDefault();
    if (!downloadPassword) {
      return;
    }

    const password = downloadPassword;
    setShowPasswordModal(false);
    setDownloadPassword('');
    await downloadStatement(password);
  }

  const canUseStatementActions = Boolean(statementRange.from && statementRange.to);
  const displayedTransactions = showStatementResults ? statementItems : items;
  const rangeTitle = showStatementResults ? `${statementRange.from} to ${statementRange.to}` : null;

  if (loading) {
    return <LoadingScreen label="Fetching transactions..." inline />;
  }

  return (
    <>
      <div className="space-y-5 px-4 pb-28 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Transactions</h1>
        <p className="text-sm text-slateSoft">Add income and expenses with categories, notes, and dates.</p>
      </div>
      {message ? <p className="text-sm text-expense">{message}</p> : null}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-[30px] bg-white p-5 shadow-panel">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Amount</span>
            <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} type="number" className="field" placeholder="0.00" required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Type</span>
            <select
              value={form.type}
              onChange={(event) =>
                setForm({
                  ...form,
                  type: event.target.value,
                  category: event.target.value === 'income' ? incomeCategories[0] : expenseCategories[0]
                })
              }
              className="field"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Category</span>
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="field">
            {categoryOptions.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Notes</span>
          <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="field" placeholder="Optional note" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Date</span>
          <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="field" />
        </label>
        <button type="submit" className="w-full rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft">
          Save Transaction
        </button>
      </form>
      <section className="space-y-4 rounded-[30px] bg-white p-5 shadow-panel">
        <div>
          <h2 className="text-lg font-semibold text-ink">Statement by Date</h2>
          <p className="mt-1 text-sm text-slateSoft">Select a from and to date to view transactions here or download a protected PDF statement.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">From</span>
            <input
              value={statementRange.from}
              onChange={(event) => setStatementRange((current) => ({ ...current, from: event.target.value }))}
              type="date"
              className="field"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">To</span>
            <input
              value={statementRange.to}
              onChange={(event) => setStatementRange((current) => ({ ...current, to: event.target.value }))}
              type="date"
              className="field"
            />
          </label>
        </div>
        {canUseStatementActions ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleViewStatement}
              disabled={statementLoading}
              className="rounded-2xl border border-brand px-4 py-3 font-semibold text-brand disabled:opacity-60"
            >
              View
            </button>
            <button
              type="button"
              onClick={handleDownloadStatement}
              disabled={statementLoading}
              className="rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft disabled:opacity-60"
            >
              Download
            </button>
          </div>
        ) : null}
      </section>
      {showStatementResults && statementSummary ? (
        <section className="space-y-4 rounded-[30px] bg-white p-5 shadow-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Viewed Transactions</h2>
              <p className="mt-1 text-sm text-slateSoft">{rangeTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowStatementResults(false);
                setStatementSummary(null);
                setStatementItems([]);
              }}
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slateSoft"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slateSoft">Income</p>
              <p className="mt-2 text-lg font-bold text-income">{formatCurrency(statementSummary.income)}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slateSoft">Expense</p>
              <p className="mt-2 text-lg font-bold text-expense">{formatCurrency(statementSummary.expense)}</p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-slateSoft">Balance</p>
              <p className={`mt-2 text-lg font-bold ${statementSummary.balance >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(statementSummary.balance)}</p>
            </div>
          </div>
        </section>
      ) : null}
      <TransactionList transactions={displayedTransactions} emptyMessage={showStatementResults ? 'No transactions found in the selected date range.' : 'No transactions found yet. Select a date range above to view or download a statement.'} />
      {!showStatementResults && pagination ? (
        <div className="flex items-center justify-between px-4 pb-28 text-sm font-semibold text-slateSoft">
          <button type="button" disabled={page <= 1} onClick={() => loadTransactions(page - 1)} className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40">
            Previous
          </button>
          <span>
            Page {pagination.page} of {Math.max(1, pagination.pages)}
          </span>
          <button
            type="button"
            disabled={page >= pagination.pages}
            onClick={() => loadTransactions(page + 1)}
            className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
      </div>
      {showPasswordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-panel">
            <div className="rounded-[24px] bg-mist p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slateSoft">Protected Download</p>
              <h2 className="mt-2 text-2xl font-bold text-ink">Enter Login Password</h2>
              <p className="mt-2 text-sm text-ink">Enter your login password to download the PDF</p>
            </div>
            <form onSubmit={handlePasswordConfirm} className="mt-5 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink">Password</span>
                <input
                  autoFocus
                  type="password"
                  value={downloadPassword}
                  onChange={(event) => setDownloadPassword(event.target.value)}
                  className="field"
                  placeholder="Enter your login password"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setDownloadPassword('');
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slateSoft"
                >
                  Cancel
                </button>
                <button type="submit" disabled={!downloadPassword || statementLoading} className="rounded-2xl bg-brand px-4 py-3 font-semibold text-white shadow-soft disabled:opacity-60">
                  Download PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
