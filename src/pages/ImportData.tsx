import { useState, useEffect } from "react";
import initSqlJs, { Database } from "sql.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Database as DbIcon, Upload, CheckCircle } from "lucide-react";

interface DreamEntry {
  title: string;
  title_arabic?: string;
  content: string;
  source: "ibn_sirin" | "al_nabulsi";
  category?: string;
}

interface DbInfo {
  name: string;
  source: "ibn_sirin" | "al_nabulsi";
  tables: string[];
  entries: DreamEntry[];
  rowCount: number;
}

const IMPORT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-dream-data`;

export default function ImportData() {
  const [loading, setLoading] = useState(true);
  const [databases, setDatabases] = useState<DbInfo[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ source: string; imported: number; errors: string[] }[]>([]);

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: () => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm`,
      });

      const dbFiles = [
        { path: "/databases/ibn_sirin.db", source: "ibn_sirin" as const, name: "Ibn Sirin" },
        { path: "/databases/al_nabulsi.db", source: "al_nabulsi" as const, name: "Al-Nabulsi" },
      ];

      const loadedDbs: DbInfo[] = [];

      for (const dbFile of dbFiles) {
        try {
          const response = await fetch(dbFile.path);
          if (!response.ok) {
            console.error(`Failed to load ${dbFile.path}`);
            continue;
          }

          const buffer = await response.arrayBuffer();
          const db = new SQL.Database(new Uint8Array(buffer));

          // Get table names
          const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
          const tables = tablesResult[0]?.values.map((v) => String(v[0])) || [];

          console.log(`${dbFile.name} tables:`, tables);

          let entries: DreamEntry[] = [];

          // For Ibn Sirin - try dream_interpretation_analysis first, then fall back to pages
          if (dbFile.source === "ibn_sirin") {
            // Try dream_interpretation_analysis table first
            try {
              const dataResult = db.exec(`SELECT symbol, interpretation, context, symbolic_category FROM dream_interpretation_analysis`);
              if (dataResult[0] && dataResult[0].values.length > 0) {
                const rows = dataResult[0].values;
                console.log(`Ibn Sirin dream_interpretation_analysis: ${rows.length} rows`);
                
                for (const row of rows) {
                  const symbol = row[0];
                  const interpretation = row[1];
                  const context = row[2];
                  const category = row[3];
                  
                  if (symbol && interpretation && String(interpretation).trim().length > 10) {
                    const fullContent = context 
                      ? `${interpretation}\n\nسياق: ${context}`
                      : String(interpretation);
                    
                    entries.push({
                      title: String(symbol).slice(0, 200),
                      title_arabic: String(symbol),
                      content: fullContent,
                      source: dbFile.source,
                      category: category ? String(category) : undefined,
                    });
                  }
                }
              }
            } catch (err) {
              console.error("Error reading Ibn Sirin analysis:", err);
            }

            // If no entries from analysis table, use pages table
            if (entries.length === 0) {
              try {
                const pagesResult = db.exec(`SELECT page_title, clean_text, dream_categories, dream_symbols FROM pages WHERE clean_text IS NOT NULL AND clean_text != ''`);
                if (pagesResult[0]) {
                  const rows = pagesResult[0].values;
                  console.log(`Ibn Sirin pages: ${rows.length} rows with content`);
                  
                  for (const row of rows) {
                    const pageTitle = row[0];
                    const cleanText = row[1];
                    const categories = row[2];
                    const symbols = row[3];
                    
                    if (cleanText && String(cleanText).trim().length > 50) {
                      // Use page title or first symbol as title
                      let title = pageTitle ? String(pageTitle) : "";
                      if (!title && symbols) {
                        try {
                          const symbolsData = JSON.parse(String(symbols));
                          if (Array.isArray(symbolsData) && symbolsData.length > 0) {
                            title = symbolsData[0];
                          }
                        } catch {
                          title = String(symbols).slice(0, 50);
                        }
                      }
                      if (!title) {
                        title = `صفحة ابن سيرين`;
                      }
                      
                      entries.push({
                        title: title.slice(0, 200),
                        title_arabic: title,
                        content: String(cleanText),
                        source: dbFile.source,
                        category: categories ? String(categories) : undefined,
                      });
                    }
                  }
                }
              } catch (err) {
                console.error("Error reading Ibn Sirin pages:", err);
              }
            }
          }

          // For Al-Nabulsi - use dream_symbols table
          if (dbFile.source === "al_nabulsi") {
            try {
              const dataResult = db.exec(`SELECT symbol_name, interpretation_text, symbol_category, positive_meaning, negative_meaning, contextual_factors, prophetic_basis FROM dream_symbols`);
              if (dataResult[0]) {
                const rows = dataResult[0].values;
                console.log(`Al-Nabulsi dream_symbols: ${rows.length} rows`);
                
                for (const row of rows) {
                  const symbolName = row[0];
                  const interpretation = row[1];
                  const category = row[2];
                  const positive = row[3];
                  const negative = row[4];
                  const contextual = row[5];
                  const prophetic = row[6];
                  
                  if (symbolName && interpretation && String(interpretation).trim().length > 10) {
                    // Build comprehensive content
                    let fullContent = String(interpretation);
                    
                    if (positive && String(positive).trim()) {
                      fullContent += `\n\nالمعنى الإيجابي: ${positive}`;
                    }
                    if (negative && String(negative).trim()) {
                      fullContent += `\n\nالمعنى السلبي: ${negative}`;
                    }
                    if (contextual && String(contextual).trim()) {
                      fullContent += `\n\nالعوامل السياقية: ${contextual}`;
                    }
                    if (prophetic && String(prophetic).trim()) {
                      fullContent += `\n\nالأساس النبوي: ${prophetic}`;
                    }
                    
                    entries.push({
                      title: String(symbolName).slice(0, 200),
                      title_arabic: String(symbolName),
                      content: fullContent,
                      source: dbFile.source,
                      category: category ? String(category) : undefined,
                    });
                  }
                }
              }
            } catch (err) {
              console.error("Error reading Al-Nabulsi symbols:", err);
            }
          }

          loadedDbs.push({
            name: dbFile.name,
            source: dbFile.source,
            tables,
            entries,
            rowCount: entries.length,
          });

          db.close();
        } catch (err) {
          console.error(`Error loading ${dbFile.name}:`, err);
        }
      }

      setDatabases(loadedDbs);
    } catch (err) {
      console.error("Failed to initialize SQL.js:", err);
      toast({
        title: "Error",
        description: "Failed to load database reader",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importDatabase = async (dbInfo: DbInfo) => {
    if (dbInfo.entries.length === 0) {
      toast({
        title: "No entries",
        description: "No valid entries found in this database",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      // Import in batches of 50
      const batchSize = 50;
      let totalImported = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < dbInfo.entries.length; i += batchSize) {
        const batch = dbInfo.entries.slice(i, i + batchSize);

        const response = await fetch(IMPORT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ entries: batch }),
        });

        const result = await response.json();

        if (result.imported) {
          totalImported += result.imported;
        }
        if (result.errors?.length) {
          allErrors.push(...result.errors);
        }
      }

      setImportResults((prev) => [
        ...prev,
        { source: dbInfo.name, imported: totalImported, errors: allErrors },
      ]);

      toast({
        title: "Import Complete",
        description: `Imported ${totalImported} entries from ${dbInfo.name}`,
      });
    } catch (err) {
      console.error("Import error:", err);
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
          <span>Loading databases...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif text-gradient-gold mb-8">Import Dream Databases</h1>

        {databases.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">No databases found in /public/databases/</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {databases.map((db) => (
              <Card key={db.source}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <DbIcon className="w-5 h-5 text-gold" />
                    {db.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tables:</span>{" "}
                        <span>{db.tables.join(", ") || "None found"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Entries found:</span>{" "}
                        <span className="text-gold font-semibold">{db.rowCount}</span>
                      </div>
                    </div>

                    {db.entries.length > 0 && (
                      <div className="bg-secondary/30 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-2">Sample entry:</p>
                        <p className="font-semibold">{db.entries[0].title}</p>
                        {db.entries[0].title_arabic && (
                          <p className="text-sm text-gold" dir="rtl">{db.entries[0].title_arabic}</p>
                        )}
                        <p className="text-sm text-foreground/70 mt-2 line-clamp-3">
                          {db.entries[0].content}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => importDatabase(db)}
                      disabled={importing || db.entries.length === 0}
                      className="w-full"
                    >
                      {importing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Import {db.rowCount} entries to Supabase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {importResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gold" />
                    Import Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {importResults.map((result, i) => (
                    <div key={i} className="py-2 border-b border-border/50 last:border-0">
                      <p>
                        <span className="font-semibold">{result.source}:</span>{" "}
                        <span className="text-gold">{result.imported} imported</span>
                        {result.errors.length > 0 && (
                          <span className="text-destructive ml-2">({result.errors.length} errors)</span>
                        )}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            ← Back to Dream Interpreter
          </Button>
        </div>
      </div>
    </div>
  );
}
