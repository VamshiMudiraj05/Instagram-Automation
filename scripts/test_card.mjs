import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCard() {
  const { data: user } = await supabase.from('users').select('*').single();
  const token = user.access_token;
  const isFb = token.startsWith("EAA");
  const baseGraph = isFb ? "https://graph.facebook.com/v24.0" : "https://graph.instagram.com/v24.0";
  const path = isFb ? "17841479501766910/messages" : "me/messages";

  console.log("Testing generic template payload on Meta Graph API with invalid/dummy comment_id to see validation response...");

  const body = {
    recipient: { comment_id: "123456789" },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Job Links",
              subtitle: "Click below",
              buttons: [
                {
                  type: "web_url",
                  url: "https://vamshi.is-a.dev/?view=jobs",
                  title: "🔗 View Job Links"
                }
              ]
            }
          ]
        }
      }
    }
  };

  const res = await fetch(`${baseGraph}/${path}?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  console.log("Response:", JSON.stringify(json, null, 2));
}

testCard().catch(console.error);
