import { useEffect, useState } from 'react';
import { Location } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchLocations() {
      setLoading(true);
      const { data, error } = await supabase.from('locations').select('*');
      if (!error && data && !ignore) setLocations(data as Location[]);
      setLoading(false);
    }
    fetchLocations();

    const channel = supabase
      .channel('realtime-locations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'locations' },
        () => fetchLocations()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveLocation(location: Location) {
    const { data, error } = await supabase
      .from('locations')
      .upsert([location], { onConflict: 'id' });
    return { data, error };
  }

  async function deleteLocation(id: string) {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    return { error };
  }

  return { locations, loading, saveLocation, deleteLocation };
}