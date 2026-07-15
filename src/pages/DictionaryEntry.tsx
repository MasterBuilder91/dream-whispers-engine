import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { dreamSymbols } from "@/data/dreamSymbols";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = [
  { code: "en", label: "English", dir: "ltr" as const },
  { code: "ar", label: "العربية", dir: "rtl" as const },
  { code: "ur", label: "اردو", dir: "rtl" as const },
  { code: "so", label: "Af-Soomaali", dir: "ltr" as const },
  { code: "sw", label: "Kiswahili", dir: "ltr" as const },
  { code: "tr", label: "Türkçe", dir: "ltr" as const },
  { code: "id", label: "Bahasa Indonesia", dir: "ltr" as const },
  { code: "ms", label: "Bahasa Melayu", dir: "ltr" as const },
  { code: "es", label: "Español", dir: "ltr" as const },
];

const UI = {
  en: { interpretation: "Interpretation", scholars: "From the classical scholars", allSymbols: "All symbols", note: "The interpretation of a specific dream depends on its full context, the state of the dreamer, and other symbols present. For a personal reading grounded in the same classical sources, use the", tool: "BinSirin interpretation tool", loading: "Translating…", failed: "Translation unavailable — showing English." },
  ar: { interpretation: "التفسير", scholars: "من أقوال العلماء الكلاسيكيين", allSymbols: "كل الرموز", note: "يعتمد تفسير أي رؤيا على سياقها الكامل وحال الرائي والرموز الأخرى الحاضرة. للحصول على تفسير شخصي مبني على المصادر الكلاسيكية ذاتها، استخدم", tool: "أداة تفسير بن سيرين", loading: "جاري الترجمة…", failed: "تعذّرت الترجمة — عرض النص الإنجليزي." },
  ur: { interpretation: "تعبیر", scholars: "کلاسیکی علماء سے", allSymbols: "تمام علامات", note: "کسی مخصوص خواب کی تعبیر اس کے مکمل سیاق، خواب دیکھنے والے کی حالت اور دیگر موجود علامات پر منحصر ہے۔ ذاتی تعبیر کے لیے", tool: "بن سیرین تعبیر ٹول", loading: "ترجمہ ہو رہا ہے…", failed: "ترجمہ دستیاب نہیں — انگریزی متن دکھایا جا رہا ہے۔" },
  so: { interpretation: "Fasiraadda", scholars: "Culimada qadiimka ah", allSymbols: "Dhammaan calaamadaha", note: "Fasiraadda riyada gaarka ah waxay ku xiran tahay guud ahaan xaaladda iyo calaamadaha kale. Fasiraad shakhsi ah oo ku salaysan isla ilaha, isticmaal", tool: "Aaladda BinSirin", loading: "Waa la turjumayaa…", failed: "Turjumaad lama helin — Ingiriisi ayaa la muujiyay." },
  sw: { interpretation: "Tafsiri", scholars: "Kutoka kwa wanazuoni wa kale", allSymbols: "Alama zote", note: "Tafsiri ya ndoto maalum inategemea muktadha wake wote, hali ya mwotaji, na alama nyingine zilizopo. Kwa tafsiri ya kibinafsi kwa vyanzo hivyo hivyo vya kale, tumia", tool: "Zana ya BinSirin", loading: "Inatafsiri…", failed: "Tafsiri haipatikani — inaonyeshwa kwa Kiingereza." },
  tr: { interpretation: "Yorum", scholars: "Klasik alimlerden", allSymbols: "Tüm semboller", note: "Belirli bir rüyanın yorumu, tüm bağlamına, rüya sahibinin haline ve mevcut diğer sembollere bağlıdır. Aynı klasik kaynaklara dayalı kişisel bir yorum için", tool: "BinSirin yorum aracını", loading: "Çevriliyor…", failed: "Çeviri mevcut değil — İngilizce gösteriliyor." },
  id: { interpretation: "Tafsir", scholars: "Dari para ulama klasik", allSymbols: "Semua simbol", note: "Tafsir sebuah mimpi tertentu bergantung pada konteks lengkapnya, keadaan si pemimpi, dan simbol-simbol lain yang hadir. Untuk pembacaan pribadi berdasarkan sumber klasik yang sama, gunakan", tool: "alat tafsir BinSirin", loading: "Menerjemahkan…", failed: "Terjemahan tidak tersedia — menampilkan bahasa Inggris." },
  ms: { interpretation: "Tafsir", scholars: "Daripada ulama klasik", allSymbols: "Semua simbol", note: "Tafsir mimpi tertentu bergantung kepada konteks penuhnya, keadaan pemimpi, dan simbol-simbol lain yang hadir. Untuk bacaan peribadi berdasarkan sumber klasik yang sama, gunakan", tool: "alat tafsir BinSirin", loading: "Menterjemah…", failed: "Terjemahan tidak tersedia — memaparkan bahasa Inggeris." },
  es: { interpretation: "Interpretación", scholars: "De los eruditos clásicos", allSymbols: "Todos los símbolos", note: "La interpretación de un sueño concreto depende de su contexto completo, del estado del soñador y de los otros símbolos presentes. Para una lectura personal basada en las mismas fuentes clásicas, use", tool: "la herramienta BinSirin", loading: "Traduciendo…", failed: "Traducción no disponible — mostrando inglés." },
} as const;

