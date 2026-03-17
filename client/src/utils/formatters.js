export const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
});

export function formatCurrency(amount = 0) {
  return currencyFormatter.format(Number(amount) || 0);
}

export function formatSignedCurrency(amount = 0, type = 'income') {
  const value = formatCurrency(amount);
  return type === 'expense' ? `-${value}` : value;
}

export function formatTransactionDate(date) {
  const parsed = new Date(date);
  return parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) +
    ' - ' +
    parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export function buildTransactionViewModel(item) {
  return {
    id: item._id || item.id,
    title: item.notes || item.category,
    time: formatTransactionDate(item.date),
    category: item.category,
    amount: formatSignedCurrency(item.amount, item.type),
    type: item.type
  };
}

export function getWeekLabel(index) {
  return `${index + 1}${['st', 'nd', 'rd', 'th'][index] || 'th'} W`;
}
