import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import ExpenseChart from '../components/ExpenseChart';
import LoadingScreen from '../components/LoadingScreen';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { formatCurrency, getWeekLabel } from '../utils/formatters';

const pieColors = ['#0ACF83', '#1D4ED8', '#6EE7B7', '#93C5FD', '#86EFAC', '#60A5FA'];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthLabel(monthKey) {
  if (!monthKey) {
    return 'Current Month';
  }
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function buildMonthTimeline(count = 12) {
  const months = [];
  const now = new Date();

  for (let index = 0; index < count; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push(getMonthKey(date));
  }

  return months;
}

function formatCalendarAmount(amount) {
  return `${Math.round(amount || 0)}`;
}

function formatCalendarDate(monthKey, day) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function buildCalendarDays(monthKey, transactions) {
  if (!monthKey) {
    return [];
  }

  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const leadingEmptyDays = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const totalsByDay = transactions.reduce((map, item) => {
    const day = item.parsedDate.getDate();
    if (!map[day]) {
      map[day] = { income: 0, expense: 0 };
    }
    map[day][item.type] += item.amount;
    return map;
  }, {});

  const cells = Array.from({ length: leadingEmptyDays }, (_, index) => ({
    key: `empty-${index}`,
    empty: true
  }));

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({
      key: `day-${day}`,
      empty: false,
      day,
      income: totalsByDay[day]?.income || 0,
      expense: totalsByDay[day]?.expense || 0
    });
  }

  return cells;
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [{ data: transactionData }, { data: summaryData }] = await Promise.all([
          api.get('/transactions?page=1&limit=100'),
          api.get('/transactions/summary')
        ]);

        const items = (transactionData.items || []).map((item) => ({
          ...item,
          parsedDate: new Date(item.date)
        }));

        setTransactions(items);
        setSummary(summaryData);

        const latestMonth = items.length
          ? getMonthKey(
              items.reduce((latest, item) => (item.parsedDate > latest ? item.parsedDate : latest), items[0].parsedDate)
            )
          : getMonthKey(new Date());

        setSelectedMonth(latestMonth);
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const currentMonthKey = getMonthKey(new Date());

  const monthOptions = useMemo(() => {
    const timelineMonths = buildMonthTimeline(12);
    const transactionMonths = [...new Set(transactions.map((item) => getMonthKey(item.parsedDate)))];
    const mergedMonths = [...new Set([...timelineMonths, ...transactionMonths])];
    mergedMonths.sort((left, right) => right.localeCompare(left));
    return mergedMonths.length ? mergedMonths : [currentMonthKey];
  }, [transactions, currentMonthKey]);

  useEffect(() => {
    if (!monthOptions.includes(selectedMonth)) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  const selectedTransactions = useMemo(() => {
    if (!selectedMonth) {
      return [];
    }

    return transactions.filter((item) => getMonthKey(item.parsedDate) === selectedMonth);
  }, [selectedMonth, transactions]);

  const currentMonthTransactions = useMemo(
    () => transactions.filter((item) => getMonthKey(item.parsedDate) === currentMonthKey),
    [transactions, currentMonthKey]
  );

  const selectedMonthDays = useMemo(() => {
    if (!selectedMonth) {
      return 30;
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  const selectedMonthIncome = useMemo(
    () => selectedTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
    [selectedTransactions]
  );

  const selectedMonthExpense = useMemo(
    () => selectedTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
    [selectedTransactions]
  );

  const selectedMonthRemainingBalance = useMemo(
    () => selectedMonthIncome - selectedMonthExpense,
    [selectedMonthIncome, selectedMonthExpense]
  );

  const averageDailyIncome = useMemo(() => {
    if (!selectedMonthDays) {
      return 0;
    }

    const totalIncome = selectedTransactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    return totalIncome / selectedMonthDays;
  }, [selectedTransactions, selectedMonthDays]);

  const averageDailyExpense = useMemo(() => {
    if (!selectedMonthDays) {
      return 0;
    }

    const totalExpense = selectedTransactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    return totalExpense / selectedMonthDays;
  }, [selectedTransactions, selectedMonthDays]);

  const currentMonthExpense = useMemo(
    () => currentMonthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
    [currentMonthTransactions]
  );

  const weeklyData = useMemo(() => {
    const groupedWeeks = [0, 0, 0, 0];
    selectedTransactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => {
        const day = item.parsedDate.getDate();
        const weekIndex = Math.min(3, Math.floor((day - 1) / 7));
        groupedWeeks[weekIndex] += item.amount;
      });

    return groupedWeeks.map((amount, index) => ({ name: getWeekLabel(index), amount }));
  }, [selectedTransactions]);

  const categoryData = useMemo(() => {
    const totals = selectedTransactions.reduce((map, item) => {
      if (item.type === 'expense') {
        map[item.category] = (map[item.category] || 0) + item.amount;
      }
      return map;
    }, {});

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [selectedTransactions]);

  const trendData = useMemo(() => {
    const weeklyTotals = [0, 0, 0, 0];
    const weeklyIncome = [0, 0, 0, 0];

    selectedTransactions.forEach((item) => {
      const day = item.parsedDate.getDate();
      const weekIndex = Math.min(3, Math.floor((day - 1) / 7));

      if (item.type === 'income') {
        weeklyIncome[weekIndex] += item.amount;
      } else {
        weeklyTotals[weekIndex] += item.amount;
      }
    });

    return weeklyIncome.map((income, index) => ({
      week: getWeekLabel(index),
      income,
      expense: weeklyTotals[index]
    }));
  }, [selectedTransactions]);

  const calendarDays = useMemo(() => buildCalendarDays(selectedMonth, selectedTransactions), [selectedMonth, selectedTransactions]);
  const selectedDayTransactions = useMemo(() => {
    if (!selectedDay) {
      return [];
    }

    return selectedTransactions.filter((item) => item.parsedDate.getDate() === selectedDay.day);
  }, [selectedDay, selectedTransactions]);

  const selectedMonthIndex = Math.max(0, monthOptions.findIndex((month) => month === selectedMonth));

  function goToPreviousMonth() {
    if (selectedMonthIndex < monthOptions.length - 1) {
      setSelectedMonth(monthOptions[selectedMonthIndex + 1]);
    }
  }

  function goToNextMonth() {
    if (selectedMonthIndex > 0) {
      setSelectedMonth(monthOptions[selectedMonthIndex - 1]);
    }
  }

  function openDayPopup(cell) {
    setSelectedDay(cell);
  }

  function closeDayPopup() {
    setSelectedDay(null);
  }

  if (loading) {
    return <LoadingScreen label="Preparing analytics..." inline />;
  }

  return (
    <div className="space-y-5 px-4 pb-28 pt-6">
      <div className="space-y-3">
        <div>
          <p className="text-2xl font-bold text-ink">Quickly Analysis</p>
          <p className="text-sm text-slateSoft">Daily spending, income trends, and category insights.</p>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slateSoft">Month</span>
          <div className="flex items-center justify-between rounded-2xl border border-brand/20 bg-white px-3 py-3 shadow-soft">
            <button
              type="button"
              onClick={goToPreviousMonth}
              disabled={monthOptions.length <= 1 || selectedMonthIndex >= monthOptions.length - 1}
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-mist disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <p className="text-base font-semibold text-ink">{getMonthLabel(selectedMonth)}</p>
            <button
              type="button"
              onClick={goToNextMonth}
              disabled={monthOptions.length <= 1 || selectedMonthIndex <= 0}
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-mist disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <section className="rounded-[30px] bg-white p-4 shadow-panel">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slateSoft">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {calendarDays.map((cell) =>
              cell.empty ? (
                <div key={cell.key} className="min-h-[72px] rounded-2xl bg-transparent" />
              ) : (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => openDayPopup(cell)}
                  className="min-h-[72px] overflow-hidden rounded-2xl bg-mist/70 p-2 text-left transition hover:bg-brand/10"
                >
                  <p className="text-sm font-bold text-ink">{cell.day}</p>
                  <div className="mt-2 space-y-1 overflow-hidden">
                    <p className="break-words text-[9px] font-semibold leading-tight text-income">{cell.income ? formatCalendarAmount(cell.income) : ''}</p>
                    <p className="break-words text-[9px] font-semibold leading-tight text-red-500">{cell.expense ? formatCalendarAmount(cell.expense) : ''}</p>
                  </div>
                </button>
              )
            )}
          </div>
        </section>
        <section className="rounded-[30px] bg-white p-5 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slateSoft">
            Remaining Balance for {getMonthLabel(selectedMonth)}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className={`mt-1 text-3xl font-bold ${selectedMonthRemainingBalance >= 0 ? 'text-income' : 'text-red-500'}`}>
                {formatCurrency(selectedMonthRemainingBalance)}
              </p>
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedMonthRemainingBalance >= 0 ? 'bg-emerald-50 text-income' : 'bg-red-50 text-red-500'}`}>
              {selectedMonthRemainingBalance >= 0 ? 'In Balance' : 'Overspent'}
            </div>
          </div>
        </section>
      </div>
      {error ? <p className="text-sm text-expense">{error}</p> : null}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Average Daily Income" value={formatCurrency(averageDailyIncome)} accent="income" />
        <StatCard label="Average Daily Expense" value={formatCurrency(averageDailyExpense)} accent="expense" />
        <StatCard
          label={selectedMonth === currentMonthKey ? 'Current Month Income' : `${getMonthLabel(selectedMonth)} Income`}
          value={formatCurrency(selectedMonthIncome)}
          accent="income"
        />
        <StatCard
          label={selectedMonth === currentMonthKey ? 'Current Month Expense' : `${getMonthLabel(selectedMonth)} Expense`}
          value={formatCurrency(selectedMonth === currentMonthKey ? currentMonthExpense : selectedMonthExpense)}
          accent="expense"
        />
      </div>
      <ExpenseChart title={`${getMonthLabel(selectedMonth)} Expenses`} data={weeklyData.length ? weeklyData : [{ name: '1st W', amount: 0 }, { name: '2nd W', amount: 0 }, { name: '3rd W', amount: 0 }, { name: '4th W', amount: 0 }]} />
      <section className="rounded-[30px] bg-white p-5 shadow-panel">
        <p className="text-lg font-semibold text-ink">Category Breakdown</p>
        <p className="mt-1 text-xs text-slateSoft">Expense categories for {getMonthLabel(selectedMonth)}</p>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {categoryData.map((item, index) => (
                  <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-[30px] bg-white p-5 shadow-panel">
        <p className="text-lg font-semibold text-ink">Weekly Income vs Expense</p>
        <p className="mt-1 text-xs text-slateSoft">Week-by-week comparison for {getMonthLabel(selectedMonth)}</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCEEE3" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} interval={0} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#0ACF83" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expense" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      {selectedDay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-4">
          <div className="w-full max-w-sm rounded-[30px] bg-white p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-ink">Daily Details</p>
                <p className="mt-1 text-sm text-slateSoft">{formatCalendarDate(selectedMonth, selectedDay.day)}</p>
              </div>
              <button type="button" onClick={closeDayPopup} className="rounded-full bg-mist px-3 py-1 text-sm font-semibold text-ink">
                Close
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slateSoft">Income</p>
                <p className="mt-2 text-2xl font-bold text-income">{formatCurrency(selectedDay.income || 0)}</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slateSoft">Expense</p>
                <p className="mt-2 text-2xl font-bold text-red-500">{formatCurrency(selectedDay.expense || 0)}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <p className="text-sm font-semibold text-ink">Transactions</p>
              {selectedDayTransactions.length ? (
                selectedDayTransactions.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-2xl bg-mist/70 px-4 py-3">
                    <div>
                      <p className="font-semibold text-ink">{item.category}</p>
                      <p className="text-xs text-slateSoft">{item.notes || 'No notes'}</p>
                    </div>
                    <p className={`font-semibold ${item.type === 'income' ? 'text-income' : 'text-red-500'}`}>
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-mist/70 px-4 py-3 text-sm text-slateSoft">No transactions found for this day.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
