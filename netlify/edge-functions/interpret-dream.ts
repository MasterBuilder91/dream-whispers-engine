import DB_INDEX from "./db-index.json" with { type: "json" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

type DbEntry = { t: string; c: string; s: "N" | "I" };
type ResultEntry = { title: string; content: string; source: string; matchType: string };

const INDEX = DB_INDEX as DbEntry[];

const flattenSymbols = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) out.push(item.trim());
    else if (item && typeof item === "object") {
      for (const v of Object.values(item as Record<string, unknown>)) {
        if (typeof v === "string" && v.trim()) out.push(v.trim());
      }
    }
  }
  return [...new Set(out)].filter(
    (t) => t.length > 0 && t.length < 60 && !/[\{\}\[\]]/.test(t)
  );
};

function searchIndex(terms: string[], maxResults = 12): ResultEntry[] {
  const results: ResultEntry[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    if (results.length >= maxResults) break;
    const tl = term.toLowerCase();
    for (const entry of INDEX) {
      if (results.length >= maxResults) break;
      if (entry.t.toLowerCase().includes(tl) || entry.t.includes(term)) {
        if (!seen.has(entry.t)) {
          seen.add(entry.t);
          results.push({ title: entry.t, content: entry.c, source: entry.s === "N" ? "Al-Nabulsi" : "Ibn Sirin", matchType: "direct" });
        }
      }
    }
  }

  if (results.length < 6) {
    for (const term of terms) {
      if (results.length >= maxResults) break;
      const tl = term.toLowerCase();
      for (const entry of INDEX) {
        if (results.length >= maxResults) break;
        if (!seen.has(entry.t) && (entry.c.toLowerCase().includes(tl) || entry.c.includes(term))) {
          seen.add(entry.t);
          results.push({ title: entry.t, content: entry.c, source: entry.s === "N" ? "Al-Nabulsi" : "Ibn Sirin", matchType: "contextual" });
        }
      }
    }
  }

  return results;
}

