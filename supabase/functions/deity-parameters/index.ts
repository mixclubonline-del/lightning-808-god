import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARAMETER_SCHEMA: Record<string, { min: number; max: number; description: string }> = {
  wave: { min: 0, max: 100, description: "Waveform shape (0=sine, 50=saw, 100=square)" },
  filter: { min: 0, max: 100, description: "Filter cutoff frequency" },
  resonance: { min: 0, max: 100, description: "Filter resonance/Q" },
  gain: { min: 0, max: 100, description: "Overall volume/gain" },
  attack: { min: 0, max: 100, description: "Envelope attack time" },
  decay: { min: 0, max: 100, description: "Envelope decay time" },
  sustain: { min: 0, max: 100, description: "Envelope sustain level" },
  release: { min: 0, max: 100, description: "Envelope release time" },
  distortionDrive: { min: 0, max: 100, description: "Distortion amount" },
  distortionMix: { min: 0, max: 100, description: "Distortion wet/dry mix" },
  reverbSize: { min: 0, max: 100, description: "Reverb room size" },
  reverbMix: { min: 0, max: 100, description: "Reverb wet/dry mix" },
  delayTime: { min: 0, max: 100, description: "Delay time" },
  delayFeedback: { min: 0, max: 100, description: "Delay feedback amount" },
  delayMix: { min: 0, max: 100, description: "Delay wet/dry mix" },
  chorusRate: { min: 0, max: 100, description: "Chorus LFO rate" },
  chorusDepth: { min: 0, max: 100, description: "Chorus depth" },
  chorusMix: { min: 0, max: 100, description: "Chorus wet/dry mix" },
  compressorThreshold: { min: 0, max: 100, description: "Compressor threshold" },
  compressorRatio: { min: 0, max: 100, description: "Compressor ratio" },
  masterVolume: { min: 0, max: 100, description: "Master output volume" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userRequest, currentParameters, deity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a parameter adjustment AI for a music synthesizer called VST God.
Your role is to interpret natural language requests and return specific parameter changes.

CURRENT PARAMETERS:
${JSON.stringify(currentParameters, null, 2)}

AVAILABLE PARAMETERS AND THEIR RANGES:
${Object.entries(PARAMETER_SCHEMA).map(([key, val]) => `- ${key}: ${val.min}-${val.max} (${val.description})`).join('\n')}

INTERPRETATION GUIDELINES:
- "aggressive/punchy/hard" → increase distortionDrive, compressorRatio, decrease attack
- "warm/soft/mellow" → decrease filter, increase attack, decrease distortionDrive
- "spacey/ambient/wet" → increase reverbMix, reverbSize, delayMix
- "dry/tight/focused" → decrease reverbMix, delayMix
- "bright/crisp" → increase filter
- "dark/muddy" → decrease filter
- "snappy" → decrease attack, increase decay
- "sustaining/long" → increase sustain, release
- "louder/quieter" → adjust gain or masterVolume
- "more bass" → increase gain, decrease filter slightly
- "add movement" → increase chorusMix, chorusDepth

You MUST respond with ONLY valid JSON in this exact format:
{
  "changes": {
    "parameterName": newValue,
    "anotherParameter": newValue
  },
  "explanation": "Brief explanation of what you changed and why",
  "deity_response": "A short in-character response from ${deity || 'the deity'} about the changes"
}

Only include parameters that need to change. Values must be numbers between 0-100.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userRequest },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let parsed;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({
        changes: {},
        explanation: "I understood your request but couldn't determine specific parameter changes.",
        deity_response: content,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate parameter values
    if (parsed.changes) {
      for (const [key, value] of Object.entries(parsed.changes)) {
        if (PARAMETER_SCHEMA[key]) {
          const numValue = Number(value);
          parsed.changes[key] = Math.max(
            PARAMETER_SCHEMA[key].min,
            Math.min(PARAMETER_SCHEMA[key].max, numValue)
          );
        } else {
          delete parsed.changes[key];
        }
      }
    }

    console.log("Parameter suggestion:", parsed);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("deity-parameters error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
