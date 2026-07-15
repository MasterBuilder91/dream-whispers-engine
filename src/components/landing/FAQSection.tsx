import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "What makes this different from other Islamic dream interpretation apps?",
      answer: "This is the ONLY engine grounded in actual primary sources from classical scholars Ibn Sirin and Al-Nabulsi. Every single interpretation is cited with its exact source. Other apps fabricate interpretations or mix authentic content with made-up meanings — with no way to tell the difference."
    },
    {
      question: "How does the engine produce an interpretation?",
      answer: "Your dream symbols are matched against the classical corpus of Ibn Sirin and Al-Nabulsi. The relevant passages are retrieved and shown to you alongside the interpretation, so you can read the exact scholarly text behind every response and judge it for yourself."
    },
    {
      question: "How many dream interpretations are in the database?",
      answer: "Over 4,000 authentic interpretations from two of the most comprehensive dream interpretation texts in Islamic history: Ibn Sirin's classical work and Al-Nabulsi's \"Ta'tir al-Anam\" encyclopedia."
    },
    {
      question: "Can I see the original sources for interpretations?",
      answer: "Yes! Every interpretation shows which scholar it comes from, the entry title, and an excerpt from the original text. Complete transparency — no black boxes, no \"trust us\" claims."
    },
    {
      question: "Is this service free?",
      answer: "Yes — BinSirin is offered completely free as an Islamic khidma (service), seeking only the pleasure of Allah. Every feature — interpretations, the A–Z dictionary, and the dream journal — is open to everyone. If the tool benefits you, please consider supporting the effort so it continues and grows for the ummah."
    },
    {
      question: "What languages are supported?",
      answer: "Write your dream in Modern Standard Arabic OR any colloquial Arabic dialect — Egyptian, Levantine (Syrian, Lebanese, Palestinian, Jordanian), Gulf (Saudi, Emirati, Kuwaiti, Qatari), Iraqi, Maghrebi (Moroccan Darija, Algerian, Tunisian), Sudanese, Yemeni. You can also write in English, Urdu, Somali, Swahili, Turkish, Indonesian, Malay, or Spanish. Every interpretation is returned in both Modern Standard Arabic (فصحى) — preserving the original scholarly authority — and in your own language, so you can read the classical wisdom in the way you actually speak."
    },
    {
      question: "Who were Ibn Sirin and Al-Nabulsi?",
      answer: "Ibn Sirin (653-729 CE) was a Tabi'i scholar from Basra, considered the father of Islamic dream interpretation. Al-Nabulsi (1641-1731 CE) was a Damascus-based Sufi scholar who expanded on Ibn Sirin's work with his comprehensive encyclopedia \"Ta'tir al-Anam fi Ta'bir al-Manam.\""
    }
  ];

  return (
    <section className="py-12 sm:py-20" id="faq">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-gold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about authentic dream interpretation
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="dream-card rounded-xl border-none px-4 sm:px-6"
            >
              <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-foreground hover:text-gold hover:no-underline py-4 sm:py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 pb-4 sm:pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
