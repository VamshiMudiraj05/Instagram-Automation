import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testComment() {
  const { data: user } = await supabase.from('users').select('*').single();
  const token = user.access_token;

  // Let's inspect comment 17925194994450400 on Meta Graph API
  const res = await fetch(`https://graph.facebook.com/v24.0/17925194994450400?fields=id,text,from,media&access_token=${token}`);
  console.log("Comment details:", await res.json());
}
testComment();
