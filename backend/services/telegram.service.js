const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const gemini = require('./gemini.service');
const db = require('./supabase.service');
const { supabase } = require('./supabase.service');
const memory = require('./memory.service');
const { logEvent } = require('../utils/logger');
const { generateUniqueId } = require('../utils/appointment.utils');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ==================== STATE MACHINE ====================
// Stores conversation state per user
const userState = {};

const setState = (userId, state) => { userState[userId] = { ...userState[userId], ...state }; };
const getState = (userId) => userState[userId] || { step: 'idle' };
const clearState = (userId) => { userState[userId] = { step: 'idle' }; };

// ==================== HELPERS ====================
const mainMenuKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📅 Book Appointment', 'book'), Markup.button.callback('📋 My Appointments', 'myapps')],
    [Markup.button.callback('❌ Cancel Appointment', 'cancel'), Markup.button.callback('👨‍⚕️ Find Doctor', 'finddoctor')],
    [Markup.button.callback('🆘 Emergency', 'emergency')]
]);

// Generate next 7 selectable weekdays as buttons (2 per row)
function getNextDatesKeyboard() {
    const buttons = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const label = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
        dates.push([label, dateStr]);
    }

    // 2 buttons per row
    for (let i = 0; i < dates.length; i += 2) {
        const row = [Markup.button.callback(dates[i][0], `date_${dates[i][1]}`)];
        if (dates[i + 1]) row.push(Markup.button.callback(dates[i + 1][0], `date_${dates[i + 1][1]}`));
        buttons.push(row);
    }
    buttons.push([Markup.button.callback('🔙 Back to Menu', 'mainmenu')]);
    return Markup.inlineKeyboard(buttons);
}

// Generate time slot buttons from list of available slots (2 per row)
function getTimeSlotsKeyboard(slots) {
    const buttons = [];
    for (let i = 0; i < slots.length; i += 2) {
        const row = [Markup.button.callback(`🕐 ${slots[i].label}`, `slot_${slots[i].value}`)];
        if (slots[i + 1]) row.push(Markup.button.callback(`🕐 ${slots[i + 1].label}`, `slot_${slots[i + 1].value}`));
        buttons.push(row);
    }
    buttons.push([Markup.button.callback('🔙 Change Date', 'backtodate'), Markup.button.callback('🏠 Menu', 'mainmenu')]);
    return Markup.inlineKeyboard(buttons);
}

// Generate doctor buttons (2 per row)
async function getDoctorKeyboard(specialty = null) {
    let doctors;
    if (specialty) {
        doctors = await db.getDoctorBySpecialty(specialty);
    } else {
        doctors = await db.getDoctors();
    }

    const buttons = [];
    for (let i = 0; i < doctors.length; i += 2) {
        const row = [Markup.button.callback(`👨‍⚕️ ${doctors[i].name}`, `doc_${doctors[i].id}`)];
        if (doctors[i + 1]) row.push(Markup.button.callback(`👨‍⚕️ ${doctors[i + 1].name}`, `doc_${doctors[i + 1].id}`));
        buttons.push(row);
    }
    buttons.push([Markup.button.callback('🔙 Back to Menu', 'mainmenu')]);
    return { keyboard: Markup.inlineKeyboard(buttons), doctors };
}

// 6 fixed clean time slots as requested by admin
async function getAvailableSlots(doctorId, date) {
    const allSlots = [
        { label: '10:00', value: '10:00' },
        { label: '11:30', value: '11:30' },
        { label: '1:00', value: '13:00' },
        { label: '3:00', value: '15:00' },
        { label: '4:30', value: '16:30' },
        { label: '6:00', value: '18:00' },
    ];

    const booked = await db.checkAvailability(doctorId, date);
    const bookedTimes = booked.map(b => b.appointment_time.substring(0, 5));

    return allSlots.filter(s => !bookedTimes.includes(s.value));
}

// ==================== BOT COMMANDS ====================

bot.start(async (ctx) => {
    clearState(ctx.from.id);
    const name = ctx.from.first_name || 'Patient';
    await ctx.reply(
        `Namaste *${name}!* 🙏 Welcome to *Sanjeevani AI* — Aapka Digital Health Assistant!\n\n` +
        `Main aapki madad kar sakta hoon:\n` +
        `• Doctor appointment book karne mein 📅\n` +
        `• Sahi doctor dhoondne mein 👨‍⚕️\n` +
        `• Appointments cancel/reschedule karne mein ❌\n\n` +
        `Please select an option below to get started:`,
        { parse_mode: 'Markdown', ...mainMenuKeyboard }
    );
});

