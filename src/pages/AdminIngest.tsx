import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Download, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SOURCES = [
  { key: "hurras", label: "hurras.org (Arabic, Ibn Sirin)" },
  { key: "tafseer", label: "tafseer-alahlam.com (Arabic)" },
  { key: "ibnsirin", label: "ibnsirin.net (Arabic)" },
  { key: "dreamsnest", label: "dreamsnest.com (English)" },
];

const SCRAPE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-dream-sources`;

export default function AdminIngest() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [counts, setCounts] = useState<{ total: number }>({ total: 0 });

  useEffect(() => {
    (async () => {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase.rpc("is_admin", { _user_id: user.id });
      setIsAdmin(!!data);
      const { count } = await supabase
        .from("symbol_interpretations")
        .select("*", { count: "exact", head: true });
      setCounts({ total: count ?? 0 });
    })();
  }, [user]);

  const runScrape = async (source: string, maxPages: number) => {
    setRunning(source);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch(SCRAPE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ source, maxPages }),
      });
      const json = await res.json();
      setResults((r) => ({ ...r, [source]: json }));
      if (!res.ok) throw new Error(json.error || "Scrape failed");
      toast({ title: "Ingest complete", description: `${source}: +${json.inserted} rows` });
      const { count } = await supabase
        .from("symbol_interpretations")
        .select("*", { count: "exact", head: true });
      setCounts({ total: count ?? 0 });
    } catch (e) {
      toast({
        title: "Ingest failed",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setRunning(null);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-serif mb-2">Admin only</h1>
            <p className="text-muted-foreground text-sm">
              You need admin privileges to access the ingest console.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-gradient-gold">BinSirin — Data Ingest</h1>
          <p className="text-muted-foreground mt-1">
            Scrape public Ibn Sirin dream sources via Firecrawl. Stored as ≤300-char excerpts with attribution.
          </p>
          <p className="text-sm text-gold mt-2">Rows in symbol_interpretations: {counts.total.toLocaleString()}</p>
        </div>

        {SOURCES.map((s) => (
          <Card key={s.key}>
            <CardHeader>
              <CardTitle className="text-lg">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!running}
                  onClick={() => runScrape(s.key, 10)}
                >
                  {running === s.key ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  Test (10 pages)
                </Button>
                <Button
                  size="sm"
                  disabled={!!running}
                  onClick={() => runScrape(s.key, 50)}
                >
                  Ingest 50
                </Button>
                <Button
                  size="sm"
                  disabled={!!running}
                  onClick={() => runScrape(s.key, 100)}
                >
                  Ingest 100
                </Button>
              </div>
              {results[s.key] && (
                <pre className="text-xs bg-secondary/40 rounded p-3 overflow-auto">
                  {JSON.stringify(results[s.key], null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
