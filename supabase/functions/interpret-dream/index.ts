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

    const systemPrompt = `أنت عالم متخصص في تفسير الأحلام وفق المنهج الإسلامي، مستندًا إلى كتب العلماء الكبار كابن سيرين والنابلسي. مهمتك تحليل الرؤى والأحلام بحكمة وتأنٍ.

عند تفسير الحلم:
1. حدد الرموز والعناصر الرئيسية في الحلم
2. اشرح معاني هذه الرموز وفقًا للتفاسير الكلاسيكية
3. قدم تفسيرًا شاملًا يراعي السياق الكامل للحلم
4. اذكر التفاسير المختلفة إن وجدت خلاف بين العلماء
5. انتهِ بنصيحة روحانية أو توجيه مناسب

كن محترمًا ولطيفًا، وتذكر أن التفسير ليس علمًا قاطعًا بل اجتهاد.

${formattedEntries ? `\n\nالنصوص المرجعية من كتب تفسير الأحلام:\n${formattedEntries}` : ''}`;

    const userPrompt = `الرؤيا أو الحلم: ${dreamDescription}

رجاءً قم بتفسير هذا الحلم مع ذكر:
- الرموز الرئيسية ومعانيها
- التفسير الشامل وفقًا لابن سيرين والنابلسي
- أي اختلافات في التفسير إن وجدت
- نصيحة أو توجيه مناسب`;

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
