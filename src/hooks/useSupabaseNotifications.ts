import { useEffect, useState } from 'react';
import { Notification } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchNotifications() {
      setLoading(true);
      let query = supabase.from('notifications').select('*');
      if (userId) query = query.eq('recipient_id', userId);
      const { data, error } = await query;
      if (!error && data && !ignore) setNotifications(data as Notification[]);
      setLoading(false);
    }
    fetchNotifications();

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function addNotification(notification: Notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification]);
    return { data, error };
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    return { error };
  }

  return { notifications, loading, addNotification, markAsRead };
}