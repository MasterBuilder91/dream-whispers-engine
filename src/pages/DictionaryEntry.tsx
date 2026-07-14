import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { dreamSymbols } from "@/data/dreamSymbols";

export default function DictionaryEntry() {
  const { slug } = useParams<{ slug: string }>();
  const symbol = dreamSymbols.find((s) => s.slug === slug);

  if (!symbol) {
    return <Navigate to="/dictionary" replace />;
  }

  const url = `https://binsirin.com/dictionary/${symbol.slug}`;

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
    publisher: {
      "@type": "Organization",
      name: "BinSirin",
      url: "https://binsirin.com/",
    },
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

  const title = `${symbol.name} (${symbol.nameArabic}) in Dreams — Islamic Interpretation | BinSirin`;
  const description = `${symbol.name} in Islamic dream interpretation: ${symbol.summary} Cited from Ibn Sirin and Al-Nabulsi.`;

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

        <Link
          to="/dictionary"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All symbols
        </Link>

        <article>
          <header className="mb-8 border-b border-border/60 pb-6">
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="font-serif text-4xl sm:text-5xl">{symbol.name}</h1>
              <span className="text-2xl text-muted-foreground" dir="rtl">
                {symbol.nameArabic}
              </span>
            </div>
            <p className="mt-3 text-lg text-muted-foreground">{symbol.summary}</p>
          </header>

          <section className="mb-10">
            <h2 className="mb-3 font-serif text-2xl">Interpretation</h2>
            <p className="leading-relaxed">{symbol.interpretation}</p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl">
              <BookOpen className="h-5 w-5" />
              From the classical scholars
            </h2>
            <div className="space-y-4">
              {symbol.scholars.map((entry, i) => (
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
            The interpretation of a specific dream depends on its full context, the state of the
            dreamer, and other symbols present. For a personal reading grounded in the same
            classical sources, use the{" "}
            <Link to="/" className="text-primary underline-offset-4 hover:underline">
              BinSirin interpretation tool
            </Link>
            .
          </aside>
        </article>
      </main>
    </div>
  );
}
