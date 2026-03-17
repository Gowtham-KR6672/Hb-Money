import { ArrowDownLeft, ArrowUpRight, Banknote, ShoppingCart } from 'lucide-react';

const iconMap = {
  Salary: Banknote,
  Groceries: ShoppingCart,
  Rent: ArrowDownLeft
};

export default function TransactionList({ transactions, emptyMessage = 'No transactions found yet.' }) {
  if (!transactions.length) {
    return (
      <section className="px-4 pb-28">
        <div className="rounded-card bg-white p-6 text-center text-sm text-slateSoft shadow-panel">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 px-4 pb-28">
      {transactions.map((transaction) => {
        const Icon = iconMap[transaction.title] || (transaction.type === 'income' ? ArrowUpRight : ArrowDownLeft);
        return (
          <article key={transaction.id} className="grid grid-cols-[52px,1fr,auto] items-center gap-3 rounded-card bg-white p-4 shadow-panel">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${transaction.type === 'income' ? 'bg-brand/15 text-brand-500' : 'bg-blue-50 text-expense'}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-ink">{transaction.title}</p>
              <p className="text-xs text-slateSoft">{transaction.time}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slateSoft">{transaction.category}</p>
              <p className={`mt-1 font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>{transaction.amount}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
