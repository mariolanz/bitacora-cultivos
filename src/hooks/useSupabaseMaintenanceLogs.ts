import { useEffect, useState } from 'react';
import { MaintenanceLog } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseMaintenanceLogs() {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchLogs() {
      setLoading(true);
      const { data, error } = await supabase.from('maintenance_logs').select('*');
      if (!error && data && !ignore) setMaintenanceLogs(data as MaintenanceLog[]);
      setLoading(false);
    }
    fetchLogs();

    const channel = supabase
      .channel('realtime-maintenance_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_logs' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveMaintenanceLog(log: MaintenanceLog) {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .upsert([log], { onConflict: 'id' });
    return { data, error };
  }

  return { maintenanceLogs, loading, saveMaintenanceLog };
}