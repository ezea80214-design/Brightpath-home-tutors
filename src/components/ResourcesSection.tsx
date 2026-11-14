import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

type ResourceItem = (typeof siteConfig.home.resources)[number];

export function ResourcesSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);
  const resources = siteConfig.home.resources;

  useEffect(() => {
    const resourceId = searchParams.get('resource');
    if (!resourceId) return;
    const matched = resources.find((item) => item.id === resourceId);
    if (matched) {
      setActiveResource(matched);
    }
  }, [searchParams, resources]);

  const closeActiveResource = () => {
    setActiveResource(null);
    if (searchParams.has('resource')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('resource');
      setSearchParams(nextParams, { replace: true });
    }
  };

  useEffect(() => {
    if (!activeResource) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeActiveResource();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeResource]);

  if (!resources || resources.length === 0) return null;

  return (
    <section
      aria-labelledby="resources-heading"
      className="py-16 sm:py-20 bg-white border-t border-slate-200"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.home.resourcesKicker}
            </p>
            <h2
              id="resources-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] tracking-tight"
            >
              {siteConfig.home.resourcesTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {siteConfig.home.resourcesIntro}
            </p>
          </div>

          <Link
            to="/contact#enquiry"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C59B38]"
          >
            <span>Need tailored study guidance?</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Study Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {resources.map((guide, index) => (
            <article
              key={guide.id}
              className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-[#F8FAFC] flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="tabular-nums text-[#8C6A1B] font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.readTime}</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-[#0B1F3A] leading-snug">
                  {guide.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {guide.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-500">
                  {guide.audience}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveResource(guide)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0B1F3A] bg-white border border-slate-300 rounded-lg hover:border-[#0B1F3A] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
                >
                  <span>Read study guide</span>
                  <ArrowRight className="w-4 h-4 text-[#8C6A1B]" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Reader Dialog */}
      {activeResource && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#071529]/65 backdrop-blur-xs"
          onClick={closeActiveResource}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 space-y-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="text-[#8C6A1B] font-semibold">{activeResource.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeResource.readTime}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeResource.audience}</span>
                </div>
                <h3
                  id="resource-dialog-title"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A] leading-tight"
                >
                  {activeResource.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeActiveResource}
                aria-label="Close study guide"
                className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-50 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#C59B38]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 text-base text-slate-700 leading-relaxed">
              {activeResource.bodyParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="p-5 sm:p-6 rounded-xl bg-[#FCF9F0] border border-[#C59B38]/30 space-y-3">
              <p className="text-sm font-semibold text-[#0B1F3A]">
                Practical Steps You Can Try This Week
              </p>
              <ul className="space-y-2.5 text-sm text-slate-700">
                {activeResource.actionSteps.map((step) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 text-[#8C6A1B] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={closeActiveResource}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close Guide
              </button>

              <Link
                to="/contact#enquiry"
                onClick={closeActiveResource}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Book a Home Tutor</span>
                <ArrowRight className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
