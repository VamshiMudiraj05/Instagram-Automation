import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: user } = await supabase.from('users').select('*').single();
  console.log('User row:', {
    id: user.id,
    username: user.username,
    page_id: user.page_id,
    business_account_id: user.business_account_id,
    token_prefix: user.access_token?.slice(0, 15)
  });
}
check();
