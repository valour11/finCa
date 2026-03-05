const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalIncome,
      totalExpenses,
      recentTransactions,
      categoryBreakdown,
      incomeVsExpenses,
      recurringExpenses
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'income', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.find({ userId: req.user._id }).sort({ date: -1 }).limit(10),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Transaction.find({ userId: req.user._id, recurring: true, type: 'expense' })
    ]);

    const income = totalIncome[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100) : 0;

    const totalExpensesAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);
    const categoryWithPercentage = categoryBreakdown.map(cat => ({
      category: cat._id,
      amount: cat.total,
      percentage: totalExpensesAmount > 0 ? ((cat.total / totalExpensesAmount) * 100).toFixed(1) : 0
    }));

    const monthlyData = {};
    incomeVsExpenses.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, income: 0, expenses: 0 };
      }
      monthlyData[key][item._id.type] = item.total;
    });

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      balance,
      savingsRate: savingsRate.toFixed(1),
      recentTransactions,
      categoryBreakdown: categoryWithPercentage,
      incomeVsExpenses: Object.values(monthlyData),
      recurringExpenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/weekly', async (req, res) => {
  try {
    const { weekOffset = 0 } = req.query;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + (parseInt(weekOffset) * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const prevStartOfWeek = new Date(startOfWeek);
    prevStartOfWeek.setDate(startOfWeek.getDate() - 7);
    const prevEndOfWeek = new Date(startOfWeek);
    prevEndOfWeek.setDate(startOfWeek.getDate() - 1);

    const [currentWeek, previousWeek] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfWeek, $lte: endOfWeek } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: prevStartOfWeek, $lte: prevEndOfWeek } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ])
    ]);

    const currentIncome = currentWeek.find(t => t._id === 'income')?.total || 0;
    const currentExpenses = currentWeek.find(t => t._id === 'expense')?.total || 0;
    const prevIncome = previousWeek.find(t => t._id === 'income')?.total || 0;
    const prevExpenses = previousWeek.find(t => t._id === 'expense')?.total || 0;

    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: startOfWeek, $lte: endOfWeek } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    const totalExpensesAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);
    const categoryWithPercentage = categoryBreakdown.map(cat => ({
      category: cat._id,
      amount: cat.total,
      percentage: totalExpensesAmount > 0 ? ((cat.total / totalExpensesAmount) * 100).toFixed(1) : 0
    }));

    const incomeChange = prevIncome > 0 ? (((currentIncome - prevIncome) / prevIncome) * 100).toFixed(1) : 0;
    const expensesChange = prevExpenses > 0 ? (((currentExpenses - prevExpenses) / prevExpenses) * 100).toFixed(1) : 0;

    res.json({
      totalIncome: currentIncome,
      totalExpenses: currentExpenses,
      balance: currentIncome - currentExpenses,
      savingsRate: currentIncome > 0 ? (((currentIncome - currentExpenses) / currentIncome) * 100).toFixed(1) : 0,
      categoryBreakdown: categoryWithPercentage,
      comparisonWithPreviousWeek: {
        income: incomeChange,
        expenses: expensesChange
      },
      topSpendingCategory: categoryBreakdown[0]?._id || 'None'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/monthly', async (req, res) => {
  try {
    const { monthOffset = 0 } = req.query;
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + parseInt(monthOffset), 1);
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const prevMonthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
    const prevMonthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 0, 23, 59, 59, 999);

    const [currentMonth, previousMonth, recurringExpenses] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { userId: req.user._id, recurring: true, type: 'expense' } },
        {
          $group: {
            _id: '$frequency',
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const income = currentMonth.find(t => t._id === 'income')?.total || 0;
    const expenses = currentMonth.find(t => t._id === 'expense')?.total || 0;
    const prevIncome = previousMonth.find(t => t._id === 'income')?.total || 0;
    const prevExpenses = previousMonth.find(t => t._id === 'expense')?.total || 0;

    const categoryBreakdown = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    const totalExpensesAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);
    const categoryWithPercentage = categoryBreakdown.map(cat => ({
      category: cat._id,
      amount: cat.total,
      percentage: totalExpensesAmount > 0 ? ((cat.total / totalExpensesAmount) * 100).toFixed(1) : 0
    }));

    const recurringMonthly = (recurringExpenses.find(r => r._id === 'monthly')?.total || 0) +
      ((recurringExpenses.find(r => r._id === 'weekly')?.total || 0) * 4) +
      ((recurringExpenses.find(r => r._id === 'yearly')?.total || 0) / 12);

    const savingsRate = income > 0 ? (((income - expenses) / income) * 100) : 0;
    const savingsRatio = savingsRate / 100;
    const expenseRatio = income > 0 ? (expenses / income) : 0;
    let financialHealthScore = 50;
    if (savingsRatio >= 0.2) financialHealthScore += 30;
    else if (savingsRatio >= 0.1) financialHealthScore += 20;
    else if (savingsRatio > 0) financialHealthScore += 10;
    if (expenseRatio <= 0.7) financialHealthScore += 20;
    else if (expenseRatio <= 0.8) financialHealthScore += 10;

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      savingsRate: savingsRate.toFixed(1),
      categoryBreakdown: categoryWithPercentage,
      recurringExpenseSummary: Math.round(recurringMonthly),
      trendComparison: {
        income: prevIncome > 0 ? (((income - prevIncome) / prevIncome) * 100).toFixed(1) : 0,
        expenses: prevExpenses > 0 ? (((expenses - prevExpenses) / prevExpenses) * 100).toFixed(1) : 0
      },
      financialHealthScore: Math.min(100, financialHealthScore)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
