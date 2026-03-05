"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-lg">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About FinCa</CardTitle>
          <CardDescription>Your personal finance tracker</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            FinCa helps you track your income and expenses, providing insights into your spending habits. 
            Built with Next.js, Express, and MongoDB.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Version 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  );
}