// ==================== CALLBACK HANDLERS ====================

bot.action('mainmenu', async (ctx) => {
    clearState(ctx.from.id);
    await ctx.answerCbQuery();
    await ctx.reply('Main menu par wapas aaye! 😊 Kya karna chahenge?', mainMenuKeyboard);
});

bot.action('book', async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from.id, { step: 'selecting_doctor' });

    const { keyboard, doctors } = await getDoctorKeyboard();
    setState(ctx.from.id, { step: 'selecting_doctor', doctorsList: doctors });

    await ctx.reply(
        '👨‍⚕️ *Kaunse Doctor se milna chahenge?*\n\nNiche se doctor choose karein:',
        { parse_mode: 'Markdown', ...keyboard }
    );
});

bot.action('finddoctor', async (ctx) => {
    await ctx.answerCbQuery();
    const { keyboard, doctors } = await getDoctorKeyboard();

    let docList = '*Hamare Available Doctors:*\n\n';
    const emojiMap = {
        'Dentist': '🦷',
        'Cardiologist': '❤️',
        'General Physician': '🩺',
        'Pediatrician': '👶',
    };
    for (const doc of doctors) {
        const emoji = emojiMap[doc.specialization] || '🏥';
        docList += `${emoji} *${doc.name}* — ${doc.specialization}\n`;
    }
    docList += '\nKisi se appointment book karni ho toh niche click karein:';

    setState(ctx.from.id, { step: 'selecting_doctor' });
    await ctx.reply(docList, { parse_mode: 'Markdown', ...keyboard });
});

// Doctor selected → show dates
bot.action(/^doc_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const doctorId = ctx.match[1];

    // Fetch doctor name
    const { data: doctor } = await supabase.from('doctors').select('*').eq('id', doctorId).single();
    setState(ctx.from.id, { step: 'selecting_date', doctorId, doctorName: doctor?.name || 'Doctor' });

    await ctx.reply(
        `✅ *${doctor?.name}* select kar liya!\n\n📅 *Kaunsi date aapko suit karti hai?*\nNiche available dates mein se choose karein:`,
        { parse_mode: 'Markdown', ...getNextDatesKeyboard() }
    );
});

bot.action('backtodate', async (ctx) => {
    await ctx.answerCbQuery();
    const state = getState(ctx.from.id);
    await ctx.reply(
        `📅 *Kaunsi date choose karenge?*`,
        { parse_mode: 'Markdown', ...getNextDatesKeyboard() }
    );
});

// Date selected → show time slots
bot.action(/^date_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const date = ctx.match[1];
    const state = getState(ctx.from.id);

    if (!state.doctorId) {
        await ctx.reply('Pehle doctor select karein! 😊', mainMenuKeyboard);
        return;
    }

    setState(ctx.from.id, { step: 'selecting_slot', selectedDate: date });

    const slots = await getAvailableSlots(state.doctorId, date);

    if (slots.length === 0) {
        await ctx.reply(
            `😔 *${date}* ko *${state.doctorName}* ke paas koi available slot nahi hai.\n\nKoi aur date try karein:`,
            { parse_mode: 'Markdown', ...getNextDatesKeyboard() }
        );
        return;
    }

    const [year, month, day] = date.split('-');
    const displayDate = `${day}/${month}/${year}`;

    await ctx.reply(
        `📅 *${displayDate}* — *${state.doctorName}*\n\n🕐 *Available Time Slots:*\nNiche se apna slot choose karein:`,
        { parse_mode: 'Markdown', ...getTimeSlotsKeyboard(slots) }
    );
});

