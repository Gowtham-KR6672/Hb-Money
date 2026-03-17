import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { sendMonthlyStatement } from './brevoService.js';

async function sendStatementsForPreviousMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const users = await User.find({ accountStatus: 'active' });

  for (const user of users) {
    const transactions = await Transaction.find({
      userId: user._id,
      date: { $gte: start, $lte: end }
    });

    const totalIncome = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const categoryMap = transactions.reduce((map, item) => {
      if (item.type === 'expense') {
        map[item.category] = (map[item.category] || 0) + item.amount;
      }
      return map;
    }, {});

    const topCategories = Object.entries(categoryMap)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([category]) => category)
      .join(', ') || 'No expenses tracked';

    await sendMonthlyStatement(user.email, {
      totalIncome: `$${totalIncome.toFixed(2)}`,
      totalExpense: `$${totalExpense.toFixed(2)}`,
      savings: `$${(totalIncome - totalExpense).toFixed(2)}`,
      topCategories
    });
  }
}

export function scheduleMonthlyStatements() {
  cron.schedule('0 8 1 * *', async () => {
    await sendStatementsForPreviousMonth();
  });
}
