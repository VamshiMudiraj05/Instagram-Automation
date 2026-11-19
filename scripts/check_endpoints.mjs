import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkEndpoints() {
  const { data: user } = await supabase.from('users').select('*').single();
  const token = user.access_token;

  const endpoints = [
    "https://graph.facebook.com/v24.0/17841479501766910/messages",
    "https://graph.facebook.com/v24.0/me/messages",
    "https://graph.instagram.com/v24.0/me/messages"
  ];

  for (const ep of endpoints) {
    const res = await fetch(`${ep}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: { id: "12345" }, message: { text: "test" } })
    });
    const json = await res.json();
    console.log(`Endpoint: ${ep} => ${res.status}`, json.error?.message || json);
  }
}
checkEndpoints();
