
'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove, off, DatabaseReference } from 'firebase/database';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';

export function useRtdb<T>(resource: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const resourceRef = db ? ref(db, resource) : null;

  useEffect(() => {
    if (!resourceRef) {
      setLoading(false);
      return;
    }

    const listener = onValue(
      resourceRef,
      (snapshot) => {
        const val = snapshot.val();
        const loadedData: T[] = [];
        if (val) {
          Object.keys(val).forEach(key => {
            loadedData.push({ id: key, ...val[key] } as T);
          });
        }
        setData(loadedData);
        setLoading(false);
      },
      (error) => {
        console.error(`RTDB Error (${resource}):`, error);
        toast({
          title: 'Data Error',
          description: error.code === 'PERMISSION_DENIED'
            ? `Access to ${resource} denied. Check your Realtime Database security rules.`
            : `Failed to load ${resource} data.`,
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    return () => {
      off(resourceRef, 'value', listener);
    };
  }, [resource, toast, resourceRef]);

  const createItem = async (item: Omit<T, 'id'>) => {
    if (!resourceRef) return;
    try {
      await push(resourceRef, item);
      toast({ title: 'Success', description: `Item in ${resource} created successfully.` });
    } catch (e: any) {
      toast({ title: 'Error', description: `Failed to create item: ${e.message}`, variant: 'destructive' });
    }
  };

  const updateItem = async (id: string, item: Partial<Omit<T, 'id'>>) => {
    if (!db) return;
    try {
      const itemRef = ref(db, `${resource}/${id}`);
      await update(itemRef, item);
      toast({ title: 'Success', description: `Item in ${resource} updated successfully.` });
    } catch (e: any) {
      toast({ title: 'Error', description: `Failed to update item: ${e.message}`, variant: 'destructive' });
    }
  };

  const deleteItem = async (id: string) => {
    if (!db) return;
    try {
      const itemRef = ref(db, `${resource}/${id}`);
      await remove(itemRef);
      toast({ title: 'Success', description: `Item from ${resource} deleted successfully.` });
    } catch (e: any) {
      toast({ title: 'Error', description: `Failed to delete item: ${e.message}`, variant: 'destructive' });
    }
  };

  const list = data.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

  return { list, loading, createItem, updateItem, deleteItem };
}
