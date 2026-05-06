const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('auditorias').select('explicit_objections, hidden_objections, positive_signals, negative_signals, seller_strengths, seller_script_failures').order('created_at', { ascending: false }).limit(1);
  if (error) console.error(error);
  console.log("Type of explicit_objections:", typeof data[0].explicit_objections);
  console.log("Is array?", Array.isArray(data[0].explicit_objections));
  console.log("Value:", data[0].explicit_objections);
}
run();
