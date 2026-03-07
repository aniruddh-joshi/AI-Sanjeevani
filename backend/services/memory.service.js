const { supabase } = require('./supabase.service');

const saveMessage = async (patientId, role, message) => {
    try {
        const { error } = await supabase
            .from('conversations')
            .insert([{
                patient_id: patientId,
                role,
                message,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
    } catch (err) {
        console.error('Failed to save message to memory:', err.message);
    }
};

const getConversationContext = async (patientId, limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('conversations')
            .select('role, message')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Return in chronological order
        return data.reverse().map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.message }]
        }));
    } catch (err) {
        console.error('Failed to fetch conversation context:', err.message);
        return [];
    }
};

const clearMemory = async (patientId) => {
    try {
        await supabase
            .from('conversations')
            .delete()
            .eq('patient_id', patientId);
    } catch (err) {
        console.error('Failed to clear memory:', err.message);
    }
};

module.exports = {
    saveMessage,
    getConversationContext,
    clearMemory
};