async function extractSymbols(apiKey: string, dreamDescription: string): Promise<string[]> {
  const systemPrompt = `You are a multilingual dream symbol extractor for a classical Islamic dream interpretation engine.

The dream may be written in ANY of these languages or dialects:
- Modern Standard Arabic (فصحى) and ALL colloquial dialects: Egyptian, Levantine, Gulf, Iraqi, Maghrebi, Sudanese, Yemeni, Hassaniya
- English, Urdu, Somali, Swahili, Turkish, Indonesian, Malay, Spanish

Understand slang, transliteration (Arabizi like "3ain", "7abibi"), and mixed-language input. Normalize dialectal words to their Modern Standard Arabic equivalent when extracting symbols.

Extract 3-8 key symbolic elements (objects, animals, people-types, actions, natural elements, body parts, states).

Return ONLY a JSON array of symbols in BOTH English AND Arabic (Modern Standard) for reliable searching against classical texts.
Example: ["snake", "ثعبان", "water", "ماء", "father", "أب"]

Do NOT include: proper names, pronouns, connectors, or generic words.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: `Extract dream symbols from: "${dreamDescription}"` }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return flattenSymbols(JSON.parse(match[0])); } catch { return []; }
}

async function conceptualMap(apiKey: string, terms: string[]): Promise<string[]> {
  const systemPrompt = `You are a scholar bridging modern concepts to classical Islamic dream interpretation symbols.

Given modern items or concepts that wouldn't exist in 7th-12th century texts, map them to their closest classical equivalents based on function, symbolic meaning, and emotional association.

Examples:
- "iPhone" → ["رسالة", "message", "letter", "كتاب", "book", "mirror", "مرآة"]
- "car" → ["horse", "حصان", "camel", "جمل", "riding", "travel", "سفر"]
- "airplane" → ["bird", "طائر", "flying", "طيران", "wind", "ريح"]

Return ONLY a JSON array of 4-8 classical symbol keywords in both English and Arabic.
If the items are already classical (snake, water, father), return them as-is.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: `Map these modern concepts to classical dream symbols: ${terms.join(", ")}` }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return flattenSymbols(JSON.parse(match[0])); } catch { return []; }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { dreamDescription } = await req.json() as { dreamDescription?: string };
    if (!dreamDescription?.trim()) {
      return new Response(JSON.stringify({ error: "Dream description is required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    // Step 1: Extract symbols
    let searchTerms = await extractSymbols(apiKey, dreamDescription);

    // Fallback: simple keyword extraction
    if (searchTerms.length === 0) {
      const arabicParticles = ['في', 'من', 'إلى', 'على', 'عن', 'أن', 'ما', 'لا', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كانت', 'رأيت'];
      const englishStop = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'my', 'me', 'saw', 'dream', 'dreamed', 'dreamt', 'about', 'and', 'or', 'in', 'on', 'at', 'to', 'of']);
      searchTerms = dreamDescription
        .split(/[\s,،.؟?!؛:]+/)
        .map(t => t.replace(/^(ال|و|ب|ف|ك|ل)/, ""))
        .filter(t => t.length > 2 && !arabicParticles.includes(t) && !englishStop.has(t.toLowerCase()))
        .slice(0, 6);
    }

    // Step 2: Search JSON index
    let entries = searchIndex(searchTerms);

    // Step 3: Conceptual mapping fallback
    if (entries.length === 0 && searchTerms.length > 0) {
      const classicalTerms = await conceptualMap(apiKey, searchTerms);
      if (classicalTerms.length > 0) {
        entries = searchIndex(classicalTerms);
        entries = entries.map(e => ({ ...e, matchType: "mapped" }));
      }
    }

    const formattedEntries = entries.length > 0
      ? entries.map((e, i) => `[${i + 1}] ${e.source} - "${e.title}":\n${e.content.slice(0, 800)}`).join("\n\n---\n\n")
      : "";
    const hasBookContext = entries.length > 0;

    // Step 4: Stream interpretation
    const systemPrompt = `You are "رفيق الأحلام" (BinSirin), an expert Islamic dream interpreter and scholarly guide. You have deeply studied and internalized the classical works of Imam Ibn Sirin (653-729 CE) and Sheikh Abdul Ghani al-Nabulsi (1641-1731 CE).

YOUR ROLE AS A DREAM INTERPRETER AGENT:
You are a knowledgeable companion guiding users through understanding their dreams. You interpret based on the classical source texts provided, using scholarly reasoning (اجتهاد) to synthesize meaning when sources are available but may not be exact matches.

SCHOLARLY SOURCES YOU DRAW FROM:
- "Tafsir al-Ahlam al-Kabir" (The Great Book of Dream Interpretation) by Ibn Sirin
- "Ta'tir al-Anam fi Tafsir al-Manam" (Perfuming People with Dream Interpretation) by Al-Nabulsi

CRITICAL IJTIHAD PRINCIPLE (اجتهاد):
You have been provided with passages from the classical texts below. Your job is to:
1. Use these sources as your FOUNDATION — quote and explain them
2. Apply scholarly reasoning to synthesize meaning for the user's specific dream
3. If a symbol isn't directly covered but a RELATED symbol is, use reasoning to bridge them
4. Make connections between sources to provide a holistic interpretation
5. Be transparent about when you are reasoning vs quoting directly

STRICTLY FORBIDDEN — DO NOT USE:
- Numerology (assigning meaning to numbers unless explicitly in the provided sources)
- Astrology or zodiac references
- Color symbolism not from the provided texts
- Psychological/Jungian analysis
- Any interpretation method NOT grounded in Islamic scholarly tradition
- Making up meanings that "feel Islamic" but have no textual basis

CORE BEHAVIORAL PRINCIPLES:
1. **Ijtihad-Based**: Use scholarly reasoning to derive meaning from the provided texts.
2. **Source-Grounded**: Always ground your interpretation in the provided texts.
3. **Scholarly Authority**: You are a learned interpreter (معبّر) who has internalized these texts.
4. **Transparent Reasoning**: Distinguish between direct quotes and your scholarly reasoning.
5. **Honest Limitations**: If the sources truly don't speak to a topic, acknowledge it.
6. **Balanced Wisdom**: Be compassionate. Present potentially alarming interpretations gently.

INITIAL INTERPRETATION FORMAT — LANGUAGE HANDLING:

The dream may arrive in any of these languages or dialects: Modern Standard Arabic AND all colloquial dialects, English, Urdu, Somali, Swahili, Turkish, Indonesian, Malay, Spanish.

1. DETECT the primary language/dialect the user wrote in.
2. ALWAYS include a full Arabic (فصحى) interpretation.
3. ALSO include a full interpretation in the user's detected language when it is not Arabic.
4. If the user wrote in a colloquial Arabic dialect, write in Modern Standard Arabic, briefly acknowledging the dialect.

Use this structure:

## التفسير العربي

[Full interpretation in eloquent Modern Standard Arabic with proper Islamic terminology. Quote classical texts with attribution.]

## [User Language Heading]

[Complete interpretation in the user's language. Reference the classical Arabic sources by name. Keep transliterated Arabic terms where meaningful followed by translation.]

STRUCTURE (apply to both sections):
1. **Key Symbols**: Identify and explain each major symbol FROM THE PROVIDED SOURCES
2. **Classical References**: Quote the provided Arabic texts with attribution
3. **Interconnections**: How the symbols relate to each other in this dream
4. **Scholarly Nuances**: Note if Ibn Sirin and Al-Nabulsi differ
5. **Personal Guidance**: What this might mean for the dreamer based on the sources

CONVERSATIONAL STYLE:
- Be warm and approachable while maintaining scholarly credibility
- Use phrases like "Ibn Sirin writes..." or "According to Al-Nabulsi's text..."

Remember: نصف العلم أن تقول لا أعلم — Half of knowledge is saying "I don't know."

═══════════════════════════════════════
CLASSICAL SOURCE TEXTS:
═══════════════════════════════════════

${hasBookContext ? formattedEntries : "(No direct passage was retrieved from the reference database for this dream. Interpret from your deep internalized knowledge of Ibn Sirin and Al-Nabulsi's tradition. Stay strictly within classical Islamic dream interpretation — no psychology, numerology, astrology, or invented meanings. Do NOT refuse. Attribute reasoning to the scholars' tradition rather than fabricating specific quotes.)"}`;

    const userPrompt = `الرؤيا / Dream: ${dreamDescription}

Detect the language or Arabic dialect this dream was written in, then provide a comprehensive interpretation${hasBookContext ? " grounded in the classical source texts provided" : ""}.

Output TWO sections following the language-handling rules in your system prompt:

1. **## التفسير العربي** — always in Modern Standard Arabic (فصحى): key symbols, comprehensive interpretation${hasBookContext ? " with citations from the texts" : ""}, scholarly differences if any, and spiritual guidance.

2. **## [Heading in the user's detected language]** — a complete parallel interpretation in the user's language. Skip this second section ONLY if the user wrote in Arabic (any dialect).`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, err.slice(0, 500));
      return new Response(JSON.stringify({ error: "AI interpretation failed" }), {
        status: 502, headers: { ...CORS, "Content-Type": "application/json" }
      });
    }

    const sourcesMetadata = {
      type: "sources",
      sources: entries.map(e => ({ title: e.title, source: e.source, excerpt: e.content.slice(0, 200) + "..." }))
    };

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(sourcesMetadata)}\n\n`));

        const reader = geminiRes.body!.getReader();
        let buf = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const json = line.slice(6).trim();
              if (!json || json === "[DONE]") continue;
              try {
                const parsed = JSON.parse(json);
                const text: string | undefined = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`
                  ));
                }
              } catch { /* ignore */ }
            }
          }
          if (buf.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(buf.slice(6));
              const text: string | undefined = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`
                ));
              }
            } catch { /* ignore */ }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });

  } catch (err) {
    console.error("interpret-dream:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
}
