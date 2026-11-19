import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRecentEvents() {
  const { data: events, error } = await supabase
    .from('webhook_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error querying webhook_events:", error);
    return;
  }
  console.log("Count:", events?.length);
  if (events && events.length > 0) {
    console.log("Keys:", Object.keys(events[0]));
    console.log("Sample:", JSON.stringify(events[0], null, 2));
  }
}
checkRecentEvents().catch(console.error);
