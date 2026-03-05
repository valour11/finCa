"use client";

import { useState } from 'react';
import { transactionsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TransactionType, Category } from '@/types';

const incomeCategories = ['Salary', 'Freelance', 'Business', 'Gift', 'Investment', 'Other'];
const expenseCategories = ['Food', 'Transport', 'Rent', 'Utilities', 'Subscriptions', 'Entertainment', 'Miscellaneous'];

interface TransactionFormProps {
  type: TransactionType;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function TransactionForm({ type, onSuccess, trigger, children }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    frequency: 'monthly',
    description: '',
    paymentMethod: '',
  });

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionsAPI.create({
        type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: new Date(formData.date),
        recurring: formData.recurring,
        frequency: formData.recurring ? formData.frequency : null,
        description: formData.description,
        paymentMethod: formData.paymentMethod || undefined,
      });
      setOpen(false);
      setFormData({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        recurring: false,
        frequency: 'monthly',
        description: '',
        paymentMethod: '',
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create transaction', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant={type === 'income' ? 'income' : 'expense'}>
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {type === 'income' ? 'Income' : 'Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="recurring" className="text-sm">Recurring</label>
          </div>
          {formData.recurring && (
            <div className="space-y-2">
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
