import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";
import { alphabet, symbolsByLetter, dreamSymbols } from "@/data/dreamSymbols";

const dictionaryJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "BinSirin Islamic Dream Dictionary",
  description:
    "A-Z dictionary of Islamic dream symbols compiled from the classical texts of Ibn Sirin and Al-Nabulsi.",
  hasDefinedTerm: dreamSymbols.map((s) => ({
    "@type": "DefinedTerm",
    name: s.name,
    alternateName: s.nameArabic,
    description: s.summary,
    url: `https://binsirin.com/dictionary/${s.slug}`,
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://binsirin.com/" },
    { "@type": "ListItem", position: 2, name: "Dream Dictionary", item: "https://binsirin.com/dictionary" },
  ],
};

export default function Dictionary() {
  const availableLetters = new Set(Object.keys(symbolsByLetter));

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <Helmet>
        <title>Islamic Dream Dictionary A–Z | Ibn Sirin & Al-Nabulsi | BinSirin</title>
        <meta
          name="description"
          content="A-Z Islamic dream dictionary. Browse dream symbols and their meanings from the classical texts of Ibn Sirin and Al-Nabulsi — every entry cited."
        />
        <link rel="canonical" href="https://binsirin.com/dictionary" />
        <meta property="og:title" content="Islamic Dream Dictionary A–Z | BinSirin" />
        <meta
          property="og:description"
          content="Browse dream symbols A–Z with authentic classical interpretations from Ibn Sirin and Al-Nabulsi."
        />
        <meta property="og:url" content="https://binsirin.com/dictionary" />
        <script type="application/ld+json">{JSON.stringify(dictionaryJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/60">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-serif tracking-tight sm:text-5xl">
            Islamic Dream Dictionary
          </h1>
          <p className="mt-2 text-lg text-muted-foreground" dir="rtl">
            قاموس تفسير الأحلام
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            An A–Z reference of dream symbols drawn from the classical works of{" "}
            <em>Muhammad Ibn Sirin</em> and <em>Abd al-Ghani al-Nabulsi</em>. Every entry cites
            the scholar it was compiled from.
          </p>
        </header>

        {/* A-Z jump nav */}
        <nav
          aria-label="Alphabet navigation"
          className="mb-10 flex flex-wrap justify-center gap-2 rounded-lg border border-border/50 bg-card/40 p-3"
        >
          {alphabet.map((letter) => {
            const available = availableLetters.has(letter);
            return available ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-primary/10 hover:text-primary"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted-foreground/40"
                aria-disabled="true"
              >
                {letter}
              </span>
            );
          })}
        </nav>

        {/* Sections by letter */}
        <div className="space-y-10">
          {alphabet
            .filter((l) => availableLetters.has(l))
            .map((letter) => (
              <section key={letter} id={`letter-${letter}`} aria-labelledby={`heading-${letter}`}>
                <h2
                  id={`heading-${letter}`}
                  className="mb-4 border-b border-border/60 pb-2 font-serif text-3xl"
                >
                  {letter}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {symbolsByLetter[letter].map((s) => (
                    <li key={s.slug}>
                      <Link
                        to={`/dictionary/${s.slug}`}
                        className="block h-full rounded-lg border border-border/60 bg-card/40 p-4 transition hover:border-primary/60 hover:bg-card/60"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-lg font-medium">{s.name}</span>
                          <span className="text-sm text-muted-foreground" dir="rtl">
                            {s.nameArabic}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>

        <footer className="mt-16 rounded-lg border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
          Entries summarized from <em>Tafsir al-Ahlam al-Kabir</em> by Ibn Sirin and{" "}
          <em>Ta'tir al-Anam fi Tabir al-Manam</em> by Al-Nabulsi. For a personal dream, use the{" "}
          <Link to="/" className="text-primary underline-offset-4 hover:underline">
            interpretation tool
          </Link>
          .
        </footer>
      </main>
    </div>
  );
}
