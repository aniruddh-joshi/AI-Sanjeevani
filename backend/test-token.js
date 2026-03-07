const https = require('https');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const url = `https://api.telegram.org/bot${token}/getMe`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const json = JSON.parse(data);
        console.log('Telegram API Response:', json);
        if (json.ok) {
            console.log('Token is VALID for bot:', json.result.username);
        } else {
            console.log('Token is INVALID. Error:', json.description);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching Telegram API:', err);
});
