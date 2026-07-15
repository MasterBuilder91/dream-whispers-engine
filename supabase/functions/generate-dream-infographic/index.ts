import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { resolveAccess } from "../_shared/limits.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface ExtractedSymbol {
  english: string;
  visual: string;
}

/**
 * Step 1 — Use a text LLM to extract 3–5 concrete, visually-depictable dream
 * symbols from the dream + interpretation. We deliberately IGNORE any symbol
 * list from the client because upstream it's a list of source-citation titles
 * (page references), not real symbols. That was the root cause of the
 * previous "garbage" infographics.
 */
async function extractSymbols(
  apiKey: string,
  dreamDescription: string,
  interpretation: string,
): Promise<ExtractedSymbol[]> {
  const systemPrompt = `You extract concrete, visually depictable symbols from Islamic dream interpretations.

Rules:
- Pick 3 to 5 CONCRETE nouns that can be drawn (snake, water, moon, key, camel, fire, house, book, palm tree, sword, mirror, staircase, bird, honey, gold coin).
- Ignore abstract nouns (love, fear, guidance, blessing, faith).
- Ignore citation titles, page numbers, chapter names, or scholar names.
- Prefer symbols actually mentioned in the dream; fall back to symbols named in the interpretation.
- Output English names only, lowercase, singular.
- For each symbol, also give a short visual descriptor (2–5 words) grounded in the interpretation's tone, e.g. "coiled black serpent", "still moonlit water", "crescent moon behind clouds".
- No text, calligraphy, letters, or writing in the visual descriptors.`;

  const userPrompt = `Dream:
"""
${dreamDescription}
"""

Interpretation:
"""
${interpretation || "(no interpretation provided)"}
"""

Extract the symbols.`;

  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_symbols",
            description: "Return the extracted dream symbols.",
            parameters: {
              type: "object",
              properties: {
                symbols: {
                  type: "array",
                  minItems: 3,
                  maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      english: {
                        type: "string",
                        description: "Lowercase, singular English noun.",
                      },
                      visual: {
                        type: "string",
                        description: "Short visual descriptor, 2-5 words, no text/letters.",
                      },
                    },
                    required: ["english", "visual"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["symbols"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_symbols" } },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Symbol extraction failed [${res.status}]: ${body}`);
  }

  const data = await res.json();
  const call = data.choices?.[0]?.message?.tool_calls?.[0];
  const argsRaw = call?.function?.arguments;
  if (!argsRaw) throw new Error("Symbol extraction returned no tool call");
  const parsed = JSON.parse(argsRaw);
  const symbols: ExtractedSymbol[] = Array.isArray(parsed.symbols) ? parsed.symbols : [];
  if (symbols.length === 0) throw new Error("Symbol extraction returned empty list");
  return symbols.slice(0, 5);
}

/**
 * Step 2 — Build an image-only prompt. The key discipline: forbid ALL text,
 * letters, calligraphy, numerals, and captions. Image models cannot render
 * Arabic reliably and the old prompt asked for both English and Arabic
 * headlines plus per-symbol labels, which produced the "garbage" glyphs.
 */
function buildImagePrompt(symbols: ExtractedSymbol[]): string {
  const scene = symbols
    .map((s, i) => `${i + 1}. ${s.english} — ${s.visual}`)
    .join("\n");

  return `A single illustrated plate in the style of an ancient Islamic illuminated manuscript, reinterpreted with modern minimalism.

Composition: one vertical tableau, not a grid, arranging these symbols together in a poetic dreamlike scene:
${scene}

Aesthetic:
- Deep midnight-navy background (#0a0a1a) with soft golden light (#d4a574) and warm cream highlights.
- Fine gold linework, subtle Islamic geometric border framing the composition.
- Flat illustrated style, muted and scholarly, like a page from a Timurid or Persian manuscript filtered through modern editorial illustration.
- Delicate stars, crescent, and arabesque accents where they fit naturally.
- Depth via layered silhouettes and gentle golden glow, not photorealism.

STRICT: no text of any kind. No letters, no Arabic calligraphy, no English words, no numerals, no captions, no signatures, no watermarks, no book titles, no labels on the symbols. Purely visual illustration.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dreamDescription, interpretation } = await req.json();

    if (!dreamDescription || typeof dreamDescription !== "string") {
      return new Response(
        JSON.stringify({ error: "Dream description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Free khidma — infographic available to all.

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1 — extract real symbols
    const symbols = await extractSymbols(
      LOVABLE_API_KEY,
      dreamDescription,
      typeof interpretation === "string" ? interpretation : "",
    );
    console.log("Extracted symbols:", symbols.map((s) => s.english).join(", "));

    // Step 2 — generate the image
    const prompt = buildImagePrompt(symbols);
    const response = await fetch(AI_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Image generation failed [${response.status}]: ${errorText}`);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate infographic", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        imageUrl,
        symbols: symbols.map((s) => s.english),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-dream-infographic error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
