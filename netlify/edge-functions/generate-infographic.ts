const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

interface ExtractedSymbol { english: string; visual: string; }

function buildImagePrompt(symbols: ExtractedSymbol[]): string {
  const scene = symbols.map((s, i) => `${i + 1}. ${s.english} — ${s.visual}`).join("\n");
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { dreamDescription, interpretation } = await req.json() as {
      dreamDescription?: string;
      interpretation?: string;
    };

    if (!dreamDescription?.trim()) {
      return new Response(JSON.stringify({ error: "Dream description is required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    // Step 1: Extract concrete visual symbols
    const symbolSystemPrompt = `You extract concrete, visually depictable symbols from Islamic dream interpretations.

Rules:
- Pick 3 to 5 CONCRETE nouns that can be drawn (snake, water, moon, key, camel, fire, house, book, palm tree, sword, mirror, staircase, bird, honey, gold coin).
- Ignore abstract nouns (love, fear, guidance, blessing, faith).
- Ignore citation titles, page numbers, chapter names, or scholar names.
- Prefer symbols actually mentioned in the dream; fall back to symbols named in the interpretation.
- Output English names only, lowercase, singular.
- For each symbol, also give a short visual descriptor (2-5 words) grounded in the interpretation's tone.
- No text, calligraphy, letters, or writing in the visual descriptors.`;

    const symbolUserPrompt = `Dream:\n"""\n${dreamDescription}\n"""\n\nInterpretation:\n"""\n${interpretation ?? "(no interpretation provided)"}\n"""\n\nExtract the symbols as JSON.`;

    const extractRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: symbolSystemPrompt }] },
          contents: [{ role: "user", parts: [{ text: symbolUserPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                symbols: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      english: { type: "STRING" },
                      visual: { type: "STRING" },
                    },
                    required: ["english", "visual"],
                  },
                },
              },
              required: ["symbols"],
            },
          },
        }),
      }
    );

    if (!extractRes.ok) {
      throw new Error(`Symbol extraction failed: ${extractRes.status}`);
    }

    const extractData = await extractRes.json();
    const rawJson: string = extractData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    let symbols: ExtractedSymbol[] = [];
    try {
      const parsed = JSON.parse(rawJson);
      symbols = Array.isArray(parsed.symbols) ? parsed.symbols.slice(0, 5) : [];
    } catch {
      throw new Error("Failed to parse symbol extraction response");
    }
    if (symbols.length === 0) throw new Error("No symbols extracted");

    console.log("Symbols:", symbols.map(s => s.english).join(", "));

    // Step 2: Generate image
    const imagePrompt = buildImagePrompt(symbols);

    const imgRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      }
    );

    if (!imgRes.ok) {
      const errText = await imgRes.text();
      console.error("Image generation failed:", imgRes.status, errText.slice(0, 500));
      return new Response(JSON.stringify({ error: "Image generation failed" }), {
        status: 502, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const imgData = await imgRes.json();
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> =
      imgData?.candidates?.[0]?.content?.parts ?? [];

    const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith("image/"));
    if (!imagePart?.inlineData) {
      console.error("No image part in Gemini response:", JSON.stringify(imgData).slice(0, 500));
      return new Response(JSON.stringify({ error: "No image generated" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    return new Response(
      JSON.stringify({ imageUrl, symbols: symbols.map(s => s.english) }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("generate-infographic:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
}
