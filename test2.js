const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('auditorias').select('id, explicit_objections, hidden_objections, positive_signals').order('created_at', { ascending: false }).limit(1);
  if (error) console.error(error);
  console.log(JSON.stringify(data[0], null, 2));
}
run();
