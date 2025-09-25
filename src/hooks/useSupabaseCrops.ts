import { useEffect, useState } from 'react';
import { Crop } from '../types';
import supabase from '../integrations/supabase/client';

export function useSupabaseCrops() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // Leer cultivos al iniciar
  useEffect(() => {
    async function fetchCrops() {
      setLoading(true);
      const { data, error } = await supabase.from('crops').select('*');
      if (!error && data) setCrops(data as Crop[]);
      setLoading(false);
    }
    fetchCrops();
  }, []);

  // Crear o actualizar cultivo
  async function saveCrop(crop: Crop) {
    const { data, error } = await supabase
      .from('crops')
      .upsert([crop], { onConflict: 'id' });
    if (!error && data) setCrops(prev => {
      const idx = prev.findIndex(c => c.id === crop.id);
      if (idx > -1) {
        const newArr = [...prev];
        newArr[idx] = crop;
        return newArr;
      }
      return [...prev, crop];
    });
    return { data, error };
  }

  // Eliminar cultivo
  async function deleteCrop(id: string) {
    const { error } = await supabase.from('crops').delete().eq('id', id);
    if (!error) setCrops(prev => prev.filter(c => c.id !== id));
    return { error };
  }

  return { crops, loading, saveCrop, deleteCrop };
}