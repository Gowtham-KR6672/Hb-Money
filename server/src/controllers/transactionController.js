import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, query, validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const createTransactionValidators = [
  body('amount').isNumeric(),
  body('type').isIn(['income', 'expense']),
  body('category').isString(),
  body('date').isISO8601()
];

export const listTransactionValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];
export const shareCodeValidators = [body('code').isLength({ min: 6, max: 6 }).withMessage('Valid 6 digit code required')];
export const statementRangeValidators = [
  query('from').isISO8601().withMessage('Valid from date required'),
  query('to').isISO8601().withMessage('Valid to date required')
];
export const downloadStatementValidators = [
  body('from').isISO8601().withMessage('Valid from date required'),
  body('to').isISO8601().withMessage('Valid to date required'),
  body('password').isString().notEmpty().withMessage('Password is required')
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, '../../../client/public/icon-512x512-cropped.png');

export async function createTransaction(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const transaction = await Transaction.create({
      ...req.body,
      userId: req.user._id
    });

    return res.status(201).json(transaction);
  } catch (error) {
    return next(error);
  }
}

export async function listTransactions(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Transaction.find({ userId: req.user._id }).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments({ userId: req.user._id })
    ]);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
}

export async function dashboardSummary(req, res, next) {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    const calc = (items, type) => items.filter((item) => item.type === type).reduce((sum, item) => sum + item.amount, 0);
    const todayTransactions = transactions.filter((item) => item.date >= todayStart);
    const monthTransactions = transactions.filter((item) => item.date >= startOfMonth);
    const income = calc(transactions, 'income');
    const expense = calc(transactions, 'expense');

    return res.json({
      todayIncome: calc(todayTransactions, 'income'),
      todayExpense: calc(todayTransactions, 'expense'),
      currentBalance: income - expense,
      monthlyIncome: calc(monthTransactions, 'income'),
      monthlyExpense: calc(monthTransactions, 'expense'),
      recentTransactions: transactions.slice(0, 5)
    });
  } catch (error) {
    return next(error);
  }
}

function buildCurrentMonthTotals(transactions) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTransactions = transactions.filter((item) => item.date >= startOfMonth);

  return {
    income: monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
    expense: monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  };
}

function buildCategoryBreakdown(transactions) {
  const breakdown = {
    income: {},
    expense: {}
  };

  transactions.forEach((item) => {
    const bucket = breakdown[item.type];
    if (!bucket) {
      return;
    }

    bucket[item.category] = (bucket[item.category] || 0) + item.amount;
  });

  return {
    income: Object.entries(breakdown.income)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    expense: Object.entries(breakdown.expense)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  };
}

function normalizeDateRange(fromValue, toValue) {
  const start = new Date(fromValue);
  start.setHours(0, 0, 0, 0);

  const end = new Date(toValue);
  end.setHours(23, 59, 59, 999);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }

  return { start, end };
}

function buildRangeSummary(transactions) {
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  return {
    income,
    expense,
    balance: income - expense
  };
}

function formatPdfCurrency(amount) {
  return `INR ${Number(amount || 0).toFixed(2)}`;
}

function formatPdfDate(value) {
  return new Date(value).toLocaleDateString('en-GB');
}

