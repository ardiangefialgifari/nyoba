
'use client';

import { useAuth } from '@/lib/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Users, Package, Settings, LogOut, PanelLeft, Code } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'User Management', path: '/dashboard/users', icon: Users, adminOnly: true },
  { name: 'Product Inventory', path: '/dashboard/products', icon: Package },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.data?.role === 'admin';

  const pageTitle = navItems.find(item => item.path === pathname)?.name || 'Dashboard';

  return (
    <header className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="lg:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground p-4 flex flex-col">
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
          </SheetContent>
        </Sheet>
        <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">{pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={`https://i.pravatar.cc/150?u=${user?.email}`} alt={user?.data?.name || user?.email || 'User'} />
          <AvatarFallback className="font-bold bg-accent text-accent-foreground">
            {user?.data?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-foreground">
                {user?.data?.name || user?.email}
            </span>
             <span className="text-xs text-muted-foreground capitalize">
                {user?.data?.role || 'User'}
            </span>
        </div>
      </div>
    </header>
  );
}
