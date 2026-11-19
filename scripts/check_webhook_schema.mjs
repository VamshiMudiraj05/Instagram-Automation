import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: events, error } = await supabase
    .from('webhook_events')
    .select('*')
    .order('processed_at', { ascending: false })
    .limit(10);

  for (const e of events || []) {
    const entry = e.data?.entry?.[0];
    const change = entry?.changes?.[0];
    console.log(`${e.processed_at} | field: ${change?.field} | from: ${change?.value?.from?.username} | text: "${change?.value?.text}" | comment_id: ${change?.value?.id}`);
  }
}
check();
