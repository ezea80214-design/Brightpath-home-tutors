import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

type StageFilter = 'All' | 'Primary' | 'Secondary' | 'Exam Prep';

const STAGE_FILTERS: { label: string; value: StageFilter }[] = [
  { label: 'All Parents', value: 'All' },
  { label: 'Primary', value: 'Primary' },
  { label: 'Secondary', value: 'Secondary' },
  { label: 'Exam Prep', value: 'Exam Prep' },
];

export function ParentTestimonialsSection() {
  const [activeStage, setActiveStage] = useState<StageFilter>('All');
  const allTestimonials = siteConfig.home.parentTestimonials;

  if (!allTestimonials || allTestimonials.length === 0) return null;

  const filtered =
    activeStage === 'All'
      ? allTestimonials
      : allTestimonials.filter((item) => item.stage === activeStage);

  const [leadTestimonial, spotlightTestimonial, ...remainingTestimonials] = filtered;

  return (
    <section
      id="parent-testimonials"
      aria-labelledby="parent-testimonials-heading"
      className="scroll-mt-20 py-16 sm:py-20 bg-[#FCF9F0]/60 border-t border-slate-200"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header + Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.home.parentTestimonialsKicker}
            </p>
            <h2
              id="parent-testimonials-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] tracking-tight"
            >
              {siteConfig.home.parentTestimonialsTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {siteConfig.home.parentTestimonialsIntro}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <p className="text-xs font-medium text-slate-600 tabular-nums">
              <span className="font-semibold text-[#0B1F3A]">4.9 / 5</span> Average Parent Rating
              <span aria-hidden="true"> · </span>
              <span>{allTestimonials.length} Verified Lagos Families</span>
            </p>

            <div
              role="group"
              aria-label="Filter parent testimonials by programme stage"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg"
            >
              {STAGE_FILTERS.map((filter) => {
                const isActive = activeStage === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveStage(filter.value)}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38] ${
                      isActive
                        ? 'bg-[#0B1F3A] text-white'
                        : 'text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Asymmetric Bento Row: Lead White Card + Navy Spotlight */}
        {leadTestimonial && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <article
              className={`${
                spotlightTestimonial ? 'lg:col-span-7' : 'lg:col-span-12'
              } p-7 sm:p-9 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-6`}
            >
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="text-[#8C6A1B] font-semibold">
                      {leadTestimonial.programme}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{leadTestimonial.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{leadTestimonial.tenure}</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F3A]"
                    aria-label={`Rated ${leadTestimonial.rating}`}
                  >
                    <div className="flex items-center gap-0.5 text-[#C59B38]" aria-hidden="true">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="tabular-nums">{leadTestimonial.rating}</span>
                  </div>
                </div>

                <blockquote className="font-display text-xl sm:text-[1.45rem] font-medium text-[#0B1F3A] leading-snug">
                  “{leadTestimonial.quote}”
                </blockquote>
              </div>

              <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#0B1F3A] text-base">
                    {leadTestimonial.parentName}
                  </p>
                  <p className="text-sm text-slate-600">{leadTestimonial.parentRole}</p>
                </div>
                <p className="text-sm font-semibold text-[#8C6A1B]">{leadTestimonial.outcome}</p>
              </div>
            </article>

            {spotlightTestimonial && (
              <article className="lg:col-span-5 p-7 sm:p-9 rounded-xl bg-[#0B1F3A] text-white flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-[#D8B45A]">
                      {spotlightTestimonial.programme}
                      <span aria-hidden="true"> · </span>
                      {spotlightTestimonial.location}
                    </p>
                    <Quote className="w-5 h-5 text-[#D8B45A] shrink-0" aria-hidden="true" />
                  </div>

                  <blockquote className="text-base sm:text-lg text-slate-100 leading-relaxed">
                    “{spotlightTestimonial.quote}”
                  </blockquote>
                </div>

                <div className="pt-5 border-t border-white/15 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white text-base">
                        {spotlightTestimonial.parentName}
                      </p>
                      <p className="text-xs text-slate-300">{spotlightTestimonial.parentRole}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#D8B45A] tabular-nums shrink-0">
                      {spotlightTestimonial.rating}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#D8B45A]">
                    Outcome: {spotlightTestimonial.outcome}
                  </p>
                </div>
              </article>
            )}
          </div>
        )}

        {/* Secondary Parent Testimonials Grid */}
        {remainingTestimonials.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-6 items-stretch ${
              remainingTestimonials.length % 2 === 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'
            }`}
          >
            {remainingTestimonials.map((item) => (
              <article
                key={item.id}
                className="p-6 sm:p-7 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-medium text-[#8C6A1B]">{item.programme}</span>
                    <span className="font-semibold text-[#0B1F3A] tabular-nums shrink-0">
                      {item.rating}
                    </span>
                  </div>

                  <blockquote className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    “{item.quote}”
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-1.5">
                  <p className="font-semibold text-[#0B1F3A] text-sm">{item.parentName}</p>
                  <p className="text-xs text-slate-500">
                    {item.parentRole}
                    <span aria-hidden="true"> · </span>
                    {item.location}
                  </p>
                  <p className="text-xs font-semibold text-[#8C6A1B] pt-1">{item.outcome}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Adjacent Proof-to-Action Link */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            Ready to arrange a vetted, patient home tutor for your child?
          </p>
          <Link
            to="/contact#enquiry"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Request a tutor match</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
