
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-provider";
import Link from "next/link";
import { useRtdb } from "@/hooks/use-rtdb";
import { UserData, ProductData } from "@/types";
import { Users, Package, DollarSign, Loader2 } from "lucide-react";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const { list: users, loading: usersLoading } = useRtdb<UserData>('users');
  const { list: products, loading: productsLoading } = useRtdb<ProductData>('products');
  
  const averagePrice = products.length > 0
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length
    : 0;

  const stats = [
    { name: 'Total Users', value: users.length, icon: Users, loading: usersLoading },
    { name: 'Total Products', value: products.length, icon: Package, loading: productsLoading },
    { name: 'Avg. Product Price', value: `$${averagePrice.toFixed(2)}`, icon: DollarSign, loading: productsLoading },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Welcome, {user?.data?.name || user?.email}!</CardTitle>
          <CardDescription>Here's a quick summary of your application's status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.name} className="flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.name}</h3>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                {stat.loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-accent mt-2" />
                ) : (
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                )}
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/dashboard/users" className="text-accent font-medium hover:underline">Manage Users</Link>
            <Link href="/dashboard/products" className="text-accent font-medium hover:underline">Manage Products</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
