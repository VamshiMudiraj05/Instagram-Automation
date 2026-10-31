const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAutomations() {
  const { data: automations, error } = await supabase.from('automations').select('*');
  console.log('Automations error:', error);
  console.log('Automations:', automations);

  const { data: messages } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Recent messages:', messages);
}
checkAutomations();

