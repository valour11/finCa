"use client";

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { TransactionForm } from '@/components/TransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

const COLORS = ['#2F3A4C', '#AAB8D6', '#64748B', '#94A3B8', '#475569', '#CBD5E1', '#E2E8F0'];

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  recentTransactions: any[];
  categoryBreakdown: { category: string; amount: number; percentage: string }[];
  incomeVsExpenses: { month: string; income: number; expenses: number }[];
  recurringExpenses: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your financial overview</p>
        </div>
        <div className="flex gap-2">
          <TransactionForm type="income" onSuccess={fetchData}>
            <Button variant="income">
              <Plus className="w-4 h-4" /> Add Income
            </Button>
          </TransactionForm>
          <TransactionForm type="expense" onSuccess={fetchData}>
            <Button variant="expense">
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          </TransactionForm>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">{formatCurrency(data?.totalIncome || 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">{formatCurrency(data?.totalExpenses || 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data?.balance || 0) >= 0 ? 'text-primary' : 'text-expense'}`}>
              {formatCurrency(data?.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
            {(data?.savingsRate || 0) >= 0 ? <TrendingUp className="w-4 h-4 text-income" /> : <TrendingDown className="w-4 h-4 text-expense" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data?.savingsRate || 0) >= 0 ? 'text-income' : 'text-expense'}`}>
              {data?.savingsRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Of income saved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${((Number(percent) || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No expenses this month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {data?.incomeVsExpenses && data.incomeVsExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.incomeVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {data.recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-income-bg' : 'bg-expense-bg'}`}>
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-income" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.category}</p>
                      <p className="text-sm text-muted-foreground">{tx.description || new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Start by adding your first income or expense!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
