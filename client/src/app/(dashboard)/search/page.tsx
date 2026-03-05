"use client";

import { useState } from 'react';
import { transactionsAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await transactionsAPI.getAll({ limit: '50' });
      const allTransactions = res.data.transactions;
      const filtered = allTransactions.filter(
        (tx: any) =>
          tx.category.toLowerCase().includes(query.toLowerCase()) ||
          tx.description?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSearched(true);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-muted-foreground">Search through your transactions</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search by category or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No results found</p>
            ) : (
              <div className="space-y-4">
                {results.map((tx) => (
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
                        <p className="text-sm text-muted-foreground">{tx.description || formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
