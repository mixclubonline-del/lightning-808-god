import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeOfDay, deity } = await req.json();

    // Create a context-aware prompt
    const timeContext = timeOfDay === 'morning' 
      ? 'The dawn brings new creative energy...'
      : timeOfDay === 'evening'
      ? 'The twilight hours favor deep sonic exploration...'
      : timeOfDay === 'night'
      ? 'The midnight realm unlocks hidden frequencies...'
      : 'The eternal moment of creation awaits...';

    const deityPersonalities: Record<string, string> = {
      zeus: 'You are Zeus, king of the gods. Speak with thunderous authority and power. Reference lightning, storms, and supreme command.',
      apollo: 'You are Apollo, god of music and light. Speak with artistic elegance and melodic wisdom. Reference harmony, golden light, and the muses.',
      vulcan: 'You are Vulcan, god of the forge. Speak with craftsman precision and fiery determination. Reference metalwork, fire, and creation through labor.',
      pandora: 'You are Pandora, keeper of mysteries. Speak with curious wonder and hidden knowledge. Reference secrets, discovery, and the unknown.',
      oracle: 'You are the Oracle of Delphi. Speak in prophetic riddles and mystical visions. Reference fate, prophecy, and cosmic patterns.',
      hermes: 'You are Hermes, messenger of the gods. Speak with swift wit and playful wisdom. Reference speed, communication, and divine messages.',
    };

    const selectedDeity = deity || ['zeus', 'apollo', 'oracle'][Math.floor(Math.random() * 3)];
    const personality = deityPersonalities[selectedDeity] || deityPersonalities.zeus;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'VST God Opening Prophecy',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `${personality}
            
You are welcoming a mortal to VST GOD, a divine synthesizer from Mount Olympus. Generate a dramatic, mythological welcome greeting and prophecy about their music creation session.

${timeContext}

Keep your response to exactly 2 sentences:
1. A dramatic welcome/greeting (reference Olympus, divine powers, or mythological imagery)
2. A prophetic statement about their creative session (mysterious but inspiring)

Be theatrical, use mythological language, and make them feel they're entering a sacred realm. No modern slang. Maximum 40 words total.`
          },
          {
            role: 'user',
            content: 'Generate a welcome prophecy for the mortal entering VST GOD.'
          }
        ],
        max_tokens: 100,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const prophecy = data.choices[0]?.message?.content || 
      "The gates of Olympus open before you, mortal. Great sounds await in the divine forge.";

    console.log('Generated prophecy:', prophecy, 'for deity:', selectedDeity);

    return new Response(
      JSON.stringify({ 
        prophecy, 
        deity: selectedDeity,
        timeOfDay 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error generating prophecy:', error);
    
    // Fallback prophecies if AI fails
    const fallbackProphecies = [
      "The thunder of Olympus echoes in welcome! Your sonic destiny unfolds in the divine frequencies.",
      "Mount Olympus opens its gates to you, mortal. The muses whisper of greatness in your session.",
      "By the power of the gods, you are summoned! Let the divine harmonics guide your creation.",
    ];
    
    return new Response(
      JSON.stringify({ 
        prophecy: fallbackProphecies[Math.floor(Math.random() * fallbackProphecies.length)],
        deity: 'zeus',
        fallback: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
