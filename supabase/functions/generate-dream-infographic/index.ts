import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dreamDescription, symbols, interpretation } = await req.json();

    if (!dreamDescription) {
      return new Response(
        JSON.stringify({ error: "Dream description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract key symbols from interpretation if not provided
    const symbolList = symbols && symbols.length > 0 
      ? symbols 
      : dreamDescription.split(/\s+/).slice(0, 5);

    const prompt = `Create a beautiful, elegant infographic about Islamic dream interpretation. Dark background (#0a0a1a) with gold (#d4a574) accents and warm cream text.

Layout: A vertical infographic with these elements:
- At the top: ornamental Islamic geometric border pattern in gold
- Title in elegant calligraphy style: "Dream Symbols" with Arabic "رموز الحلم" underneath
- Below: ${symbolList.length} symbol cards arranged vertically, each containing:
  ${symbolList.map((s: string, i: number) => `  ${i + 1}. An elegant icon/illustration for "${s}" with the word displayed below it`).join("\n")}
- Each symbol card should have a subtle golden glow/border
- Between cards: delicate connecting lines or arabesque patterns
- At the bottom: "Ibn Sirin & Al-Nabulsi" in small elegant text with a crescent moon icon
- Overall feel: mysterious, scholarly, Islamic art-inspired, like an ancient manuscript meets modern design

Style: Flat design with Islamic geometric patterns, no photorealism, elegant and minimal. The infographic should look like something from a premium Islamic art book. Use dark navy/black background with gold, amber, and cream colors only. No bright colors.`;

    console.log("Generating infographic for symbols:", symbolList);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image generation error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate infographic" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "No image generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-dream-infographic error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
