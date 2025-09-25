import { useEffect, useState } from 'react';
import { PlantBatch } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabasePlantBatches() {
  const [plantBatches, setPlantBatches] = useState<PlantBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchBatches() {
      setLoading(true);
      const { data, error } = await supabase.from('plant_batches').select('*');
      if (!error && data && !ignore) setPlantBatches(data as PlantBatch[]);
      setLoading(false);
    }
    fetchBatches();

    const channel = supabase
      .channel('realtime-plant_batches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plant_batches' },
        () => fetchBatches()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function savePlantBatch(batch: PlantBatch) {
    const { data, error } = await supabase
      .from('plant_batches')
      .upsert([batch], { onConflict: 'id' });
    return { data, error };
  }

  async function deletePlantBatch(id: string) {
    const { error } = await supabase.from('plant_batches').delete().eq('id', id);
    return { error };
  }

  return { plantBatches, loading, savePlantBatch, deletePlantBatch };
}