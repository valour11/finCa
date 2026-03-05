"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  TrendingUp, 
  Search, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
];

const bottomItems = [
  { href: '/search', label: 'Search', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E6ECF5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#E6ECF5] flex">
      <aside className="w-64 bg-[#D3DAE6] fixed h-full p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">FinCa</h1>
        </div>

        <div className="mb-6 p-4 bg-white/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/50 hover:text-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="space-y-1 mt-auto pt-4 border-t border-border/50">
          {bottomItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/50 hover:text-primary transition-all duration-200"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/50 hover:text-primary transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
