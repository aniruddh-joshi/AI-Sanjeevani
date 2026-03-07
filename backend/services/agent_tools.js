const { supabase } = require('./supabase.service');
const { getAvailableSlots } = require('./slot.service');
const { generateUniqueId } = require('../utils/appointment.utils');
const { logEvent } = require('../utils/logger');
const { sendAdminNotification } = require('./notification.service');

const checkDoctorAvailability = async ({ doctorId, date }) => {
    try {
        const slots = await getAvailableSlots(doctorId, date);
        return { success: true, slots };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const createAppointment = async ({ patientId, doctorId, date, time, symptoms }) => {
    try {
        const uniqueId = await generateUniqueId();
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                unique_id: uniqueId,
                patient_id: patientId,
                doctor_id: doctorId,
                appointment_date: date,
                appointment_time: time,
                symptoms,
                status: 'booked'
            }])
            .select(`
                *,
                doctor:doctors(name, specialization),
                patient:patients(name)
            `)
            .single();

        if (error) throw error;

        await logEvent('appointment_created', `Appointment ${uniqueId} created for ${data.patient.name}`, data.id);

        await sendAdminNotification('NEW_APPOINTMENT', {
            id: uniqueId,
            patient_name: data.patient.name,
            doctor_name: data.doctor.name,
            specialty: data.doctor.specialization,
            date,
            time
        });

        return { success: true, appointment: data };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const cancelAppointment = async ({ appointmentId }) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .or(`id.eq.${appointmentId},unique_id.eq.${appointmentId}`)
            .select()
            .single();

        if (error) throw error;

        await logEvent('appointment_cancelled', `Appointment ${data.unique_id} cancelled`, data.id);
        return { success: true, message: 'Appointment cancelled successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const getPatientHistory = async ({ patientId }) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*, doctor:doctors(name, specialization)')
            .eq('patient_id', patientId)
            .order('appointment_date', { ascending: false });

        if (error) throw error;
        return { success: true, history: data };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const getDoctorBySpecialization = async ({ specialty }) => {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .ilike('specialization', `%${specialty}%`);

        if (error) throw error;
        return { success: true, doctors: data };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = {
    checkDoctorAvailability,
    createAppointment,
    cancelAppointment,
    getPatientHistory,
    getDoctorBySpecialization
};
