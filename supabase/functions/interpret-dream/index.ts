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
    let relevantEntries: { title: string; content: string; source: string }[] = [];
    
    if (searchTerms.length > 0) {
      // Search primarily by title (more accurate) for each symbol
      for (const term of searchTerms.slice(0, 6)) {
        if (relevantEntries.length >= 8) break;
        
        const { data: titleMatches, error: titleError } = await supabase
          .from("dream_interpretations")
          .select("title, title_arabic, content, source")
          .or(`title.ilike.%${term}%,title_arabic.ilike.%${term}%`)
          .limit(3);
        
        if (!titleError && titleMatches) {
          for (const match of titleMatches) {
            // Avoid duplicates
            if (!relevantEntries.find(e => e.title.includes(match.title))) {
              relevantEntries.push({
                title: match.title_arabic ? `${match.title} (${match.title_arabic})` : match.title,
                content: match.content,
                source: match.source === "ibn_sirin" ? "Ibn Sirin" : "Al-Nabulsi"
              });
            }
          }
        }
      }
      
      console.log(`Found ${relevantEntries.length} relevant interpretations for symbols`);
    }

    // Format relevant entries for AI context
    const formattedEntries = relevantEntries.length > 0
      ? relevantEntries
          .map((entry, i) => `[${i + 1}] ${entry.source} - "${entry.title}":\n${entry.content.slice(0, 800)}`)
          .join("\n\n---\n\n")
      : "";

    const hasBookContext = relevantEntries.length > 0;

    const systemPrompt = `You are an expert Islamic dream interpreter, deeply knowledgeable in the classical works of Imam Ibn Sirin (653-729 CE) and Sheikh Abdul Ghani al-Nabulsi (1641-1731 CE).

Your interpretations draw from:
- "Tafsir al-Ahlam al-Kabir" (The Great Book of Dream Interpretation) by Ibn Sirin
- "Ta'tir al-Anam fi Tafsir al-Manam" (Perfuming People with Dream Interpretation) by Al-Nabulsi

${hasBookContext ? `IMPORTANT: You have been provided with ACTUAL PASSAGES from the classical texts below. You MUST base your interpretation primarily on these authentic sources. Quote them directly when relevant.` : `Note: No direct passages were found in the database for this dream's symbols. Provide interpretation based on your knowledge of the scholars' methodologies.`}

${isFollowUp ? `
CONVERSATION MODE:
You are in a conversation with the user about their dream. They may:
- Ask follow-up questions about specific symbols
- Request clarification on your interpretation
- Want to explore certain aspects deeper
- Ask about related themes or personal application
- Inquire about differences between scholars

Respond naturally to their questions while maintaining the scholarly tone. You don't need to repeat the full interpretation - focus on answering their specific question. Keep responses conversational but grounded in the classical texts.
` : `
RESPONSE FORMAT:
Always provide interpretations in BOTH Arabic AND English, structured as follows:

## التفسير العربي

[Complete interpretation in Arabic, using proper Islamic terminology. If book passages are provided, quote them directly with attribution.]

## English Interpretation

[Complete interpretation in English. If book passages are provided, reference them with proper attribution.]

INTERPRETATION GUIDELINES:
1. Identify the key symbols (رموز) in the dream
2. ${hasBookContext ? "Quote directly from the provided classical texts when explaining symbol meanings" : "Explain meanings according to Ibn Sirin and Al-Nabulsi's known methodologies"}
3. Consider the dreamer's context (if provided) and time of dream
4. Note any differences between scholars' interpretations
5. Provide spiritual guidance rooted in Islamic wisdom
6. Be compassionate and balanced - avoid alarming interpretations
`}

Remember: Dream interpretation (تعبير الرؤيا) is a scholarly art, not an exact science. Be engaging and encourage the user to explore their dream deeper.

${formattedEntries ? `\n═══════════════════════════════════════\nCLASSICAL SOURCE TEXTS (USE THESE!):\n═══════════════════════════════════════\n\n${formattedEntries}` : ''}`;

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
