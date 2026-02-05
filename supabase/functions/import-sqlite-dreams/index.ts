import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ImportResult {
  source: string;
  tables: string[];
  columns: Record<string, string[]>;
  rowCount: number;
  imported: number;
  sampleData: Record<string, unknown>[];
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dbUrl, source } = await req.json();

    if (!dbUrl || !source) {
      return new Response(
        JSON.stringify({ error: "dbUrl and source are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching SQLite database from: ${dbUrl}`);

    // Fetch the SQLite file
    const response = await fetch(dbUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch database: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Write to temp file (Deno sqlite requires file path)
    const tempPath = `/tmp/${source}_${Date.now()}.db`;
    await Deno.writeFile(tempPath, uint8Array);

    console.log(`Database saved to ${tempPath}, size: ${uint8Array.length} bytes`);

    // Open database
    const db = new DB(tempPath);

    // Get tables
    const tablesQuery = db.query<[string]>("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = tablesQuery.map(([name]) => name);

    console.log(`Found tables: ${tables.join(", ")}`);

    const result: ImportResult = {
      source,
      tables,
      columns: {},
      rowCount: 0,
      imported: 0,
      sampleData: [],
      errors: [],
    };

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process each table
    for (const table of tables) {
      try {
        // Get columns
        const columnsQuery = db.query<[number, string, string, number, unknown, number]>(
          `PRAGMA table_info(${table})`
        );
        const columns = columnsQuery.map(([, name]) => name);
        result.columns[table] = columns;

        console.log(`Table ${table} columns: ${columns.join(", ")}`);

        // Get all rows
        const rows = db.query(`SELECT * FROM ${table}`);
        result.rowCount += rows.length;

        // Map columns to our schema
        const titleIdx = columns.findIndex((c) => 
          c.toLowerCase().includes("title") || 
          c.toLowerCase().includes("name") ||
          c.toLowerCase() === "word" ||
          c.toLowerCase() === "symbol"
        );
        const titleArabicIdx = columns.findIndex((c) => 
          c.toLowerCase().includes("arabic") || 
          c.toLowerCase().includes("word_ar") ||
          c.toLowerCase().includes("title_ar")
        );
        const contentIdx = columns.findIndex((c) => 
          c.toLowerCase().includes("content") || 
          c.toLowerCase().includes("meaning") ||
          c.toLowerCase().includes("interpretation") ||
          c.toLowerCase().includes("text") ||
          c.toLowerCase().includes("description") ||
          c.toLowerCase().includes("tafsir")
        );
        const categoryIdx = columns.findIndex((c) => 
          c.toLowerCase().includes("category") || 
          c.toLowerCase().includes("chapter") ||
          c.toLowerCase().includes("bab")
        );

        console.log(`Column mapping - title: ${titleIdx}, titleArabic: ${titleArabicIdx}, content: ${contentIdx}, category: ${categoryIdx}`);

        // If no title column found, try to use first text column
        const effectiveTitleIdx = titleIdx >= 0 ? titleIdx : 0;
        const effectiveContentIdx = contentIdx >= 0 ? contentIdx : (columns.length > 1 ? 1 : 0);

        // Store sample data
        if (rows.length > 0) {
          const sampleRow: Record<string, unknown> = {};
          columns.forEach((col, i) => {
            sampleRow[col] = rows[0][i];
          });
          result.sampleData.push(sampleRow);
        }

        // Batch insert
        const entries = [];
        for (const row of rows) {
          const title = row[effectiveTitleIdx];
          const content = row[effectiveContentIdx];

          if (title && content && String(title).trim() && String(content).trim()) {
            entries.push({
              title: String(title).slice(0, 500),
              title_arabic: titleArabicIdx >= 0 && row[titleArabicIdx] ? String(row[titleArabicIdx]) : null,
              content: String(content),
              source: source,
              category: categoryIdx >= 0 && row[categoryIdx] ? String(row[categoryIdx]) : null,
            });
          }
        }

        // Insert in batches
        const batchSize = 100;
        for (let i = 0; i < entries.length; i += batchSize) {
          const batch = entries.slice(i, i + batchSize);
          const { error } = await supabase.from("dream_interpretations").insert(batch);
          
          if (error) {
            result.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
            console.error(`Insert error:`, error);
          } else {
            result.imported += batch.length;
          }
        }

        console.log(`Table ${table}: ${entries.length} entries prepared, ${result.imported} imported`);

      } catch (tableErr) {
        const errMsg = tableErr instanceof Error ? tableErr.message : String(tableErr);
        result.errors.push(`Table ${table}: ${errMsg}`);
        console.error(`Error processing table ${table}:`, tableErr);
      }
    }

    // Cleanup
    db.close();
    try {
      await Deno.remove(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    console.log(`Import complete: ${result.imported} entries imported, ${result.errors.length} errors`);

    return new Response(
      JSON.stringify(result),
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
