import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { siteImages } from '../data/siteImages';
import { SmartImage } from '../components/SmartImage';

type FilterCategory = 'All' | 'Primary' | 'Secondary' | 'Exam Prep';

const filterOptions: { value: FilterCategory; label: string }[] = [
  { value: 'All', label: 'All Programmes' },
  { value: 'Primary', label: 'Primary' },
  { value: 'Secondary', label: 'Secondary' },
  { value: 'Exam Prep', label: 'Exam Prep' },
];

export function ServicesPage() {
  const { hash } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');

  useEffect(() => {
    if (!hash) return;
    const targetId = hash.replace('#', '');
    if (siteConfig.services.some((service) => service.id === targetId)) {
      setSelectedCategory('All');
    }
  }, [hash]);

  const visibleServices =
    selectedCategory === 'All'
      ? siteConfig.services
      : siteConfig.services.filter((service) => service.category === selectedCategory);

  return (
    <div>
      {/* Page Header */}
      <section className="bg-[#FCF9F0]/60 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.servicesPage.kicker}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#0B1F3A] tracking-tight">
              {siteConfig.servicesPage.headline}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {siteConfig.servicesPage.intro}
            </p>
          </div>

          {/* Interactive Category Filter */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Filter tutoring programmes by level"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg"
            >
              {filterOptions.map((option) => {
                const isActive = selectedCategory === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedCategory(option.value)}
                    aria-pressed={isActive}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C59B38] ${
                      isActive
                        ? 'bg-[#0B1F3A] text-white'
                        : 'text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <p className="text-xs sm:text-sm text-slate-500">
              Showing {visibleServices.length} of {siteConfig.services.length} tutoring programmes
            </p>
          </div>
        </div>
      </section>

      {/* Four Tutoring Services with Sample Naira Prices */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {visibleServices.map((service) => (
            <article
              key={service.id}
              id={service.id}
              className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-xl border border-slate-200 overflow-hidden bg-white"
            >
              <div className="lg:col-span-5 aspect-[4/3] lg:aspect-auto lg:min-h-[320px] bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200">
                <SmartImage
                  src={siteImages[service.imageKey]}
                  alt={service.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>{service.number}. {service.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>One-on-One Home Visit</span>
                    </div>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                    {service.title}
                  </h2>

                  <p className="text-slate-600 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="pt-2 space-y-2.5 text-sm text-slate-700">
                    {service.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="w-4 h-4 text-[#C59B38] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & Booking Row */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A] tabular-nums">
                        {service.samplePrice}
                      </span>
                      <span className="text-sm text-slate-500">{service.billingCycle}</span>
                    </div>
                    <p className="text-xs text-slate-500">{service.priceNote}</p>
                  </div>

                  <Link
                    to={`/contact?programme=${service.id}#enquiry`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
                  >
                    <span>Book This Programme</span>
                    <ArrowRight className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}

          <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-200 pt-6">
            {siteConfig.servicesPage.pricingDisclaimer}
          </p>
        </div>
      </section>

      {/* How Home Tutoring Starts */}
      <section className="py-16 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-medium text-[#8C6A1B]">Simple Onboarding</p>
            <h2 className="font-display text-3xl font-bold text-[#0B1F3A]">
              How BrightPath Placements Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {siteConfig.servicesPage.onboardingSteps.map((item) => (
              <div
                key={item.step}
                className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 space-y-3"
              >
                <p className="font-display text-xl font-bold text-[#C59B38] tabular-nums">
                  {item.step}.
                </p>
                <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
