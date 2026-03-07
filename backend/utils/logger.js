const { supabase } = require('../services/supabase.service');

const logEvent = async (eventType, description, relatedId = null, metadata = {}) => {
    try {
        const { error } = await supabase
            .from('system_logs')
            .insert([{
                event_type: eventType,
                description,
                related_id: relatedId,
                metadata,
                timestamp: new Date().toISOString()
            }]);

        if (error) throw error;
        console.log(`[LOG] ${eventType}: ${description}`);
    } catch (err) {
        console.error('Failed to write system log:', err.message);
    }
};

module.exports = { logEvent };
