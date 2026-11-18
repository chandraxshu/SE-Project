import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadItemPhoto } from '@/services/storage';
import type { Item } from '@/types';

interface FetchItemsFilters {
  category?: string;
  status?: string;
  search?: string;
  report_type?: 'lost' | 'found';
  page?: number;
  pageSize?: number;
}

interface FetchItemsResult {
  items: Item[];
  count: number;
}

export function useItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(
    async (filters: FetchItemsFilters = {}): Promise<FetchItemsResult> => {
      setLoading(true);
      setError(null);

      try {
        const {
          category,
          status = 'active',
          search,
          report_type,
          page = 1,
          pageSize = 12,
        } = filters;

        let query = supabase
          .from('items')
          .select('*, reporter:profiles!items_reported_by_fkey(full_name, email, roll_number, department)', {
            count: 'exact',
          });

        if (status) {
          query = query.eq('status', status);
        }

        if (category) {
          query = query.eq('category', category);
        }

        if (report_type) {
          query = query.eq('report_type', report_type);
        }

        if (search) {
          query = query.or(
            `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`
          );
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        query = query.order('created_at', { ascending: false }).range(from, to);

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        return {
          items: (data as Item[]) ?? [],
          count: count ?? 0,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch items';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchItemById = useCallback(async (id: string): Promise<Item> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*, reporter:profiles!items_reported_by_fkey(full_name, email, roll_number, department)')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      return data as Item;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch item';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (
      data: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'photo_url' | 'status'>,
      photo?: File | null
    ): Promise<Item> => {
      setLoading(true);
      setError(null);

      try {
        const { data: newItem, error: insertError } = await supabase
          .from('items')
          .insert({
            ...data,
            status: 'active',
          })
          .select('*')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        const item = newItem as Item;

        if (photo) {
          const photoUrl = await uploadItemPhoto(photo, item.id);

          const { data: updatedItem, error: updateError } = await supabase
            .from('items')
            .update({ photo_url: photoUrl })
            .eq('id', item.id)
            .select('*')
            .single();

          if (updateError) {
            throw new Error(updateError.message);
          }

          return updatedItem as Item;
        }

        return item;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create item';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateItem = useCallback(
    async (id: string, data: Partial<Item>): Promise<Item> => {
      setLoading(true);
      setError(null);

      try {
        const { data: updatedItem, error: updateError } = await supabase
          .from('items')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select('*')
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        return updatedItem as Item;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update item';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyItems = useCallback(
    async (userId: string, reportType?: 'lost' | 'found'): Promise<Item[]> => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('items')
          .select('*')
          .eq('reported_by', userId)
          .neq('status', 'archived');

        if (reportType) {
          query = query.eq('report_type', reportType);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        return (data as Item[]) ?? [];
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch your items';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    fetchMyItems,
  };
}
