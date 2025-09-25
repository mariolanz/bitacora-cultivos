import { useEffect, useState } from 'react';
import { MotherPlant } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseMotherPlants() {
  const [motherPlants, setMotherPlants] = useState<MotherPlant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchMothers() {
      setLoading(true);
      const { data, error } = await supabase.from('mother_plants').select('*');
      if (!error && data && !ignore) setMotherPlants(data as MotherPlant[]);
      setLoading(false);
    }
    fetchMothers();

    const channel = supabase
      .channel('realtime-mother_plants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mother_plants' },
        () => fetchMothers()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveMotherPlant(plant: MotherPlant) {
    const { data, error } = await supabase
      .from('mother_plants')
      .upsert([plant], { onConflict: 'id' });
    return { data, error };
  }

  async function deleteMotherPlant(id: string) {
    const { error } = await supabase.from('mother_plants').delete().eq('id', id);
    return { error };
  }

  return { motherPlants, loading, saveMotherPlant, deleteMotherPlant };
}