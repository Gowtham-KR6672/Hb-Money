import { Bell, WalletCards } from 'lucide-react';

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  }

  if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  }

  return 'Good Night';
}

export default function SummaryHeader({ stats, userName }) {
  const percent = Math.min(100, Math.round(stats.expenseRatio || 0));
  const greeting = getTimeGreeting();

  return (
    <section className="relative overflow-hidden rounded-b-[38px] bg-brand px-5 pb-24 pt-6 text-white shadow-soft">
      <div className="absolute inset-x-0 top-0 h-20 bg-white/10 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-base font-semibold">Hi, Welcome Back {userName}</p>
          <p className="text-xs text-white/80">{greeting}</p>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
          <Bell size={18} />
        </button>
      </div>
      <div className="relative mt-7 grid grid-cols-2 gap-4 border-b border-white/20 pb-4">
        <div>
          <p className="text-xs text-white/80">Monthly Balance</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{stats.balance}</p>
        </div>
        <div className="border-l border-white/20 pl-4">
          <p className="text-xs text-white/80">Monthly Expense</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{stats.expense}</p>
        </div>
      </div>
      <div className="relative mt-4 space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <WalletCards size={16} />
          <p>{percent}% of your money flow is expense this period.</p>
        </div>
      </div>
    </section>
  );
}