// Time slot selected → Book appointment
bot.action(/^slot_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery('Booking...');
    const time = ctx.match[1];
    const state = getState(ctx.from.id);
    const telegramId = ctx.from.id;
    const name = ctx.from.first_name;

    if (!state.doctorId || !state.selectedDate) {
        await ctx.reply('Kuch gadbad ho gayi! Phir se try karein.', mainMenuKeyboard);
        return;
    }

    try {
        await ctx.reply('⏳ Aapka appointment book ho raha hai...');

        const patient = await db.findOrCreatePatient(telegramId.toString(), name);
        const uniqueId = await generateUniqueId();

        const appointment = await db.createAppointment({
            unique_id: uniqueId,
            patient_id: patient.id,
            doctor_id: state.doctorId,
            appointment_date: state.selectedDate,
            appointment_time: time + ':00',
            status: 'booked',
            symptoms: state.symptoms || null
        });

        await logEvent('appointment_created', `Appointment ${uniqueId} booked`, appointment.id);

        // Send email notification to admin
        try {
            const { sendAdminNotification } = require('./notification.service');
            await sendAdminNotification('NEW_APPOINTMENT', {
                id: uniqueId,
                patient_name: name,
                doctor_name: state.doctorName,
                specialty: '',
                date: state.selectedDate,
                time
            });
        } catch (mailErr) {
            console.warn('Email notification failed (non-blocking):', mailErr.message);
        }

        const [year, month, day] = state.selectedDate.split('-');
        const displayDate = `${day}/${month}/${year}`;

        clearState(telegramId);

        await ctx.reply(
            `🎉 *Appointment Confirmed!*\n\n` +
            `━━━━━━━━━━━━━━━━━\n` +
            `🏥 *Doctor:* ${state.doctorName}\n` +
            `📅 *Date:* ${displayDate}\n` +
            `⏰ *Time:* ${time}\n` +
            `🆔 *Appointment ID:* \`${uniqueId}\`\n` +
            `━━━━━━━━━━━━━━━━━\n\n` +
            `Appointment ID yaad rakhein, isko cancel ya reschedule ke liye use hota hai! 📝\n\n` +
            `Kuch aur madad chahiye?`,
            { parse_mode: 'Markdown', ...mainMenuKeyboard }
        );

    } catch (error) {
        console.error('Booking error:', error);
        await ctx.reply('Booking mein kuch gadbad hui 😔 Please phir se try karein!', mainMenuKeyboard);
    }
});

// My Appointments
bot.action('myapps', async (ctx) => {
    await ctx.answerCbQuery();
    const telegramId = ctx.from.id;
    const name = ctx.from.first_name;

    try {
        const patient = await db.findOrCreatePatient(telegramId.toString(), name);
        const { data: appointments } = await supabase
            .from('appointments')
            .select('*, doctor:doctors(name, specialization)')
            .eq('patient_id', patient.id)
            .eq('status', 'booked')
            .order('appointment_date', { ascending: true })
            .limit(5);

        if (!appointments || appointments.length === 0) {
            await ctx.reply(
                '📋 Aapki koi upcoming appointment nahi hai.\n\nKya aap ek book karna chahenge?',
                mainMenuKeyboard
            );
            return;
        }

        let msg = '*📋 Aapki Upcoming Appointments:*\n\n';
        for (const app of appointments) {
            const [year, month, day] = app.appointment_date.split('-');
            msg += `━━━━━━━━━━━━━━━\n`;
            msg += `🆔 \`${app.unique_id}\`\n`;
            msg += `👨‍⚕️ ${app.doctor?.name} (${app.doctor?.specialization})\n`;
            msg += `📅 ${day}/${month}/${year} ⏰ ${app.appointment_time?.substring(0, 5)}\n`;
        }

        await ctx.reply(msg, { parse_mode: 'Markdown', ...mainMenuKeyboard });

    } catch (error) {
        await ctx.reply('Appointments fetch karne mein error aaya! Please try again.', mainMenuKeyboard);
    }
});

// Cancel Appointment
bot.action('cancel', async (ctx) => {
    await ctx.answerCbQuery();
    setState(ctx.from.id, { step: 'cancelling' });
    await ctx.reply(
        '❌ *Appointment Cancel Karna Chahte Hain?*\n\nApna *Appointment ID* type karein\n(e.g., SJV-2026-0001)\n\nYa "My Appointments" mein dekh sakte hain apna ID.',
        { parse_mode: 'Markdown' }
    );
});

// Emergency
bot.action('emergency', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
        '🆘 *EMERGENCY HELP*\n\n' +
        '⚠️ Jaan-leva situation ke liye:\n\n' +
        '🚑 *Ambulance:* 108\n' +
        '🏥 *Emergency:* 112\n\n' +
        'Please turant najdeeki hospital jayein! 🙏\n\n' +
        '_Koi non-emergency health issue ho toh niche menu use karein:_',
        { parse_mode: 'Markdown', ...mainMenuKeyboard }
    );
});

