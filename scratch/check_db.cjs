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

async function check() {
  console.log('--- Testing Supabase Database State ---');
  
  // 1. Check grains
  const { data: grains, error: grainsErr } = await supabase.from('grains').select('*').limit(1);
  console.log('Grains table query:', grainsErr ? 'ERROR: ' + grainsErr.message : 'OK, rows: ' + (grains ? grains.length : 0));
  if (grains && grains.length > 0) {
    console.log('Grains columns found:', Object.keys(grains[0]));
  }

  // 2. Check bills
  const { data: bills, error: billsErr } = await supabase.from('bills').select('*').limit(1);
  console.log('Bills table query:', billsErr ? 'ERROR: ' + billsErr.message : 'OK, rows: ' + (bills ? bills.length : 0));

  // 3. Check stock_movements
  const { data: movs, error: movsErr } = await supabase.from('stock_movements').select('*').limit(1);
  console.log('Stock Movements table query:', movsErr ? 'ERROR: ' + movsErr.message : 'OK, rows: ' + (movs ? movs.length : 0));

  // 4. Check RPC create_incoming_bill
  const { data: rpcIn, error: rpcInErr } = await supabase.rpc('create_incoming_bill', {
    p_party_name: 'test',
    p_phone: '123',
    p_grain_id: '00000000-0000-0000-0000-000000000000',
    p_quantity_kg: 10,
    p_price_per_kg: 100
  });
  console.log('create_incoming_bill RPC call:', rpcInErr ? 'ERROR: ' + rpcInErr.message + ' (code: ' + rpcInErr.code + ')' : 'OK: ' + JSON.stringify(rpcIn));

  // 5. Check RPC create_outgoing_bill
  const { data: rpcOut, error: rpcOutErr } = await supabase.rpc('create_outgoing_bill', {
    p_party_name: 'test',
    p_phone: '123',
    p_grain_id: '00000000-0000-0000-0000-000000000000',
    p_quantity_kg: 10,
    p_price_per_kg: 100
  });
  console.log('create_outgoing_bill RPC call:', rpcOutErr ? 'ERROR: ' + rpcOutErr.message + ' (code: ' + rpcOutErr.code + ')' : 'OK: ' + JSON.stringify(rpcOut));
}

check().catch(console.error);
