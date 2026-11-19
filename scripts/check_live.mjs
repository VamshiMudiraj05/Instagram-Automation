import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: users, error } = await supabase.from('users').select('id, username, updated_at, access_token');
  console.log('USERS:', users?.map(u => ({ id: u.id, username: u.username, updated_at: u.updated_at, hasToken: !!u.access_token })));

  const { data: automations } = await supabase.from('automation_rules').select('id, trigger_type, media_id, action_type, dm_message, is_active');
  console.log('AUTOMATIONS:', automations);

  const { data: events } = await supabase
    .from('webhook_events')
    .select('id, event_type, created_at, payload')
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log('LATEST 5 WEBHOOK EVENTS:');
  for (const ev of events || []) {
    console.log(ev.created_at, ev.event_type, JSON.stringify(ev.payload).slice(0, 150));
  }
}
check().catch(console.error);