// ==================== TEXT MESSAGE HANDLER ====================
bot.on('text', async (ctx) => {
    const userInput = ctx.message.text;
    const telegramId = ctx.from.id;
    const name = ctx.from.first_name;
    const state = getState(telegramId);

    await ctx.sendChatAction('typing');

    // Handle cancellation flow
    if (state.step === 'cancelling') {
        const appointmentId = userInput.trim().toUpperCase();
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .or(`unique_id.eq.${appointmentId}`)
                .select()
                .single();

            if (error || !data) {
                await ctx.reply('❌ Appointment ID nahi mila. Please check karein aur dobara try karein.', mainMenuKeyboard);
            } else {
                clearState(telegramId);

                // Fetch full appointment details for meaningful email
                const { data: fullApp } = await supabase
                    .from('appointments')
                    .select('*, doctor:doctors(name, specialization), patient:patients(name)')
                    .eq('unique_id', data.unique_id)
                    .single();

                // Send cancel email to admin
                try {
                    const { sendAdminNotification } = require('./notification.service');
                    await sendAdminNotification('CANCEL_APPOINTMENT', {
                        id: data.unique_id,
                        patient_name: fullApp?.patient?.name || name,
                        doctor_name: fullApp?.doctor?.name || 'N/A',
                        specialty: fullApp?.doctor?.specialization || '',
                        date: fullApp?.appointment_date || '',
                        time: fullApp?.appointment_time?.substring(0, 5) || ''
                    });
                } catch (mailErr) {
                    console.warn('Cancel email failed (non-blocking):', mailErr.message);
                }

                await ctx.reply(
                    `✅ *Appointment Cancel Ho Gaya!*\n\n🆔 \`${data.unique_id}\` cancel kar diya gaya hai.\n\nKuch aur madad chahiye?`,
                    { parse_mode: 'Markdown', ...mainMenuKeyboard }
                );
            }
        } catch (err) {
            await ctx.reply('Cancellation mein error aaya. Please try again!', mainMenuKeyboard);
        }
        return;
    }

    // General AI conversation
    try {
        const patient = await db.findOrCreatePatient(telegramId.toString(), name);
        const context = await memory.getConversationContext(patient.id);
        await memory.saveMessage(patient.id, 'user', userInput);

        const assistantReply = await gemini.runAgent(userInput, patient.id, context);
        await memory.saveMessage(patient.id, 'assistant', assistantReply);

        // Check if user is describing symptoms → trigger doctor selection
        const symptomWords = ['fever', 'bukhaar', 'dard', 'pain', 'cough', 'khasi', 'headache',
            'sir', 'tooth', 'daant', 'heart', 'dil', 'body', 'badan', 'chakkar'];
        const isSymptom = symptomWords.some(w => userInput.toLowerCase().includes(w));

        if (isSymptom) {
            setState(telegramId, { step: 'selecting_doctor', symptoms: userInput });
            const { keyboard } = await getDoctorKeyboard();
            await ctx.reply(assistantReply + '\n\n👨‍⚕️ Niche se apne liye doctor choose karein:', {
                parse_mode: 'Markdown',
                ...keyboard
            });
        } else {
            await ctx.reply(assistantReply, mainMenuKeyboard);
        }

    } catch (error) {
        console.error("Bot Error:", error);
        await ctx.reply(
            'Oops! Thodi technical problem aa gayi 😔\nPlease thodi der baad phir try karein.\n\n_Aap niche se koi option bhi choose kar sakte hain:_',
            { parse_mode: 'Markdown', ...mainMenuKeyboard }
        );
    }
});

const handleUpdate = async (update) => {
    try {
        await bot.handleUpdate(update);
    } catch (err) {
        console.error("Webhook Update Error:", err);
    }
};

const setupWebhook = async (url) => {
    try {
        await bot.telegram.setWebhook(url);
        console.log(`Telegram Webhook set to: ${url}`);
    } catch (err) {
        console.error("Failed to set Telegram Webhook:", err);
        throw err;
    }
};

module.exports = { bot, handleUpdate, setupWebhook };
