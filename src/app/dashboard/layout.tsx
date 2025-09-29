
'use client';

import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="ml-3 text-lg text-foreground">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30 text-foreground">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col">
        <Header />
        <div className="mt-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
