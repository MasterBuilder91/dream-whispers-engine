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
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
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

          // Try to extract entries - common column patterns
          let entries: DreamEntry[] = [];

          for (const table of tables) {
            try {
              // Get columns
              const columnsResult = db.exec(`PRAGMA table_info(${table})`);
              const columns = columnsResult[0]?.values.map((v) => String(v[1])) || [];
              console.log(`${dbFile.name} - ${table} columns:`, columns);

              // Try to read all data
              const dataResult = db.exec(`SELECT * FROM ${table} LIMIT 5000`);
              if (dataResult[0]) {
                const rows = dataResult[0].values;
                const cols = dataResult[0].columns;

                console.log(`${dbFile.name} - ${table}: ${rows.length} rows, columns: ${cols.join(", ")}`);

                // Map columns to our schema
                const titleIdx = cols.findIndex((c) => 
                  c.toLowerCase().includes("title") || 
                  c.toLowerCase().includes("name") ||
                  c.toLowerCase() === "word"
                );
                const titleArabicIdx = cols.findIndex((c) => 
                  c.toLowerCase().includes("arabic") || 
                  c.toLowerCase().includes("word_ar")
                );
                const contentIdx = cols.findIndex((c) => 
                  c.toLowerCase().includes("content") || 
                  c.toLowerCase().includes("meaning") ||
                  c.toLowerCase().includes("interpretation") ||
                  c.toLowerCase().includes("text") ||
                  c.toLowerCase().includes("description")
                );
                const categoryIdx = cols.findIndex((c) => 
                  c.toLowerCase().includes("category") || 
                  c.toLowerCase().includes("chapter")
                );

                // If we can't find title but have content, use first text column as title
                const firstTextIdx = titleIdx >= 0 ? titleIdx : cols.findIndex((c, i) => 
                  i !== contentIdx && typeof rows[0]?.[i] === "string"
                );

                for (const row of rows) {
                  const title = row[titleIdx >= 0 ? titleIdx : firstTextIdx];
                  const content = row[contentIdx >= 0 ? contentIdx : (titleIdx >= 0 ? titleIdx : 0)];
                  
                  if (title && content) {
                    entries.push({
                      title: String(title).slice(0, 200),
                      title_arabic: titleArabicIdx >= 0 ? String(row[titleArabicIdx] || "") : undefined,
                      content: String(content),
                      source: dbFile.source,
                      category: categoryIdx >= 0 ? String(row[categoryIdx] || "") : undefined,
                    });
                  }
                }
              }
            } catch (tableErr) {
              console.error(`Error reading table ${table}:`, tableErr);
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
