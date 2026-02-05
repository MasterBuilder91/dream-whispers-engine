import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InterpretRequest {
  dreamDescription: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dreamDescription } = await req.json() as InterpretRequest;

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

    // Extract keywords from the dream description for searching
    // Handle both Arabic and English, remove common particles
    const arabicParticles = ['في', 'من', 'إلى', 'على', 'عن', 'أن', 'ما', 'لا', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كانت', 'رأيت', 'رؤية'];
    const englishStopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'my', 'saw', 'see', 'dream', 'dreamed', 'about', 'and', 'or', 'in', 'on', 'at'];
    
    const searchTerms = dreamDescription
      .split(/[\s,،.؟?!؛:]+/)
      .map(term => term.replace(/^(ال|و|ب|ف|ك|ل)/, '')) // Remove Arabic prefixes
      .filter(term => 
        term.length > 1 && 
        !arabicParticles.includes(term) && 
        !englishStopWords.includes(term.toLowerCase())
      )
      .slice(0, 8);

    console.log("Searching for dream symbols:", searchTerms);

    // Search for relevant interpretations
    let relevantEntries: { title: string; content: string; source: string }[] = [];
    
    if (searchTerms.length > 0) {
      // Build OR conditions for each search term
      const orConditions = searchTerms.flatMap(term => [
        `title.ilike.%${term}%`,
        `title_arabic.ilike.%${term}%`,
        `content.ilike.%${term}%`
      ]).join(',');
      
      const { data: searchResults, error: searchError } = await supabase
        .from("dream_interpretations")
        .select("title, title_arabic, content, source")
        .or(orConditions)
        .limit(10);

      if (searchError) {
        console.error("Search error:", searchError);
      } else if (searchResults && searchResults.length > 0) {
        relevantEntries = searchResults.map(r => ({
          title: r.title_arabic ? `${r.title} (${r.title_arabic})` : r.title,
          content: r.content,
          source: r.source === "ibn_sirin" ? "Ibn Sirin" : "Al-Nabulsi"
        }));
        console.log(`Found ${relevantEntries.length} relevant interpretations`);
      }
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

Remember: Dream interpretation (تعبير الرؤيا) is a scholarly art, not an exact science.

${formattedEntries ? `\n═══════════════════════════════════════\nCLASSICAL SOURCE TEXTS (USE THESE!):\n═══════════════════════════════════════\n\n${formattedEntries}` : ''}`;

    const userPrompt = `الرؤيا / Dream: ${dreamDescription}

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

    console.log(`Sending to AI with ${relevantEntries.length} source references`);

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
