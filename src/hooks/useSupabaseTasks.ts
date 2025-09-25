import { useEffect, useState } from 'react';
import { Task } from '../types';
import { supabase } from '../integrations/supabase/client';

export function useSupabaseTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchTasks() {
      setLoading(true);
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error && data && !ignore) setTasks(data as Task[]);
      setLoading(false);
    }
    fetchTasks();

    const channel = supabase
      .channel('realtime-tasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function saveTask(task: Task) {
    const { data, error } = await supabase
      .from('tasks')
      .upsert([task], { onConflict: 'id' });
    return { data, error };
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    return { error };
  }

  return { tasks, loading, saveTask, deleteTask };
}