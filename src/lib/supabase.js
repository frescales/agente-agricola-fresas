import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

// Funciones específicas para el dominio agrícola
export const supabaseQueries = {
  // Obtener tareas de un usuario
  async getUserTasks(supabase, userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obtener tareas por fecha
  async getTasksByDate(supabase, startDate, endDate, userId = null) {
    let query = supabase
      .from('tasks')
      .select('*, users(name)')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate);
    
    if (userId) {
      query = query.eq('assigned_to', userId);
    }
    
    const { data, error } = await query.order('scheduled_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Actualizar estado de tarea
  async updateTaskStatus(supabase, taskId, status) {
    const updates = { status };
    if (status === 'completada') {
      updates.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Obtener producción reciente
  async getRecentProduction(supabase, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('production')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener insumos (con o sin costos según el rol)
  async getSupplies(supabase, includesCosts = false) {
    const columns = includesCosts 
      ? '*' 
      : 'id, name, category, quantity, unit, purchase_date, notes';
    
    const { data, error } = await supabase
      .from('supplies')
      .select(columns)
      .order('purchase_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Obtener información de usuario
  async getUserByEmail(supabase, email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};