interface Translation {
  name: string;
  summary: string;
  interpretation: string;
  scholars: { scholar: "Ibn Sirin" | "Al-Nabulsi"; text: string }[];
}

export default function DictionaryEntry() {
  const { slug } = useParams<{ slug: string }>();
  const symbol = dreamSymbols.find((s) => s.slug === slug);
  const [language, setLanguage] = useState<string>("en");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!symbol || language === "en") {
      setTranslation(null);
      setFailed(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    supabase.functions
      .invoke("translate-symbol", {
        body: {
          language,
          symbol: {
            slug: symbol.slug,
            name: symbol.name,
            nameArabic: symbol.nameArabic,
            summary: symbol.summary,
            interpretation: symbol.interpretation,
            scholars: symbol.scholars,
          },
        },
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.translation) {
          setFailed(true);
          setTranslation(null);
        } else {
          setTranslation(data.translation as Translation);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language, symbol]);

  if (!symbol) {
    return <Navigate to="/dictionary" replace />;
  }

  const langMeta = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  const ui = UI[language as keyof typeof UI] ?? UI.en;
  const displayName = translation?.name ?? symbol.name;
  const displaySummary = translation?.summary ?? symbol.summary;
  const displayInterpretation = translation?.interpretation ?? symbol.interpretation;
  const displayScholars = translation?.scholars ?? symbol.scholars;
  const dir = langMeta.dir;

  const url = `https://binsirin.com/dictionary/${symbol.slug}`;
  const title = `${symbol.name} (${symbol.nameArabic}) in Dreams — Islamic Interpretation | BinSirin`;
  const description = `${symbol.name} in Islamic dream interpretation: ${symbol.summary} Cited from Ibn Sirin and Al-Nabulsi.`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${symbol.name} in Islamic Dream Interpretation`,
    description: symbol.summary,
    inLanguage: "en",
    mainEntityOfPage: url,
    author: [
      { "@type": "Person", name: "Muhammad Ibn Sirin" },
      { "@type": "Person", name: "Abd al-Ghani al-Nabulsi" },
    ],
    publisher: { "@type": "Organization", name: "BinSirin", url: "https://binsirin.com/" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://binsirin.com/" },
      { "@type": "ListItem", position: 2, name: "Dream Dictionary", item: "https://binsirin.com/dictionary" },
      { "@type": "ListItem", position: 3, name: symbol.name, item: url },
    ],
  };

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <main className="container mx-auto max-w-3xl px-4 py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/dictionary" className="hover:text-foreground">Dictionary</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{symbol.name}</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dictionary"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {ui.allSymbols}
          </Link>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-border/60 bg-card/60 px-2 py-1 text-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </label>
        </div>

        {failed && (
          <p className="mb-4 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm text-muted-foreground">
            {ui.failed}
          </p>
        )}

        <article dir={dir}>
          <header className="mb-8 border-b border-border/60 pb-6">
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="font-serif text-4xl sm:text-5xl">{displayName}</h1>
              <span className="text-2xl text-muted-foreground" dir="rtl">
                {symbol.nameArabic}
              </span>
            </div>
            <p className="mt-3 text-lg text-muted-foreground">
              {loading && !translation ? ui.loading : displaySummary}
            </p>
          </header>

          <section className="mb-10">
            <h2 className="mb-3 font-serif text-2xl">{ui.interpretation}</h2>
            <p className="leading-relaxed">
              {loading && !translation ? ui.loading : displayInterpretation}
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl">
              <BookOpen className="h-5 w-5" />
              {ui.scholars}
            </h2>
            <div className="space-y-4">
              {displayScholars.map((entry, i) => (
                <blockquote
                  key={i}
                  className="rounded-lg border border-border/60 bg-card/40 p-5"
                >
                  <p className="italic leading-relaxed">"{entry.text}"</p>
                  <footer className="mt-3 text-sm font-medium text-muted-foreground">
                    — {entry.scholar}
                    {entry.scholar === "Ibn Sirin"
                      ? ", Tafsir al-Ahlam al-Kabir"
                      : ", Ta'tir al-Anam fi Tabir al-Manam"}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          <aside className="rounded-lg border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
            {ui.note}{" "}
            <Link to="/" className="text-primary underline-offset-4 hover:underline">
              {ui.tool}
            </Link>
            .
          </aside>
        </article>
      </main>
    </div>
  );
}
