import { useEffect, useState } from 'react';
import { Expense } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchExpenses() {
      setLoading(true);
      const { data, error } = await supabase.from('expenses').select('*');
      if (!error && data && !ignore) setExpenses(data as Expense[]);
      setLoading(false);
    }
    fetchExpenses();

    const channel = supabase
      .channel('realtime-expenses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => fetchExpenses()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveExpense(expense: Expense) {
    const { data, error } = await supabase
      .from('expenses')
      .upsert([expense], { onConflict: 'id' });
    return { data, error };
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    return { error };
  }

  return { expenses, loading, saveExpense, deleteExpense };
}