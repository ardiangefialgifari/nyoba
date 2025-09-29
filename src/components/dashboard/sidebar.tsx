
'use client';

import { useAuth } from '@/lib/auth-provider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, Package, Settings, LogOut, Code } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'User Management', path: '/dashboard/users', icon: Users, adminOnly: true },
  { name: 'Product Inventory', path: '/dashboard/products', icon: Package },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.data?.role === 'admin';

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground min-h-screen p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-accent p-2 rounded-lg">
          <Code className="h-6 w-6 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold font-headline text-sidebar-foreground">AdminUI</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 
                    ${isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="pt-4 border-t border-sidebar-border">
        <Button onClick={logout} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
