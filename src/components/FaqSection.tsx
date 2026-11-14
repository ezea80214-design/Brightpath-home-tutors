import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export function FaqSection() {
  const [searchParams] = useSearchParams();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = siteConfig.home.faqs;

  useEffect(() => {
    const faqParam = searchParams.get('faq');
    if (faqParam !== null) {
      const parsed = Number.parseInt(faqParam, 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed < faqs.length) {
        setOpenIndex(parsed);
      }
    }
  }, [searchParams, faqs.length]);

  if (faqs.length === 0) return null;

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      aria-labelledby="faq-heading"
      className="py-16 sm:py-20 bg-[#F8FAFC] border-t border-slate-200"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Intro Column */}
          <div className="lg:col-span-5 space-y-5">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.home.faqKicker}
            </p>
            <h2
              id="faq-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] leading-tight tracking-tight"
            >
              {siteConfig.home.faqTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {siteConfig.home.faqIntro}
            </p>
            <div className="pt-2">
              <Link
                to="/contact#enquiry"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C59B38]"
              >
                <span>Have another question? Ask our coordinator</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Accordion Questions Column */}
          <div className="lg:col-span-7 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;

              return (
                <div key={item.question}>
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => toggleItem(index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full px-6 py-5 sm:px-7 sm:py-6 flex items-start justify-between gap-4 text-left hover:bg-[#FCF9F0]/60 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#C59B38]"
                    >
                      <span className="flex items-baseline gap-3 pr-2">
                        <span className="font-display text-sm font-semibold text-[#8C6A1B] tabular-nums shrink-0">
                          {String(index + 1).padStart(2, '0')}.
                        </span>
                        <span className="font-display text-lg sm:text-xl font-semibold text-[#0B1F3A] leading-snug">
                          {item.question}
                        </span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#0B1F3A] shrink-0 mt-1 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#8C6A1B]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-6 pb-6 sm:px-7 sm:pb-7 pl-6 sm:pl-14 text-sm sm:text-base text-slate-600 leading-relaxed"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
