import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map deities to unique ElevenLabs voices
const DEITY_VOICES: Record<string, string> = {
  zeus: 'onwK4e9ZLuTAKqWW03F9', // Daniel - deep, commanding
  apollo: 'pFZP5JQG7iQjIQuC4Bku', // Lily - melodic, warm
  vulcan: 'N2lVS1w4EtoT3dr4eOWO', // Callum - gruff, craftsman
  pandora: 'XrExE9yKIg1WjnnlVkGX', // Matilda - mysterious, whimsical
  oracle: 'EXAVITQu4vr4xnSDxMaL', // Sarah - ethereal
  hermes: 'TX3LPaxmHKxFdv7VOQHJ', // Liam - quick, clever
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, deity } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = DEITY_VOICES[deity] || DEITY_VOICES.zeus;
    
    console.log(`Generating voice for ${deity} using voice ${voiceId}`);
    console.log(`Text length: ${text.length} characters`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`Generated audio: ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in deity-voice function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
