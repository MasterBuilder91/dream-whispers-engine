import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DreamEntry {
  title: string;
  title_arabic?: string;
  content: string;
  source: "ibn_sirin" | "al_nabulsi";
  category?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting dream data import...");

    // Parse request body for entries
    const requestData = await req.json().catch(() => ({ entries: [] }));
    const entries: DreamEntry[] = requestData.entries || [];

    if (entries.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No entries provided. Send { entries: [{ title, title_arabic?, content, source, category? }] }" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let imported = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      if (!entry.title || !entry.content || !entry.source) {
        errors.push(`Invalid entry: missing required fields`);
        continue;
      }

      const { error } = await supabase.from("dream_interpretations").insert({
        title: entry.title,
        title_arabic: entry.title_arabic || null,
        content: entry.content,
        source: entry.source,
        category: entry.category || null,
      });

      if (error) {
        errors.push(`Insert error for "${entry.title}": ${error.message}`);
      } else {
        imported++;
      }
    }

    console.log(`Import complete: ${imported} entries imported, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ success: true, imported, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Import error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
