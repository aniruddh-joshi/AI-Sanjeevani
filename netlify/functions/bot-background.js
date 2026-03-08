const { bot, handleUpdate } = require('../../backend/services/telegram.service');

// Netlify Background Functions must export a handler
exports.handler = async (event, context) => {
    try {
        // Parse the body
        const body = JSON.parse(event.body);

        // Let Telegraf process the update
        await handleUpdate(body);

        console.log("Background Webhook executed successfully!");
    } catch (error) {
        console.error("Background Webhook execution error:", error);
    }
};
