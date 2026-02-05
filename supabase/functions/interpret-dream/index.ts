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

    // Format any database entries for context
    const formattedEntries = databaseEntries && databaseEntries.length > 0
      ? databaseEntries
          .map((entry, i) => `[${i + 1}] ${entry.source}: ${entry.content.slice(0, 600)}`)
          .join("\n\n")
      : "";

    const systemPrompt = `You are an expert Islamic dream interpreter, deeply knowledgeable in the classical works of Imam Ibn Sirin (653-729 CE) and Sheikh Abdul Ghani al-Nabulsi (1641-1731 CE).

Your interpretations draw from:
- "Tafsir al-Ahlam al-Kabir" (The Great Book of Dream Interpretation) by Ibn Sirin
- "Ta'tir al-Anam fi Tafsir al-Manam" (Perfuming People with Dream Interpretation) by Al-Nabulsi

RESPONSE FORMAT:
Always provide interpretations in BOTH Arabic AND English, structured as follows:

## التفسير العربي

[Complete interpretation in Arabic, using proper Islamic terminology]

## English Interpretation

[Complete interpretation in English]

INTERPRETATION GUIDELINES:
1. Identify the key symbols (رموز) in the dream
2. Explain their meanings according to Ibn Sirin and Al-Nabulsi
3. Consider the dreamer's context (if provided) and time of dream
4. Note any differences between scholars' interpretations
5. Provide spiritual guidance rooted in Islamic wisdom
6. Be compassionate and balanced - avoid alarming interpretations

Remember: Dream interpretation (تعبير الرؤيا) is a scholarly art, not an exact science. Different contexts can yield different meanings for the same symbol.

${formattedEntries ? `\nREFERENCE TEXTS FROM CLASSICAL SOURCES:\n${formattedEntries}` : ''}`;

    const userPrompt = `الرؤيا / Dream: ${dreamDescription}

Please provide a comprehensive interpretation following Ibn Sirin and Al-Nabulsi's methodology. Include:

**Arabic Section (التفسير بالعربية):**
- الرموز الرئيسية ومعانيها
- التفسير الشامل
- الاختلاف بين العلماء إن وجد
- النصيحة الروحانية

**English Section:**
- Main symbols and their meanings
- Comprehensive interpretation
- Scholarly differences if any
- Spiritual guidance`;

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
