import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateAutomation() {
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('specific_media_id', '17911590093593108');

  console.log("Current for reel 17911590093593108:", automations);

  for (const a of automations || []) {
    const content = typeof a.response_content === 'string' ? JSON.parse(a.response_content) : a.response_content;
    content.message = "Job links are ready! Tap the button below to view and apply:";
    if (content.card) {
      content.card.title = "Job Links & Verified Openings";
      content.card.subtitle = "Tap below to view and apply directly:";
    }
    // Also disable check_follow on this rule if verifyFollowStatus fails on FB Page Token, 
    // OR ensure fail-open delivers the button card smoothly!
    content.check_follow = false; // Send directly so people get the link immediately!

    const { error } = await supabase
      .from('automations')
      .update({ response_content: content })
      .eq('id', a.id);
    
    console.log(`Updated ${a.id}:`, error || "SUCCESS");
  }
}
updateAutomation().catch(console.error);
