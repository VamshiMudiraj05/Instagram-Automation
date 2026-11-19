import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: automations } = await supabase.from('automations').select('*');
  console.log('ACTIVE AUTOMATIONS:');
  for (const a of automations || []) {
    console.log(`- ID: ${a.id}, Media: ${a.specific_media_id}, Trigger: ${a.trigger_type} (${a.trigger_value}), Active: ${a.is_active}`);
    console.log('  Content:', JSON.stringify(a.response_content).slice(0, 200));
  }

  // Look at recent messages
  const { data: msgs } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  console.log('\nLATEST 10 MESSAGES IN DB:');
  for (const m of msgs || []) {
    console.log(`- ${m.created_at}: to ${m.conversation_id}: ${m.content?.slice(0, 80)}`);
  }
}
check().catch(console.error);
