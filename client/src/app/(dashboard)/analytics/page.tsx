"use client";

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

const COLORS = ['#2F3A4C', '#AAB8D6', '#64748B', '#94A3B8', '#475569', '#CBD5E1', '#E2E8F0'];

interface WeeklyData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: string;
  categoryBreakdown: { category: string; amount: number; percentage: string }[];
  comparisonWithPreviousWeek: { income: string; expenses: string };
  topSpendingCategory: string;
}

interface MonthlyData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: string;
  categoryBreakdown: { category: string; amount: number; percentage: string }[];
  recurringExpenseSummary: number;
  trendComparison: { income: string; expenses: string };
  financialHealthScore: number;
}

export default function AnalyticsPage() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [weeklyRes, monthlyRes] = await Promise.all([
        analyticsAPI.getWeekly(weekOffset),
        analyticsAPI.getMonthly(monthOffset)
      ]);
      setWeeklyData(weeklyRes.data);
      setMonthlyData(monthlyRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [weekOffset, monthOffset]);

  const getWeekLabel = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (weekOffset * 7));
    return startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMonthLabel = () => {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed financial analysis and insights</p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium">{getWeekLabel()}</span>
              <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w + 1)} disabled={weekOffset >= 0}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-income">{formatCurrency(weeklyData?.totalIncome || 0)}</div>
                <div className={`text-xs ${parseFloat(weeklyData?.comparisonWithPreviousWeek?.income || '0') >= 0 ? 'text-income' : 'text-expense'}`}>
                  {parseFloat(weeklyData?.comparisonWithPreviousWeek?.income || '0') >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(weeklyData?.comparisonWithPreviousWeek?.income || '0'))}% vs last week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">{formatCurrency(weeklyData?.totalExpenses || 0)}</div>
                <div className={`text-xs ${parseFloat(weeklyData?.comparisonWithPreviousWeek?.expenses || '0') <= 0 ? 'text-income' : 'text-expense'}`}>
                  {parseFloat(weeklyData?.comparisonWithPreviousWeek?.expenses || '0') >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(weeklyData?.comparisonWithPreviousWeek?.expenses || '0'))}% vs last week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(weeklyData?.balance || 0) >= 0 ? 'text-primary' : 'text-expense'}`}>
                  {formatCurrency(weeklyData?.balance || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${parseFloat(weeklyData?.savingsRate || '0') >= 0 ? 'text-income' : 'text-expense'}`}>
                  {weeklyData?.savingsRate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {weeklyData?.categoryBreakdown && weeklyData.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={weeklyData.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="category"
                        label={({ percent }) => `${((Number(percent) || 0) * 100).toFixed(0)}%`}
                      >
                        {weeklyData.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expenses this week
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="font-medium">Top Spending Category</span>
                  </div>
                  <p className="text-lg">
                    You spent most on <span className="font-bold">{weeklyData?.topSpendingCategory || 'N/A'}</span>
                  </p>
                </div>

                {(weeklyData?.balance || 0) < 0 && (
                  <div className="p-4 bg-expense-bg rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-expense" />
                      <span className="font-medium text-expense">Overspending Alert</span>
                    </div>
                    <p>Your expenses exceeded your income this week. Consider reviewing your spending.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setMonthOffset(m => m - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium">{getMonthLabel()}</span>
              <Button variant="outline" size="icon" onClick={() => setMonthOffset(m => m + 1)} disabled={monthOffset >= 0}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-income">{formatCurrency(monthlyData?.totalIncome || 0)}</div>
                <div className={`text-xs ${parseFloat(monthlyData?.trendComparison?.income || '0') >= 0 ? 'text-income' : 'text-expense'}`}>
                  {parseFloat(monthlyData?.trendComparison?.income || '0') >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(monthlyData?.trendComparison?.income || '0'))}% vs last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-expense">{formatCurrency(monthlyData?.totalExpenses || 0)}</div>
                <div className={`text-xs ${parseFloat(monthlyData?.trendComparison?.expenses || '0') <= 0 ? 'text-income' : 'text-expense'}`}>
                  {parseFloat(monthlyData?.trendComparison?.expenses || '0') >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(monthlyData?.trendComparison?.expenses || '0'))}% vs last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(monthlyData?.balance || 0) >= 0 ? 'text-primary' : 'text-expense'}`}>
                  {formatCurrency(monthlyData?.balance || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{monthlyData?.financialHealthScore || 0}/100</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${monthlyData?.financialHealthScore || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {monthlyData?.categoryBreakdown && monthlyData.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyData.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="category"
                        label={({ percent }) => `${((Number(percent) || 0) * 100).toFixed(0)}%`}
                      >
                        {monthlyData.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                      <Legend />
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
                <CardTitle>Monthly Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium">Recurring Expenses</span>
                  </div>
                  <p className="text-lg">
                    Your monthly recurring expenses: <span className="font-bold">{formatCurrency(monthlyData?.recurringExpenseSummary || 0)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {monthlyData?.totalExpenses && monthlyData.totalExpenses > 0 
                      ? `${((monthlyData?.recurringExpenseSummary || 0) / monthlyData.totalExpenses * 100).toFixed(1)}% of total expenses`
                      : 'Add expenses to see breakdown'}
                  </p>
                </div>

                <div className="p-4 bg-income-bg rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-income" />
                    <span className="font-medium text-income">Savings Rate</span>
                  </div>
                  <p className="text-lg">
                    You saved <span className="font-bold text-income">{monthlyData?.savingsRate || 0}%</span> of your income
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
