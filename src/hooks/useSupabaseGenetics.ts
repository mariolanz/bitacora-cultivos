import { useEffect, useState } from 'react';
import { Genetics } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseGenetics() {
  const [genetics, setGenetics] = useState<Genetics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchGenetics() {
      setLoading(true);
      const { data, error } = await supabase.from('genetics').select('*');
      if (!error && data && !ignore) setGenetics(data as Genetics[]);
      setLoading(false);
    }
    fetchGenetics();

    const channel = supabase
      .channel('realtime-genetics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'genetics' },
        () => fetchGenetics()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveGenetic(genetic: Genetics) {
    const { data, error } = await supabase
      .from('genetics')
      .upsert([genetic], { onConflict: 'id' });
    return { data, error };
  }

  async function deleteGenetic(id: string) {
    const { error } = await supabase.from('genetics').delete().eq('id', id);
    return { error };
  }

  return { genetics, loading, saveGenetic, deleteGenetic };
}