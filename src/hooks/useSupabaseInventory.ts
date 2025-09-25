import { useEffect, useState } from 'react';
import { InventoryItem } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchInventory() {
      setLoading(true);
      const { data, error } = await supabase.from('inventory_items').select('*');
      if (!error && data && !ignore) setInventory(data as InventoryItem[]);
      setLoading(false);
    }
    fetchInventory();

    const channel = supabase
      .channel('realtime-inventory_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        () => fetchInventory()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveInventoryItem(item: InventoryItem) {
    const { data, error } = await supabase
      .from('inventory_items')
      .upsert([item], { onConflict: 'id' });
    return { data, error };
  }

  async function deleteInventoryItem(id: string) {
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    return { error };
  }

  return { inventory, loading, saveInventoryItem, deleteInventoryItem };
}