// Firecrawl-powered scraper for public Ibn Sirin / Al-Nabulsi dream sites.
// Admin-only: verifies caller has the `admin` role before running.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

interface SourceConfig {
  name: string;
  domain: string;
  language: "ar" | "en";
  scholar: string;
  urlLimit: number;
  search?: string;
}

const SOURCES: Record<string, SourceConfig> = {
  hurras: { name: "hurras.org", domain: "https://www.hurras.org", language: "ar", scholar: "Ibn Sirin", urlLimit: 200, search: "تفسير حلم" },
  tafseer: { name: "tafseer-alahlam.com", domain: "https://www.tafseer-alahlam.com", language: "ar", scholar: "Ibn Sirin", urlLimit: 200 },
  ibnsirin: { name: "ibnsirin.net", domain: "https://www.ibnsirin.net", language: "ar", scholar: "Ibn Sirin", urlLimit: 200 },
  dreamsnest: { name: "dreamsnest.com", domain: "https://dreamsnest.com", language: "en", scholar: "Ibn Sirin", urlLimit: 200, search: "ibn sirin" },
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "") // Arabic diacritics
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function extractSymbol(title: string, lang: "ar" | "en"): string {
  // Grab the symbol word from a title like "تفسير حلم الأسد" or "Dream of a Lion"
  let t = title.trim();
  if (lang === "ar") {
    t = t.replace(/^(تفسير\s+)?(رؤية\s+|حلم\s+|رؤيا\s+)/, "").trim();
  } else {
    t = t.replace(/^(dream(ing)?\s+(of|about)\s+|meaning\s+of\s+)/i, "").trim();
  }
  return t.split(/[\-–—|:،,]/)[0].trim().slice(0, 100);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth: require admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const sourceKey: string = body.source;
    const maxPages: number = Math.min(body.maxPages ?? 30, 100);
    const cfg = SOURCES[sourceKey];
    if (!cfg) {
      return new Response(JSON.stringify({
        error: "Unknown source",
        available: Object.keys(SOURCES),
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1. Map the domain to discover URLs
    const mapRes = await fetch(`${FIRECRAWL_V2}/map`, {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: cfg.domain, search: cfg.search, limit: cfg.urlLimit }),
    });
    if (!mapRes.ok) {
      const errBody = await mapRes.text();
      return new Response(JSON.stringify({ error: "Firecrawl map failed", details: errBody }), {
        status: mapRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const mapData = await mapRes.json();
    const links: string[] = (mapData.links || mapData.data?.links || []).map((l: any) => typeof l === "string" ? l : l.url).filter(Boolean).slice(0, maxPages);

    // 2. Scrape each URL and upsert
    let inserted = 0, skipped = 0, failed = 0;
    for (const url of links) {
      try {
        const scRes = await fetch(`${FIRECRAWL_V2}/scrape`, {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
        });
        if (!scRes.ok) { failed++; continue; }
        const scData = await scRes.json();
        const doc = scData.data || scData;
        const title: string = doc.metadata?.title || "";
        const markdown: string = doc.markdown || "";
        if (!title || markdown.length < 80) { skipped++; continue; }

        const symbol = extractSymbol(title, cfg.language);
        const slug = slugify(symbol);
        if (!slug) { skipped++; continue; }

        // Excerpt only for modern sites (≤300 chars) — attribution, not republication
        const excerpt = markdown.replace(/\s+/g, " ").trim().slice(0, 300);

        const row = {
          symbol_slug: slug,
          symbol_en: cfg.language === "en" ? symbol : null,
          symbol_ar: cfg.language === "ar" ? symbol : null,
          interpretation_en: cfg.language === "en" ? excerpt : null,
          interpretation_ar: cfg.language === "ar" ? excerpt : null,
          source_url: url,
          source_name: cfg.name,
          scholar: cfg.scholar,
          language: cfg.language,
        };

        const { error } = await admin.from("symbol_interpretations")
          .upsert(row, { onConflict: "symbol_slug,source_url" });
        if (error) { failed++; console.error("upsert error:", error.message); }
        else inserted++;

        // Small rate limit
        await new Promise(r => setTimeout(r, 250));
      } catch (e) {
        failed++;
        console.error("scrape err", url, e);
      }
    }

    return new Response(JSON.stringify({
      success: true, source: cfg.name, discovered: links.length, inserted, skipped, failed,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("scrape-dream-sources error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
