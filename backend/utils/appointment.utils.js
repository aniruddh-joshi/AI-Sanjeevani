const { supabase } = require('../services/supabase.service');

const generateUniqueId = async () => {
    const year = new Date().getFullYear();
    const { data: lastApp, error } = await supabase
        .from('appointments')
        .select('unique_id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    let nextNumber = 1;
    if (lastApp && lastApp.unique_id) {
        const parts = lastApp.unique_id.split('-');
        if (parts.length === 3 && parseInt(parts[1]) === year) {
            nextNumber = parseInt(parts[2]) + 1;
        }
    }

    const paddedNumber = nextNumber.toString().padStart(4, '0');
    return `SJV-${year}-${paddedNumber}`;
};

module.exports = { generateUniqueId };
