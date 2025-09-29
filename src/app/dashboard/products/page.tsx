
'use client';

import { useState, useEffect } from 'react';
import { useRtdb } from '@/hooks/use-rtdb';
import { useToast } from '@/hooks/use-toast';
import type { ProductData } from '@/types';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

const ProductForm = ({ product, onFinished }: { product: Partial<ProductData> | null, onFinished: () => void }) => {
  const { createItem, updateItem } = useRtdb<ProductData>('products');
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', description: '', price: 0 });
  const [loading, setLoading] = useState(false);
  const isEditing = !!product?.id;

  useEffect(() => {
    if (product) {
      setFormData({ name: product.name || '', description: product.description || '', price: product.price || 0 });
    } else {
      setFormData({ name: '', description: '', price: 0 });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast({ title: 'Validation Error', description: 'All fields are required and price must be positive.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const dataToSave = { ...formData, price: parseFloat(String(formData.price)) };
    if (isEditing) {
      await updateItem(product.id!, dataToSave);
    } else {
      await createItem(dataToSave as ProductData);
    }
    setLoading(false);
    onFinished();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price ($)</Label>
        <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required min="0.01" step="0.01" />
      </div>
      <Button type="submit" loading={loading} disabled={loading} className="w-full">
        {isEditing ? 'Save Changes' : 'Create Product'}
      </Button>
    </form>
  );
};


export default function ProductsPage() {
  const { list: products, loading, deleteItem } = useRtdb<ProductData>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Partial<ProductData> | null>(null);

  const openModal = (product: Partial<ProductData> | null) => {
    setCurrentEdit(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEdit(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold font-headline">Manage Products</h2>
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
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
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No products found.</TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                      <TableCell className="font-semibold">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openModal(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteItem(product.id)}>
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
            <DialogTitle className="font-headline">{currentEdit?.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm product={currentEdit} onFinished={closeModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
