import { useEffect, useState } from 'react';
import { Formula } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseFormulas() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchFormulas() {
      setLoading(true);
      const { data, error } = await supabase.from('formulas').select('*');
      if (!error && data && !ignore) setFormulas(data as Formula[]);
      setLoading(false);
    }
    fetchFormulas();

    const channel = supabase
      .channel('realtime-formulas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'formulas' },
        () => fetchFormulas()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveFormula(formula: Formula) {
    const { data, error } = await supabase
      .from('formulas')
      .upsert([formula], { onConflict: 'id' });
    return { data, error };
  }

  async function deleteFormula(id: string) {
    const { error } = await supabase.from('formulas').delete().eq('id', id);
    return { error };
  }

  return { formulas, loading, saveFormula, deleteFormula };
}