import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkFollow() {
  const { data: user } = await supabase.from('users').select('*').single();
  const token = user.access_token;

  // Let's test with a real commenter senderId from webhook
  // e.g. from hei_senberg6969 or _junnu__1526
  const { data: events } = await supabase
    .from('webhook_events')
    .select('*')
    .order('processed_at', { ascending: false })
    .limit(5);

  for (const e of events || []) {
    const entry = e.data?.entry?.[0];
    const change = entry?.changes?.[0];
    if (change?.value?.from?.id) {
      const senderId = change.value.from.id;
      const username = change.value.from.username;
      
      const url = `https://graph.instagram.com/v21.0/${senderId}?fields=is_user_follow_business&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();
      console.log(`Checking @${username} (${senderId}) on graph.instagram.com:`, res.status, data);

      const urlFb = `https://graph.facebook.com/v24.0/${senderId}?fields=is_user_follow_business&access_token=${token}`;
      const resFb = await fetch(urlFb);
      const dataFb = await resFb.json();
      console.log(`Checking @${username} (${senderId}) on graph.facebook.com:`, resFb.status, dataFb);
      break;
    }
  }
}
checkFollow();
