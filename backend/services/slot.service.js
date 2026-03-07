const { supabase } = require('./supabase.service');

const getAvailableSlots = async (doctorId, date) => {
    // 1. Get day of week (0=Sunday, 6=Saturday)
    const dayOfWeek = new Date(date).getDay();

    // 2. Fetch doctor availability for that day
    const { data: availability, error: availError } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .single();

    if (availError || !availability) {
        return [];
    }

    const { start_time, end_time, slot_duration } = availability;

    // 3. Generate all possible slots
    const slots = [];
    let current = new Date(`${date}T${start_time}`);
    const end = new Date(`${date}T${end_time}`);

    while (current < end) {
        slots.push(current.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }));
        current = new Date(current.getTime() + slot_duration * 60000);
    }

    // 4. Fetch already booked appointments
    const { data: booked, error: bookedError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .not('status', 'eq', 'cancelled');

    if (bookedError) throw bookedError;

    // 5. Filter out booked slots
    const bookedTimes = booked.map(b => {
        // Normalize booked time format to match generated slots
        const [h, m] = b.appointment_time.split(':');
        return new Date(`${date}T${h}:${m}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    });

    return slots.filter(slot => !bookedTimes.includes(slot));
};

module.exports = { getAvailableSlots };
