import { useEffect, useState } from 'react';
import { Crop } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseCrops() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // Leer cultivos al iniciar
  useEffect(() => {
    let ignore = false;
    async function fetchCrops() {
      setLoading(true);
      const { data, error } = await supabase.from('crops').select('*');
      if (!error && data && !ignore) setCrops(data as Crop[]);
      setLoading(false);
    }
    fetchCrops();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('realtime-crops')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crops' },
        (payload) => {
          fetchCrops();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Crear o actualizar cultivo
  async function saveCrop(crop: Crop) {
    const { data, error } = await supabase
      .from('crops')
      .upsert([crop], { onConflict: 'id' });
    // No actualizamos localmente, el canal lo hará
    return { data, error };
  }

  // Eliminar cultivo
  async function deleteCrop(id: string) {
    const { error } = await supabase.from('crops').delete().eq('id', id);
    // No actualizamos localmente, el canal lo hará
    return { error };
  }

  return { crops, loading, saveCrop, deleteCrop };
}