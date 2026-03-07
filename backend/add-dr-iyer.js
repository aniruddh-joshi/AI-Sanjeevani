require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addDoctor() {
    const { data, error } = await s
        .from('doctors')
        .insert([{ name: 'Dr. Iyer', specialization: 'Pediatrician' }])
        .select()
        .single();

    if (error) {
        console.error('Error inserting Dr. Iyer:', error.message);
    } else {
        console.log('✅ Dr. Iyer added successfully!', data);
    }
}

addDoctor();
