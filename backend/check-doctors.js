require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
s.from('doctors').select('id,name,specialization').then(({ data }) => {
    console.log('Doctors in DB:');
    data.forEach(d => console.log(`  - ${d.name} | ${d.specialization}`));
});
