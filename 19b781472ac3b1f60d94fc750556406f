import { useEffect, useState } from 'react';
import ExpenseChart from '../components/ExpenseChart';
import FilterTabs from '../components/FilterTabs';
import LoadingScreen from '../components/LoadingScreen';
import SavingsCard from '../components/SavingsCard';
import SummaryHeader from '../components/SummaryHeader';
import TransactionList from '../components/TransactionList';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { buildTransactionViewModel, formatCurrency, formatSignedCurrency, getWeekLabel } from '../utils/formatters';

function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Daily');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [rawTransactions, setRawTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [{ data: summaryData }, { data: transactionsData }] = await Promise.all([
          api.get('/transactions/summary'),
          api.get('/transactions?page=1&limit=100')
        ]);

        setSummary(summaryData);
        setRawTransactions(transactionsData.items || []);
        setTransactions((summaryData.recentTransactions || []).map(buildTransactionViewModel));
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const expenseRatio = summary?.monthlyIncome
    ? (summary.monthlyExpense / Math.max(summary.monthlyIncome + summary.monthlyExpense, 1)) * 100
    : 0;

  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const transactionsWithDates = rawTransactions.map((item) => ({
    ...item,
    parsedDate: new Date(item.date)
  }));

  const weeklyTransactions = transactionsWithDates.filter((item) => item.parsedDate >= oneWeekAgo);

  const periods = {
    Daily: {
      title: 'Daily Expenses',
      revenueLabel: 'Revenue Today',
      expenseLabel: 'Expense Today',
      filter: (item) => item.parsedDate.toDateString() === now.toDateString(),
      chart: () => {
        const hourlyBuckets = Array.from({ length: 6 }, (_, index) => ({
          name: `${index * 4}:00`,
          amount: 0
        }));
        transactionsWithDates
          .filter((item) => item.type === 'expense' && item.parsedDate.toDateString() === now.toDateString())
          .forEach((item) => {
            const bucket = Math.min(5, Math.floor(item.parsedDate.getHours() / 4));
            hourlyBuckets[bucket].amount += item.amount;
          });
        return hourlyBuckets;
      }
    },
    Weekly: {
      title: 'Weekly Expenses',
      revenueLabel: 'Revenue Last Week',
      expenseLabel: 'Expense Last Week',
      filter: (item) => {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return item.parsedDate >= oneWeekAgo;
      },
      chart: () => {
        const groupedWeeks = [0, 0, 0, 0];
        transactionsWithDates
          .filter((item) => item.type === 'expense')
          .forEach((item) => {
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
            if (item.parsedDate >= oneMonthAgo) {
              const day = item.parsedDate.getDate();
              const weekIndex = Math.min(3, Math.floor((day - 1) / 7));
              groupedWeeks[weekIndex] += item.amount;
            }
          });
        return groupedWeeks.map((amount, index) => ({ name: getWeekLabel(index), amount }));
      }
    },
    Monthly: {
      title: 'Monthly Expenses',
      revenueLabel: 'Revenue This Month',
      expenseLabel: 'Expense This Month',
      filter: (item) => item.parsedDate.getMonth() === now.getMonth() && item.parsedDate.getFullYear() === now.getFullYear(),
      chart: () => {
        const monthBuckets = Array.from({ length: 6 }, (_, index) => {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
          return {
            name: getMonthLabel(monthDate),
            amount: 0
          };
        });

        transactionsWithDates
          .filter((item) => item.type === 'expense')
          .forEach((item) => {
            const bucketIndex = monthBuckets.findIndex((bucket) => bucket.name === getMonthLabel(item.parsedDate));
            if (bucketIndex >= 0) {
              monthBuckets[bucketIndex].amount += item.amount;
            }
          });

        return monthBuckets;
      }
    }
  };

  const currentPeriod = periods[activeTab];
  const filteredTransactions = transactionsWithDates.filter(currentPeriod.filter);
  const revenueSource = filteredTransactions;
  const expenseSource = filteredTransactions;
  const revenueValue = revenueSource.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expenseValue = expenseSource.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const activeChartData = currentPeriod.chart();
  const currentBalanceValue = summary?.currentBalance || 0;

  if (loading) {
    return <LoadingScreen label="Loading your money overview..." inline />;
  }

  return (
    <div className="pb-8">
      <SummaryHeader
        stats={{
          balance: formatCurrency((summary?.monthlyIncome || 0) - (summary?.monthlyExpense || 0)),
          expense: formatSignedCurrency(summary?.monthlyExpense || 0, 'expense'),
          expenseRatio
        }}
        userName={user?.name || 'User'}
      />
      <SavingsCard
        currentBalance={formatCurrency(currentBalanceValue)}
        currentBalancePositive={currentBalanceValue >= 0}
        revenueLabel={currentPeriod.revenueLabel}
        expenseLabel={currentPeriod.expenseLabel}
        revenueValue={formatCurrency(revenueValue)}
        expenseValue={formatSignedCurrency(expenseValue, 'expense')}
      />
      <div className="mt-6 space-y-5">
        <FilterTabs active={activeTab} onChange={setActiveTab} />
        {error ? <p className="px-4 text-sm text-expense">{error}</p> : null}
        <ExpenseChart
          title={currentPeriod.title}
          data={activeChartData.length ? activeChartData : [{ name: 'No Data', amount: 0 }]}
        />
        <div className="px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent Transactions</h2>
            <p className="text-sm font-semibold text-brand-700">{transactions.length} items</p>
          </div>
        </div>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
