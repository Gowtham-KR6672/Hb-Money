import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Banknote, Pencil, ShoppingCart, Trash2 } from 'lucide-react';

const iconMap = {
  Salary: Banknote,
  Groceries: ShoppingCart,
  Rent: ArrowDownLeft
};

function TransactionItem({ transaction, onEdit, onDelete }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(null);
  const [swipeOpen, setSwipeOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const Icon = iconMap[transaction.title] || (transaction.type === 'income' ? ArrowUpRight : ArrowDownLeft);
  const hasActions = Boolean(onEdit || onDelete);

  function handleTouchStart(event) {
    if (!hasActions) {
      return;
    }
    setStartX(event.touches[0].clientX);
  }

  function handleTouchMove(event) {
    if (!hasActions || startX === null) {
      return;
    }

    const delta = event.touches[0].clientX - startX;
    if (delta < 0) {
      setDragOffset(Math.max(delta, -112));
    }
  }

  function handleTouchEnd() {
    if (!hasActions) {
      return;
    }

    setSwipeOpen(dragOffset <= -40);
    setDragOffset(0);
    setStartX(null);
  }

  const translateX = hovered ? -116 : swipeOpen ? -116 : dragOffset;

  return (
    <article
      className="group relative overflow-hidden rounded-card shadow-panel"
      onMouseEnter={() => hasActions && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hasActions ? (
        <div className={`absolute inset-y-0 right-0 z-0 hidden w-28 items-center justify-center gap-2 bg-slate-100 px-3 transition-opacity duration-200 md:flex ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          {onEdit ? (
            <button type="button" onClick={() => onEdit(transaction)} className="rounded-2xl bg-white p-3 text-brand-700 shadow-soft transition hover:bg-brand hover:text-white">
              <Pencil size={18} />
            </button>
          ) : null}
          {onDelete ? (
            <button type="button" onClick={() => onDelete(transaction)} className="rounded-2xl bg-white p-3 text-expense shadow-soft transition hover:bg-expense hover:text-white">
              <Trash2 size={18} />
            </button>
          ) : null}
        </div>
      ) : null}
      {hasActions ? (
        <div className="absolute inset-y-0 right-0 z-0 flex w-28 items-center justify-center gap-2 bg-slate-100 px-3 md:hidden">
          {onEdit ? (
            <button type="button" onClick={() => onEdit(transaction)} className="rounded-2xl bg-white p-3 text-brand-700 shadow-soft">
              <Pencil size={18} />
            </button>
          ) : null}
          {onDelete ? (
            <button type="button" onClick={() => onDelete(transaction)} className="rounded-2xl bg-white p-3 text-expense shadow-soft">
              <Trash2 size={18} />
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className="relative z-10 grid grid-cols-[52px,1fr,auto] items-center gap-3 rounded-card bg-white p-4 transition-transform duration-200 will-change-transform"
        style={{ transform: `translateX(${translateX}px)`, touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
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
      </div>
    </article>
  );
}

export default function TransactionList({ transactions, emptyMessage = 'No transactions found yet.', onEdit, onDelete }) {
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
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </section>
  );
}
