import { useEffect, useState } from 'react';
import { Announcement } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseAnnouncements(locationId?: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchAnnouncements() {
      setLoading(true);
      let query = supabase.from('announcements').select('*');
      if (locationId) query = query.eq('location_id', locationId);
      const { data, error } = await query;
      if (!error && data && !ignore) setAnnouncements(data as Announcement[]);
      setLoading(false);
    }
    fetchAnnouncements();

    const channel = supabase
      .channel('realtime-announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [locationId]);

  async function addAnnouncement(announcement: Announcement) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement]);
    return { data, error };
  }

  async function markAnnouncementAsRead(id: string) {
    const { error } = await supabase
      .from('announcements')
      .update({ read: true })
      .eq('id', id);
    return { error };
  }

  return { announcements, loading, addAnnouncement, markAnnouncementAsRead };
}