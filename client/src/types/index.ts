export type TransactionType = 'income' | 'expense'

export type Frequency = 'weekly' | 'monthly' | 'yearly' | null

export type IncomeCategory = 'Salary' | 'Freelance' | 'Business' | 'Gift' | 'Investment' | 'Other'

export type ExpenseCategory = 'Food' | 'Transport' | 'Rent' | 'Utilities' | 'Subscriptions' | 'Entertainment' | 'Miscellaneous'

export type Category = IncomeCategory | ExpenseCategory

export interface Transaction {
  _id: string
  userId: string
  type: TransactionType
  amount: number
  category: Category
  date: string
  recurring: boolean
  frequency: Frequency
  description?: string
  paymentMethod?: string
  createdAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  image?: string
  createdAt: string
}

export interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  recentTransactions: Transaction[]
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  incomeVsExpenses: { month: string; income: number; expenses: number }[]
  recurringExpenses: Transaction[]
}

export interface WeeklyData {
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  comparisonWithPreviousWeek: { income: number; expenses: number; percentage: number }
  topSpendingCategory: string
}

export interface MonthlyData {
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  recurringExpenseSummary: number
  trendComparison: { income: number; expenses: number }
  financialHealthScore: number
}
