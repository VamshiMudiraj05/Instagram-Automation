import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
  const { count: convCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true });
  const { count: rulesCount } = await supabase.from('automations').select('*', { count: 'exact', head: true }).eq('is_active', true);

  console.log({
    messagesSent: msgCount,
    audienceReached: convCount,
    activeRules: rulesCount
  });

  const { data: latestMsgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Latest 5 messages:");
  for (const m of latestMsgs || []) {
    console.log(m.created_at, m.content);
  }
}
check();
