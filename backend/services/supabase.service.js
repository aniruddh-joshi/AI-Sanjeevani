const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend operations

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Database operations will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  supabase,
  
  // Helper methods
  getDoctors: async () => {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error) throw error;
    return data;
  },

  getDoctorBySpecialty: async (specialty) => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .ilike('specialization', `%${specialty}%`);
    if (error) throw error;
    return data;
  },

  findOrCreatePatient: async (telegramId, name) => {
    // Check if patient exists
    const { data: existing, error: findError } = await supabase
      .from('patients')
      .select('*')
      .eq('telegram_id', telegramId.toString())
      .single();

    if (existing) return existing;

    // Create new patient
    const { data: created, error: createError } = await supabase
      .from('patients')
      .insert([{ telegram_id: telegramId.toString(), name }])
      .select()
      .single();

    if (createError) throw createError;
    return created;
  },

  checkAvailability: async (doctorId, date) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .not('status', 'eq', 'cancelled');
    
    if (error) throw error;
    return data;
  },

  createAppointment: async (appointmentData) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