async function loadPdfAsset(imagePathOrUrl) {
  if (!imagePathOrUrl) {
    return null;
  }

  try {
    if (/^https?:\/\//i.test(imagePathOrUrl)) {
      const response = await fetch(imagePathOrUrl);
      if (!response.ok) {
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    return await fs.readFile(imagePathOrUrl);
  } catch {
    return null;
  }
}

function drawDetailRow(doc, label, value, top) {
  doc.fontSize(10).fillColor('#64748b').text(label.toUpperCase(), 240, top);
  doc.fontSize(14).fillColor('#0f172a').text(value || '-', 240, top + 16);
}

function ensurePageSpace(doc, extraHeight = 80) {
  if (doc.y + extraHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

async function buildStatementPdf({ user, transactions, from, to, password }) {
  const [logoBuffer, profileBuffer] = await Promise.all([loadPdfAsset(logoPath), loadPdfAsset(user.profileImage)]);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      userPassword: password,
      ownerPassword: `${user._id}-${Date.now()}`,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false
      }
    });

    const buffers = [];
    const summary = buildRangeSummary(transactions);

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.roundedRect(40, 40, doc.page.width - 80, 160, 28).fill('#ecfdf5');
    if (logoBuffer) {
      doc.image(logoBuffer, 60, 62, { fit: [72, 72] });
    }
    doc.fontSize(24).fillColor('#0f172a').text('HB Money Statement', 150, 68);
    doc.fontSize(12).fillColor('#475569').text('Personal finance summary and protected transaction report', 150, 102);
    doc.fontSize(11).fillColor('#166534').text(`Statement Range: ${formatPdfDate(from)} to ${formatPdfDate(to)}`, 150, 134);
    doc.fontSize(11).fillColor('#475569').text(`Generated On: ${formatPdfDate(new Date())}`, 150, 154);

    doc.roundedRect(40, 228, doc.page.width - 80, 250, 28).fill('#ffffff');
    if (profileBuffer) {
      doc.image(profileBuffer, 60, 258, { fit: [140, 140], align: 'center', valign: 'center' });
    } else {
      doc.roundedRect(60, 258, 140, 140, 24).fill('#d1fae5');
      doc.fontSize(42).fillColor('#059669').text((user.name || 'HB').slice(0, 2).toUpperCase(), 96, 306, { width: 68, align: 'center' });
    }

    doc.fontSize(18).fillColor('#0f172a').text('Account Details', 240, 258);
    drawDetailRow(doc, 'Name', user.name, 304);
    drawDetailRow(doc, 'Email', user.email, 360);
    drawDetailRow(doc, 'Phone', user.phone || 'Not provided', 416);

    doc.addPage();
    doc.fontSize(22).fillColor('#0f172a').text('Transaction Details', 40, 48);
    doc.fontSize(11).fillColor('#475569').text(`Range: ${formatPdfDate(from)} to ${formatPdfDate(to)}`, 40, 80);

    doc.roundedRect(40, 110, doc.page.width - 80, 110, 24).fill('#ffffff');
    doc.fontSize(13).fillColor('#0f172a').text('Summary', 58, 132);
    doc.fontSize(11).fillColor('#166534').text(`Income: ${formatPdfCurrency(summary.income)}`, 58, 164);
    doc.fillColor('#dc2626').text(`Expense: ${formatPdfCurrency(summary.expense)}`, 220, 164);
    doc.fillColor(summary.balance >= 0 ? '#166534' : '#dc2626').text(`Balance: ${formatPdfCurrency(summary.balance)}`, 382, 164);

    doc.fontSize(13).fillColor('#0f172a').text('Transactions', 40, 246);
    doc.y = 274;

    if (!transactions.length) {
      doc.fontSize(11).fillColor('#64748b').text('No transactions found for the selected date range.');
    } else {
      transactions.forEach((item, index) => {
        ensurePageSpace(doc, 86);
        const amountColor = item.type === 'income' ? '#166534' : '#dc2626';
        const cardTop = doc.y;
        doc.roundedRect(40, cardTop, doc.page.width - 80, 70, 18).fill('#ffffff');
        doc.fontSize(11).fillColor('#0f172a').text(`${index + 1}. ${item.category}`, 56, cardTop + 14);
        doc.fontSize(10).fillColor('#64748b').text(item.type === 'income' ? 'Income' : 'Expense', 56, cardTop + 34);
        doc.text(`Date: ${formatPdfDate(item.date)}`, 160, cardTop + 34);
        doc.fillColor(amountColor).text(formatPdfCurrency(item.amount), 410, cardTop + 14, { width: 120, align: 'right' });
        doc.fillColor('#475569').text(`Notes: ${item.notes || '-'}`, 56, cardTop + 52, { width: 470 });
        doc.y = cardTop + 86;
      });
    }

    doc.end();
  });
}

export async function generateShareCode(req, res, next) {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.shareCode = code;
    req.user.shareCodeExpiresAt = new Date(Date.now() + 30 * 1000);
    await req.user.save();

    return res.json({
      code,
      expiresInSeconds: 30,
      expiresAt: req.user.shareCodeExpiresAt
    });
  } catch (error) {
    return next(error);
  }
}

export async function lookupShareCode(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const owner = await User.findOne({
      shareCode: req.body.code,
      shareCodeExpiresAt: { $gt: new Date() }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Code is invalid or expired.' });
    }

    const transactions = await Transaction.find({ userId: owner._id });
    const totals = buildCurrentMonthTotals(transactions);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthTransactions = transactions.filter((item) => item.date >= startOfMonth);
    const categoryBreakdown = buildCategoryBreakdown(currentMonthTransactions);

    return res.json({
      owner: {
        name: owner.name,
        email: owner.email
      },
      currentMonthIncome: totals.income,
      currentMonthExpense: totals.expense,
      incomeByCategory: categoryBreakdown.income,
      expenseByCategory: categoryBreakdown.expense
    });
  } catch (error) {
    return next(error);
  }
}

export async function viewStatementRange(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const range = normalizeDateRange(req.query.from, req.query.to);
    if (!range) {
      return res.status(422).json({ message: 'From date must be before or equal to the to date.' });
    }

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: range.start, $lte: range.end }
    }).sort({ date: -1 });

    return res.json({
      from: req.query.from,
      to: req.query.to,
      items: transactions,
      summary: buildRangeSummary(transactions)
    });
  } catch (error) {
    return next(error);
  }
}

export async function downloadStatementPdf(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const range = normalizeDateRange(req.body.from, req.body.to);
    if (!range) {
      return res.status(422).json({ message: 'From date must be before or equal to the to date.' });
    }

    if (!req.user.password) {
      return res.status(400).json({ message: 'This account does not have a password set for protected downloads.' });
    }

    const passwordMatches = await bcrypt.compare(req.body.password, req.user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Login password is incorrect.' });
    }

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: range.start, $lte: range.end }
    }).sort({ date: -1 });

    const pdfBuffer = await buildStatementPdf({
      user: req.user,
      transactions,
      from: range.start,
      to: range.end,
      password: req.body.password
    });

    const filename = `hb-money-statement-${req.body.from}-to-${req.body.to}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
}
