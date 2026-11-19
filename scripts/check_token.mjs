import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMe() {
  const { data: user } = await supabase.from('users').select('*').single();
  const token = user.access_token;
  
  const res = await fetch(`https://graph.facebook.com/v24.0/me?fields=id,name,accounts&access_token=${token}`);
  console.log("me:", await res.json());

  const resIG = await fetch(`https://graph.facebook.com/v24.0/17841479501766910?fields=id,username,name&access_token=${token}`);
  console.log("IG account:", await resIG.json());
}
checkMe();
