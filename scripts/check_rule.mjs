import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: automations } = await supabase.from('automations').select('*').eq('id', '862da5a6-f6d3-4ebb-8453-756d6bfc3a2e');
  console.log(JSON.stringify(automations[0], null, 2));
}
check();
