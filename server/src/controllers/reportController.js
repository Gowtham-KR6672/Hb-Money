import Transaction from '../models/Transaction.js';

export async function getReports(req, res, next) {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: 1 });
    const dailySpending = transactions
      .filter((item) => item.type === 'expense')
      .map((item) => ({
        date: item.date.toISOString().slice(0, 10),
        amount: item.amount
      }));

    const monthlyTotalsMap = transactions.reduce((map, item) => {
      const key = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      if (!map[key]) {
        map[key] = { month: key, income: 0, expense: 0 };
      }
      map[key][item.type] += item.amount;
      return map;
    }, {});

    const categoryMap = transactions.reduce((map, item) => {
      if (item.type === 'expense') {
        map[item.category] = (map[item.category] || 0) + item.amount;
      }
      return map;
    }, {});

    res.json({
      dailySpending,
      monthlyComparison: Object.values(monthlyTotalsMap),
      categoryBreakdown: Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }))
    });
  } catch (error) {
    next(error);
  }
}
