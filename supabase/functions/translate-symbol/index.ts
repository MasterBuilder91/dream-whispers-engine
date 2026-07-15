import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LANGUAGE_NAMES: Record<string, string> = {
  ar: "Modern Standard Arabic (فصحى)",
  ur: "Urdu (اردو)",
  so: "Somali (Af-Soomaali)",
  sw: "Swahili (Kiswahili)",
  tr: "Turkish (Türkçe)",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  es: "Spanish (Español)",
};

interface ScholarEntry {
  scholar: "Ibn Sirin" | "Al-Nabulsi";
  text: string;
}

interface SymbolPayload {
  slug: string;
  name: string;
  nameArabic: string;
  summary: string;
  interpretation: string;
  scholars: ScholarEntry[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { symbol, language } = (await req.json()) as {
      symbol: SymbolPayload;
      language: string;
    };

    if (!symbol?.slug || !language) {
      return new Response(
        JSON.stringify({ error: "symbol and language are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!LANGUAGE_NAMES[language]) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Cache lookup
    const { data: cached } = await supabase
      .from("symbol_translations")
      .select("name, summary, interpretation, scholars")
      .eq("symbol_slug", symbol.slug)
      .eq("language", language)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ translation: cached, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Translate via Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const targetLanguage = LANGUAGE_NAMES[language];
    const systemPrompt = `You are a scholarly translator working with classical Islamic dream interpretation texts by Ibn Sirin and Al-Nabulsi. Translate faithfully into ${targetLanguage}. Preserve religious terminology and scholarly tone. Do not paraphrase away meaning. Return ONLY a JSON object with keys: name, summary, interpretation, scholars (array of {scholar, text}). Keep the scholar names in English ("Ibn Sirin", "Al-Nabulsi"). Translate every "text" field.`;

    const userPrompt = JSON.stringify({
      name: symbol.name,
      summary: symbol.summary,
      interpretation: symbol.interpretation,
      scholars: symbol.scholars,
    });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI translation failed:", aiRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Translation failed", status: aiRes.status, details: errText }),
        { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content returned from translator");

    let parsed: {
      name: string;
      summary: string;
      interpretation: string;
      scholars: ScholarEntry[];
    };
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Translator returned invalid JSON");
    }

    // 3. Cache
    await supabase.from("symbol_translations").insert({
      symbol_slug: symbol.slug,
      language,
      name: parsed.name,
      summary: parsed.summary,
      interpretation: parsed.interpretation,
      scholars: parsed.scholars,
    });

    return new Response(JSON.stringify({ translation: parsed, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("translate-symbol error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
