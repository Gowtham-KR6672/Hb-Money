import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { serializeUser } from '../utils/serializers.js';

export async function getAdminStats(_req, res, next) {
  try {
    const [totalUsers, activeUsers, disabledUsers, totalTransactions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: 'active' }),
      User.countDocuments({ accountStatus: 'disabled' }),
      Transaction.countDocuments()
    ]);

    res.json({ totalUsers, activeUsers, disabledUsers, totalTransactions });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const transactionCounts = await Transaction.aggregate([
      {
        $group: {
          _id: '$userId',
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const countMap = new Map(transactionCounts.map((item) => [String(item._id), item.totalTransactions]));
    res.json(
      users.map((user) => ({
        ...serializeUser(user),
        totalTransactions: countMap.get(String(user._id)) || 0
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.params.userId);
    user.accountStatus = req.body.status;
    await user.save();
    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const user = await User.findById(req.params.userId);
    user.password = await bcrypt.hash(req.body.password || 'TempPass123!', 10);
    await user.save();
    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await User.findByIdAndDelete(req.params.userId);
    await Transaction.deleteMany({ userId: req.params.userId });
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
}
