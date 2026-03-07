require('dotenv').config();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function setBotMeta() {
    const base = `https://api.telegram.org/bot${BOT_TOKEN}`;

    // Full description (shown in bot profile page)
    await fetch(`${base}/setMyDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            description:
                `🌿 Sanjeevani AI — Aapka Digital Health Assistant 🏥\n\n` +
                `Doctor appointments book karo — bina queue ke, bina phone ke! Sirf ek simple chat mein. ⚡\n\n` +
                `🩺 Specialist doctor choose karo\n` +
                `📅 Available date & time pick karo\n` +
                `✅ Instant confirmation + Appointment ID pao\n` +
                `❌ Cancel/Reschedule bhi yahan se\n\n` +
                `💻 Designed & Developed by Aniruddh Joshi 🚀`
        })
    }).then(r => r.json()).then(r => console.log('Description set:', r.ok));

    // Short description (shown before starting the bot — "Start" screen)
    await fetch(`${base}/setMyShortDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            short_description:
                `AI-powered clinic receptionist. Book appointments with doctors instantly. Built by Aniruddh Joshi.`
        })
    }).then(r => r.json()).then(r => console.log('Short description set:', r.ok));

    console.log('\n✅ Bot meta updated! Changes may take a few minutes to reflect on Telegram.');
}

setBotMeta();
