import { Landmark, UtensilsCrossed } from 'lucide-react';

export default function SavingsCard({ currentBalance, currentBalancePositive, revenueLabel, expenseLabel, revenueValue, expenseValue }) {
  return (
    <section className="-mt-10 px-4">
      <div className="relative z-10 rounded-card bg-white p-5 shadow-panel">
        <div className="grid min-h-[172px] grid-cols-[108px,1fr] gap-4 sm:grid-cols-[120px,1fr]">
          <div className="flex flex-col items-center justify-center rounded-card bg-brand px-3 py-5 text-center text-white">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-white/40">
              <Landmark size={28} />
            </div>
            <p className="mt-3 text-sm font-semibold leading-tight">Savings On Goals</p>
          </div>
          <div className="flex min-h-full flex-col justify-center space-y-4 py-1">
            <div className="border-b border-slate-100 pb-4">
              <p className="text-xs text-slateSoft">Current Balance</p>
              <p className={`mt-1 text-2xl font-bold ${currentBalancePositive ? 'text-income' : 'text-red-500'}`}>{currentBalance}</p>
            </div>
            <div className="border-b border-slate-100 pb-4">
              <p className="text-xs text-slateSoft">{revenueLabel}</p>
              <p className="mt-1 text-2xl font-bold text-ink">{revenueValue}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slateSoft">
                <UtensilsCrossed size={16} />
                <p className="text-xs">{expenseLabel}</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-expense">{expenseValue}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
