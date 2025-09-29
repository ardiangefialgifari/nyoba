
'use client';

import { useState, useEffect } from 'react';
import { useRtdb } from '@/hooks/use-rtdb';
import { useAuth } from '@/lib/auth-provider';
import { useToast } from '@/hooks/use-toast';
import type { UserData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, ShieldAlert } from 'lucide-react';

const UserForm = ({ user, onFinished }: { user: Partial<UserData> | null, onFinished: () => void }) => {
  const { createItem, updateItem } = useRtdb<UserData>('users');
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const isEditing = !!user?.id;

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '', role: user.role || 'user' });
    } else {
      setFormData({ name: '', email: '', role: 'user' });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({ title: 'Validation Error', description: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { id, ...dataToSave } = { ...user, ...formData };
    if (isEditing) {
      await updateItem(user.id!, dataToSave);
    } else {
      toast({ title: 'Info', description: 'User creation via this form requires manual password setup in Firebase Auth.', variant: 'default' });
      await createItem(dataToSave as UserData);
    }
    setLoading(false);
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'user' | 'admin' })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" loading={loading} disabled={loading} className="w-full">
        {isEditing ? 'Save Changes' : 'Create User'}
      </Button>
    </form>
  );
};


export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { list: users, loading, deleteItem } = useRtdb<UserData>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Partial<UserData> | null>(null);

  if (currentUser?.data?.role !== 'admin') {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </Card>
    )
  }

  const openModal = (user: Partial<UserData> | null) => {
    setCurrentEdit(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEdit(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold font-headline">Manage Users</h2>
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                       <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openModal(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteItem(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">{currentEdit?.id ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <UserForm user={currentEdit} onFinished={closeModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
