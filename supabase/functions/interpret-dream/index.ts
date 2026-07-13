import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface InterpretRequest {
  dreamDescription: string;
  conversationHistory?: ChatMessage[];
  isFollowUp?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dreamDescription, conversationHistory = [], isFollowUp = false } = await req.json() as InterpretRequest;

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

    // Initialize Supabase client to search for relevant interpretations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Use AI to extract meaningful dream symbols
    console.log("Extracting symbols from dream:", dreamDescription.slice(0, 100) + "...");
    
    const symbolExtractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { 
            role: "system", 
            content: `You are a dream symbol extractor. Extract the key symbolic elements from dreams that would appear in classical Islamic dream interpretation books.

Focus on:
- Objects (water, snake, house, car, money, food, etc.)
- Animals (dog, cat, bird, lion, etc.)
- People types (father, mother, king, stranger, enemy, etc.)
- Actions (flying, falling, running, fighting, crying, etc.)
- Natural elements (sun, moon, rain, fire, sea, etc.)
- Body parts (teeth, hair, hand, eye, etc.)
- Emotions/states (death, marriage, pregnancy, fear, etc.)

Return ONLY a JSON array of 3-8 symbol keywords in both English and Arabic where applicable.
Example: ["snake", "ثعبان", "water", "ماء", "father", "أب"]

Do NOT include:
- Proper names of people
- Generic words (the, is, was, my, dreamt, saw)
- Pronouns or connectors` 
          },
          { role: "user", content: `Extract dream symbols from: "${dreamDescription}"` }
        ],
        temperature: 0.1,
      }),
    });

    let searchTerms: string[] = [];
    
    if (symbolExtractionResponse.ok) {
      const symbolData = await symbolExtractionResponse.json();
      const symbolText = symbolData.choices?.[0]?.message?.content || "";
      
      // Parse the JSON array from the response
      const jsonMatch = symbolText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          searchTerms = JSON.parse(jsonMatch[0]);
          console.log("AI extracted symbols:", searchTerms);
        } catch {
          console.error("Failed to parse symbol JSON:", symbolText);
        }
      }
    } else {
      console.error("Symbol extraction failed:", symbolExtractionResponse.status);
    }

    // Fallback: simple keyword extraction if AI fails
    if (searchTerms.length === 0) {
      const arabicParticles = ['في', 'من', 'إلى', 'على', 'عن', 'أن', 'ما', 'لا', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كانت', 'رأيت', 'رؤية'];
      const englishStopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'my', 'me', 'saw', 'see', 'dream', 'dreamed', 'dreamt', 'about', 'and', 'or', 'in', 'on', 'at', 'to', 'of', 'that', 'this', 'it', 'her', 'his', 'she', 'he', 'they', 'them', 'going', 'off', 'with'];
      
      searchTerms = dreamDescription
        .split(/[\s,،.؟?!؛:]+/)
        .map(term => term.replace(/^(ال|و|ب|ف|ك|ل)/, ''))
        .filter(term => 
          term.length > 2 && 
          !arabicParticles.includes(term) && 
          !englishStopWords.includes(term.toLowerCase())
        )
        .slice(0, 6);
      console.log("Fallback extracted terms:", searchTerms);
    }

    // Step 2: Search for relevant interpretations using extracted symbols
    // MULTI-LAYER SEARCH: title matches first, then content matches for broader context
    let relevantEntries: { title: string; content: string; source: string; matchType: string }[] = [];
    
    if (searchTerms.length > 0) {
      // Layer 1: Direct title matches (highest relevance)
      for (const term of searchTerms.slice(0, 8)) {
        if (relevantEntries.length >= 12) break;
        
        const { data: titleMatches, error: titleError } = await supabase
          .from("dream_interpretations")
          .select("title, title_arabic, content, source")
          .or(`title.ilike.%${term}%,title_arabic.ilike.%${term}%`)
          .limit(3);
        
        if (!titleError && titleMatches) {
          for (const match of titleMatches) {
            if (!relevantEntries.find(e => e.title.includes(match.title))) {
              relevantEntries.push({
                title: match.title_arabic ? `${match.title} (${match.title_arabic})` : match.title,
                content: match.content,
                source: match.source === "ibn_sirin" ? "Ibn Sirin" : "Al-Nabulsi",
                matchType: "direct"
              });
            }
          }
        }
      }
      
      console.log(`Layer 1 (title matches): found ${relevantEntries.length} entries`);
      
      // Layer 2: Content matches — find entries that DISCUSS these symbols even if not the title
      if (relevantEntries.length < 6) {
        for (const term of searchTerms.slice(0, 6)) {
          if (relevantEntries.length >= 12) break;
          
          const { data: contentMatches, error: contentError } = await supabase
            .from("dream_interpretations")
            .select("title, title_arabic, content, source")
            .ilike("content", `%${term}%`)
            .limit(4);
          
          if (!contentError && contentMatches) {
            for (const match of contentMatches) {
              if (!relevantEntries.find(e => e.title.includes(match.title))) {
                relevantEntries.push({
                  title: match.title_arabic ? `${match.title} (${match.title_arabic})` : match.title,
                  content: match.content,
                  source: match.source === "ibn_sirin" ? "Ibn Sirin" : "Al-Nabulsi",
                  matchType: "contextual"
                });
              }
            }
          }
        }
        
        console.log(`Layer 2 (content matches): total ${relevantEntries.length} entries`);
      }
    }

    // Step 3: If no direct matches, try conceptual mapping (modern → classical)
    if (relevantEntries.length === 0 && searchTerms.length > 0) {
      console.log("No direct matches found. Attempting conceptual mapping...");
      
      const conceptMappingResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { 
              role: "system", 
              content: `You are a scholar bridging modern concepts to classical Islamic dream interpretation symbols.

Given modern items or concepts that wouldn't exist in 7th-12th century texts, map them to their closest classical equivalents based on:
- Function (what it does)
- Symbolic meaning (what it represents)
- Emotional association (how it makes people feel)

Examples:
- "iPhone" → ["رسالة", "message", "letter", "كتاب", "book", "mirror", "مرآة"] (communication, self-reflection)
- "car" → ["horse", "حصان", "camel", "جمل", "riding", "travel", "سفر"] (transportation, journey)
- "airplane" → ["bird", "طائر", "flying", "طيران", "wind", "ريح"] (flight, elevation)
- "computer" → ["book", "كتاب", "knowledge", "علم", "writing", "كتابة"] (information, learning)
- "money/salary" → ["gold", "ذهب", "silver", "فضة", "treasure", "كنز"] (wealth, provision)

Return ONLY a JSON array of 4-8 classical symbol keywords in both English and Arabic.
If the items are already classical (snake, water, father), return them as-is.` 
            },
            { role: "user", content: `Map these modern concepts to classical dream symbols: ${searchTerms.join(", ")}` }
          ],
          temperature: 0.2,
        }),
      });

      if (conceptMappingResponse.ok) {
        const conceptData = await conceptMappingResponse.json();
        const conceptText = conceptData.choices?.[0]?.message?.content || "";
        
        const jsonMatch = conceptText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            const classicalSymbols = JSON.parse(jsonMatch[0]);
            console.log("Conceptual mapping result:", classicalSymbols);
            
            // Search again with classical equivalents — both title AND content
            for (const term of classicalSymbols.slice(0, 8)) {
              if (relevantEntries.length >= 12) break;
              
              // Title matches for mapped concepts
              const { data: titleMatches, error: titleError } = await supabase
                .from("dream_interpretations")
                .select("title, title_arabic, content, source")
                .or(`title.ilike.%${term}%,title_arabic.ilike.%${term}%`)
                .limit(3);
              
              if (!titleError && titleMatches) {
                for (const match of titleMatches) {
                  if (!relevantEntries.find(e => e.title.includes(match.title))) {
                    relevantEntries.push({
                      title: match.title_arabic ? `${match.title} (${match.title_arabic})` : match.title,
                      content: match.content,
                      source: match.source === "ibn_sirin" ? "Ibn Sirin" : "Al-Nabulsi",
                      matchType: "mapped"
                    });
                  }
                }
              }
              
              // Content matches for mapped concepts
              if (relevantEntries.length < 8) {
                const { data: contentMatches, error: contentError } = await supabase
                  .from("dream_interpretations")
                  .select("title, title_arabic, content, source")
                  .ilike("content", `%${term}%`)
                  .limit(3);
                
                if (!contentError && contentMatches) {
                  for (const match of contentMatches) {
                    if (!relevantEntries.find(e => e.title.includes(match.title))) {
                      relevantEntries.push({
                        title: match.title_arabic ? `${match.title} (${match.title_arabic})` : match.title,
                        content: match.content,
                        source: match.source === "ibn_sirin" ? "Ibn Sirin" : "Al-Nabulsi",
                        matchType: "mapped-context"
                      });
                    }
                  }
                }
              }
            }
            
            console.log(`After conceptual mapping: found ${relevantEntries.length} entries`);
          } catch {
            console.error("Failed to parse concept mapping JSON:", conceptText);
          }
        }
      }
    }

    // Format relevant entries for AI context
    const formattedEntries = relevantEntries.length > 0
      ? relevantEntries
          .map((entry, i) => `[${i + 1}] ${entry.source} - "${entry.title}":\n${entry.content.slice(0, 800)}`)
          .join("\n\n---\n\n")
      : "";

    const hasBookContext = relevantEntries.length > 0;

    // If STILL no sources found after conceptual mapping, return honest "no match" response
    if (!hasBookContext && !isFollowUp) {
      const noSourceResponse = `## لم نجد تفسيراً في المصادر الكلاسيكية

نعتذر، لم نتمكن من العثور على تفسير مباشر أو رمزي لعناصر حلمك في كتب ابن سيرين أو النابلسي.

**الرموز التي بحثنا عنها:** ${searchTerms.join("، ")}

هذا لا يعني أن حلمك بلا معنى — بل يعني أن هذه الرموز المحددة غير موجودة في النصوص الكلاسيكية التي نعتمد عليها.

---

## No Classical Sources Found

We searched for both direct matches and conceptual equivalents, but couldn't find relevant interpretations in Ibn Sirin or Al-Nabulsi's works.

**Symbols searched:** ${searchTerms.join(", ")}

This doesn't mean your dream is meaningless — it simply means these specific symbols (and their classical equivalents) aren't covered in our reference texts.

### Why we won't guess:

> **"من قال لا أعلم فقد أفتى"**
> *"Whoever says 'I don't know' has given a ruling."* — Islamic scholarly principle

Unlike other AI tools that fabricate "Islamic interpretations," we only provide what the scholars actually wrote.

### What you can try:
- **Focus on emotions or actions** in your dream (fear, running, falling)
- **Describe natural elements** (water, fire, animals, people)
- **Use simpler terms** — the classical texts use foundational symbols`;

      return new Response(
        JSON.stringify({ 
          interpretation: noSourceResponse,
          sources: [],
          noSourcesFound: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
3. If a symbol isn't directly covered but a RELATED symbol is, use reasoning to bridge them (e.g., if "sister" appears in texts discussing family/relatives, apply that wisdom)
4. Make connections between sources to provide a holistic interpretation
5. Be transparent about when you are reasoning vs quoting directly ("Ibn Sirin writes explicitly..." vs "Based on the scholars' discussion of family relations, we can understand...")

STRICTLY FORBIDDEN — DO NOT USE:
- Numerology (assigning meaning to numbers unless explicitly in the provided sources)
- Astrology or zodiac references
- Color symbolism not from the provided texts
- Psychological/Jungian analysis
- Any interpretation method NOT grounded in Islamic scholarly tradition
- Making up meanings that "feel Islamic" but have no textual basis

CORE BEHAVIORAL PRINCIPLES:
1. **Ijtihad-Based**: Use scholarly reasoning to derive meaning from the provided texts. If a specific symbol isn't directly addressed, look for related concepts and apply Islamic jurisprudential reasoning (قياس) to bridge the gap. Example: If "father" is mentioned in sources about family, parents, or authority figures — use that to inform your interpretation.

2. **Source-Grounded**: Always ground your interpretation in the provided texts. Quote them, cite them, and show your reasoning. But don't refuse to interpret just because there's no exact title match.

3. **Scholarly Authority**: You are a learned interpreter (معبّر) who has internalized these texts. Make classical wisdom accessible without losing depth.

4. **Transparent Reasoning**: Distinguish between direct quotes ("Ibn Sirin writes...") and your scholarly reasoning ("Based on the scholars' treatment of family relations...").

5. **Honest Limitations**: If the sources truly don't speak to a topic at all, acknowledge it. But if there's ANY related material, use it with ijtihad.

6. **Balanced Wisdom**: Be compassionate. Present potentially alarming interpretations gently with proper context.

${isFollowUp ? `
FOLLOW-UP CONVERSATION MODE:
The user is continuing to explore their dream. They have already received an interpretation from you.
- Reference what you already told them ("As I mentioned regarding the water symbol...")
- Build upon the previous interpretation, don't start from scratch
- If they ask about something not in your sources, honestly say the classical texts don't address it
- Be conversational but maintain scholarly depth
` : `
INITIAL INTERPRETATION FORMAT:
Provide a comprehensive interpretation in BOTH Arabic AND English:

## التفسير العربي

[Full interpretation in eloquent Arabic with proper Islamic terminology. Quote classical texts with attribution. Explain symbols clearly.]

## English Interpretation

[Complete interpretation in clear English. Reference the classical sources. Make the scholarly wisdom accessible.]

STRUCTURE YOUR INTERPRETATION:
1. **Key Symbols (الرموز الرئيسية)**: Identify and explain each major symbol FROM THE PROVIDED SOURCES
2. **Classical References**: Quote the provided texts with attribution (e.g., "Ibn Sirin writes...")
3. **Interconnections**: How do the symbols relate to each other in this dream?
4. **Scholarly Nuances**: Note if Ibn Sirin and Al-Nabulsi differ
5. **Personal Guidance**: What might this mean for the dreamer based on what the sources say?
`}

CONVERSATIONAL STYLE:
- Be warm and approachable while maintaining scholarly credibility
- Use phrases like "Ibn Sirin writes..." or "According to Al-Nabulsi's text..."
- If something isn't covered in your sources, say so honestly — this is a virtue, not a weakness

Remember: نصف العلم أن تقول لا أعلم — Half of knowledge is saying "I don't know."

═══════════════════════════════════════
CLASSICAL SOURCE TEXTS (USE ONLY THESE):
═══════════════════════════════════════

${formattedEntries}`;

    // Build user prompt based on whether this is a follow-up
    const userPrompt = isFollowUp 
      ? dreamDescription  // For follow-ups, just send the user's question directly
      : `الرؤيا / Dream: ${dreamDescription}

Please provide a comprehensive interpretation${hasBookContext ? " using the classical source texts provided" : ""}.

**Arabic Section (التفسير بالعربية):**
- الرموز الرئيسية ومعانيها${hasBookContext ? " مع الاستشهاد بالنصوص" : ""}
- التفسير الشامل
- الاختلاف بين العلماء إن وجد
- النصيحة الروحانية

**English Section:**
- Main symbols and their meanings${hasBookContext ? " with citations from the texts" : ""}
- Comprehensive interpretation
- Scholarly differences if any
- Spiritual guidance`;

    console.log(`Sending to AI with ${relevantEntries.length} source references, isFollowUp: ${isFollowUp}, history: ${conversationHistory.length} messages`);

    // Build messages array with conversation history
    const aiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];
    
    // Add conversation history (exclude current message since we'll add it separately)
    if (conversationHistory.length > 1) {
      // Include all messages except the last one (which is the current user message)
      for (let i = 0; i < conversationHistory.length - 1; i++) {
        aiMessages.push({
          role: conversationHistory[i].role,
          content: conversationHistory[i].content,
        });
      }
    }
    
    // Add the current user prompt
    aiMessages.push({ role: "user", content: userPrompt });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
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

    // Create a transform stream to prepend sources metadata
    const sourcesMetadata = {
      type: "sources",
      sources: relevantEntries.map(e => ({
        title: e.title,
        source: e.source,
        excerpt: e.content.slice(0, 200) + "..."
      }))
    };

    const encoder = new TextEncoder();
    const sourcesEvent = encoder.encode(`data: ${JSON.stringify(sourcesMetadata)}\n\n`);

    // Create a new stream that prepends sources then pipes AI response
    const combinedStream = new ReadableStream({
      async start(controller) {
        // Send sources first
        controller.enqueue(sourcesEvent);
        
        // Then pipe the AI response
        const reader = response.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      }
    });

    const headers = {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
    };

    return new Response(combinedStream, { headers });

  } catch (error) {
    console.error("interpret-dream error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
