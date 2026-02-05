import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DreamEntry {
  title: string;
  content: string;
  source: string;
}

interface InterpretRequest {
  dreamDescription: string;
  databaseEntries: DreamEntry[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dreamDescription, databaseEntries } = await req.json() as InterpretRequest;

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

    // Format the database entries for the AI context
    const formattedEntries = databaseEntries
      .map((entry, i) => `[${i + 1}] ${entry.source}: ${entry.content.slice(0, 500)}...`)
      .join("\n\n");

    const systemPrompt = `You are a scholar specializing in Islamic dream interpretation, drawing from classical texts by Ibn Sirin and Al-Nabulsi. Your task is to analyze dreams with wisdom and care.

IMPORTANT: Always provide your interpretation in BOTH Arabic AND English. Structure your response with Arabic first, then English translation.

When interpreting a dream:
1. Identify the main symbols and elements in the dream
2. Explain the meanings of these symbols according to classical interpretations
3. Provide a comprehensive interpretation considering the full context
4. Mention different interpretations if scholars disagree
5. End with spiritual advice or appropriate guidance

Be respectful and kind, and remember that interpretation is not an exact science but scholarly effort.

${formattedEntries ? `\n\nReference texts from dream interpretation books:\n${formattedEntries}` : ''}`;

    const userPrompt = `Dream description: ${dreamDescription}

Please interpret this dream and provide your response in BOTH Arabic and English:

## التفسير بالعربية (Arabic Interpretation)
[Provide full interpretation in Arabic]

## English Interpretation
[Provide full interpretation in English]

Include for each language:
- Main symbols and their meanings
- Comprehensive interpretation according to Ibn Sirin and Al-Nabulsi
- Any differences in interpretation if they exist
- Appropriate advice or guidance`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI interpretation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("interpret-dream error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
