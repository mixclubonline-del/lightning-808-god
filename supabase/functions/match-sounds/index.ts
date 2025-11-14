import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetFeatures } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all samples from database
    const { data: samples, error: fetchError } = await supabase
      .from("sound_samples")
      .select("*");

    if (fetchError) {
      console.error("Error fetching samples:", fetchError);
      throw fetchError;
    }

    if (!samples || samples.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No samples in library yet" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate similarity scores using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Prepare data for AI analysis
    const featurePrompt = `You are an audio similarity analyzer. Given a target sound's audio features and a library of sounds, rank them by similarity.

Target Sound Features:
- Spectral Centroid (brightness): ${targetFeatures.spectralCentroid}
- Spectral Rolloff (high freq): ${targetFeatures.spectralRolloff}
- Spectral Flatness (noise/tonal): ${targetFeatures.spectralFlatness}
- RMS Energy (loudness): ${targetFeatures.rmsEnergy}
- Zero Crossing Rate (texture): ${targetFeatures.zeroCrossingRate}
- Low Freq Energy (sub bass): ${targetFeatures.lowFreqEnergy}
- Mid Freq Energy: ${targetFeatures.midFreqEnergy}
- High Freq Energy: ${targetFeatures.highFreqEnergy}

Library Sounds:
${samples.map((s, i) => `
Sample ${i + 1} (ID: ${s.id}, Name: ${s.name}):
- Spectral Centroid: ${s.spectral_centroid}
- Spectral Rolloff: ${s.spectral_rolloff}
- Spectral Flatness: ${s.spectral_flatness}
- RMS Energy: ${s.rms_energy}
- Zero Crossing Rate: ${s.zero_crossing_rate}
- Low Freq Energy: ${s.low_freq_energy}
- Mid Freq Energy: ${s.mid_freq_energy}
- High Freq Energy: ${s.high_freq_energy}
`).join("\n")}

Return ONLY the top 5 most similar sounds as a JSON array with format:
[{"id": "sample-id", "similarity": 0.95, "reason": "Very similar sub bass characteristics"}]

Similarity should be 0-1 where 1 is identical. Consider all features but weight sub bass and brightness heavily for 808s.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an audio similarity analyzer. Return only valid JSON." },
          { role: "user", content: featurePrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/\[[\s\S]*\]/);
    const matchesJson = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
    
    let matches = JSON.parse(matchesJson);

    // Enrich with sample data
    matches = matches.map((match: any) => {
      const sample = samples.find((s) => s.id === match.id);
      return {
        ...match,
        sample,
      };
    }).filter((m: any) => m.sample);

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("match-sounds error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
