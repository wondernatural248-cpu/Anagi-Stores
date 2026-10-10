const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.substring(0, eqIdx).trim();
      const v = trimmed.substring(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[k] = v;
    }
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testFunctions() {
  const funcs = ['exec_sql', 'execute_sql', 'run_sql', 'sql', 'query', 'exec', 'execute', 'create_incoming_bill', 'create_outgoing_bill'];
  for (const f of funcs) {
    const { data, error } = await supabase.rpc(f, {});
    console.log(f, '->', error ? error.message : 'SUCCESS: ' + JSON.stringify(data));
  }
}

testFunctions().catch(console.error);
