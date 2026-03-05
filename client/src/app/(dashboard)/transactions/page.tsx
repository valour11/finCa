"use client";

import { useEffect, useState } from 'react';
import { transactionsAPI, analyticsAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TransactionForm } from '@/components/TransactionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, ArrowUpRight, ArrowDownRight, Trash2, Edit, Filter } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTransactions = async () => {
    try {
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      
      const res = await transactionsAPI.getAll(params);
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionsAPI.delete(id);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  const incomeCategories = ['Salary', 'Freelance', 'Business', 'Gift', 'Investment', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Rent', 'Utilities', 'Subscriptions', 'Entertainment', 'Miscellaneous'];
  const allCategories = typeFilter === 'income' ? incomeCategories : typeFilter === 'expense' ? expenseCategories : [...incomeCategories, ...expenseCategories];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your transactions</p>
        </div>
        <div className="flex gap-2">
          <TransactionForm type="income" onSuccess={() => setRefreshKey(k => k + 1)}>
            <Button variant="income">
              <ArrowUpRight className="w-4 h-4" /> Add Income
            </Button>
          </TransactionForm>
          <TransactionForm type="expense" onSuccess={() => setRefreshKey(k => k + 1)}>
            <Button variant="expense">
              <ArrowDownRight className="w-4 h-4" /> Add Expense
            </Button>
          </TransactionForm>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No transactions found. Add your first transaction to get started!
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-income-bg' : 'bg-expense-bg'}`}>
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-6 h-6 text-income" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.category}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(tx.date)}</span>
                        {tx.recurring && (
                          <span className="px-2 py-0.5 bg-secondary rounded-full text-xs">
                            {tx.frequency}
                          </span>
                        )}
                        {tx.description && <span>• {tx.description}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-bold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(tx._id)}
                      className="text-muted-foreground hover:text-expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
