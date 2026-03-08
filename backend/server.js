const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const { setupSecurity } = require('./middleware/security');
const { supabase } = require('./services/supabase.service');
const { bot, handleUpdate, setupWebhook } = require('./services/telegram.service');
const { logEvent } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Initialize Security (Helmet, CORS, Rate Limit)
setupSecurity(app);

// Middleware
app.use(bodyParser.json());

// --- API Routes for Admin Dashboard ---

// Health Check
app.get('/health', (req, res) => res.json({ status: 'Sanjeevani AI Backend v2.0 is operational' }));

// 1. Get Analytics Overview
app.get('/api/analytics', async (req, res) => {
    try {
        const { count: patientsCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
        const { count: appointmentsCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'booked');
        const { data: todayApps } = await supabase.from('appointments').select('*').eq('appointment_date', new Date().toISOString().split('T')[0]);

        res.json({
            totalPatients: patientsCount || 0,
            totalAppointments: appointmentsCount || 0,
            todayAppointments: todayApps?.length || 0,
            pendingApprovals: pendingCount || 0,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get All Appointments (with Patient & Doctor Details)
app.get('/api/appointments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
        *,
        patient:patients(name, email, phone),
        doctor:doctors(name, specialization)
      `)
            .order('appointment_date', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Update Appointment Status
app.patch('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const { status, appointment_date, appointment_time } = req.body;

    try {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status, appointment_date, appointment_time })
            .or(`id.eq.${id},unique_id.eq.${id}`)
            .select()
            .single();

        if (error) throw error;

        await logEvent('appointment_updated', `Appointment ${data.unique_id} updated to status ${status}`, data.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. System Logs Route
app.get('/api/logs', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('system_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Get All Patients
app.get('/api/patients', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select(`*, appointments(count)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5b. Add New Patient
app.post('/api/patients', async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const { data, error } = await supabase
            .from('patients')
            .insert([{ name, phone: phone || null, email: email || null }])
            .select()
            .single();
        if (error) throw error;
        await logEvent('patient_created', `Patient ${name} added manually`, data.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Get All Doctors
app.get('/api/doctors', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .order('created_at', { ascending: true });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6b. Add New Doctor
app.post('/api/doctors', async (req, res) => {
    try {
        const { name, specialization, bio } = req.body;
        if (!name || !specialization) return res.status(400).json({ error: 'Name and specialization required' });
        const { data, error } = await supabase
            .from('doctors')
            .insert([{ name, specialization, bio: bio || null }])
            .select()
            .single();
        if (error) throw error;
        await logEvent('doctor_created', `Doctor ${name} added`, data.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6c. Delete Doctor
app.delete('/api/doctors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('doctors').delete().eq('id', id);
        if (error) throw error;
        await logEvent('doctor_deleted', `Doctor ${id} removed`);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NOTE: GET /api/appointments and PATCH /api/appointments/:id are defined above (lines 42 and 61)
// Duplicate definitions removed to prevent Express route shadowing

// 7. Public Appointment Lookup (by unique_id)
app.get('/api/appointment/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId.toUpperCase().trim();

        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patients(name),
                doctor:doctors(name, specialization)
            `)
            .eq('unique_id', uniqueId)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Appointment not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Chart Data — Upcoming Appointments (Next 7 days)
app.get('/api/chart-data', async (req, res) => {
    try {
        const days = [];
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const displayDate = d.getDate(); // e.g., 9
            const dayName = dayLabels[d.getDay()]; // e.g., Mon
            const label = i === 0 ? 'Today' : `${dayName} ${displayDate}`;

            const { count } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('appointment_date', dateStr)
                .not('status', 'eq', 'cancelled');

            days.push({ name: label, appointments: count || 0 });
        }

        res.json(days);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Bot Initialization (Set Webhook)
app.get('/api/init-bot', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];

    // Explicitly point to the Netlify Background Function for 15-minute timeout allowance
    const webhookUrl = `${protocol}://${host}/.netlify/functions/bot-background`;

    try {
        await setupWebhook(webhookUrl);
        res.json({ success: true, message: `Webhook set to ${webhookUrl}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server (Only if not in Netlify environment)
if (!process.env.NETLIFY) {
    const server = app.listen(PORT, '0.0.0.0', () => {
        const addr = server.address();
        console.log(`[SERVER] Sanjeevani AI v2.0 running on ${addr.address}:${addr.port}`);

        // Use polling only for local development
        bot.launch();
        console.log("Telegram Bot started in POLLING mode (Local Dev)");
    });
}

// Export for Netlify Functions
module.exports = app;
