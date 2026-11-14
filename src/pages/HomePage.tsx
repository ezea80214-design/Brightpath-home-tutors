import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { siteImages } from '../data/siteImages';
import { SmartImage } from '../components/SmartImage';
import { SuccessStoriesSlider } from '../components/SuccessStoriesSlider';
import { ParentTestimonialsSection } from '../components/ParentTestimonialsSection';
import { FaqSection } from '../components/FaqSection';
import { MilestonesSection } from '../components/MilestonesSection';
import { ResourcesSection } from '../components/ResourcesSection';
import { ParentPortal } from '../components/ParentPortal';

export function HomePage() {
  const featuredServices = siteConfig.services.filter((service) => service.featuredOnHome).slice(0, 3);
  const [leadService, ...secondaryServices] = featuredServices;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#FCF9F0]/60 to-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-sm font-medium text-[#8C6A1B] tracking-wide">
                {siteConfig.home.kicker}
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-bold text-[#0B1F3A] leading-[1.12] tracking-tight">
                {siteConfig.home.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {siteConfig.home.heroIntro}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/contact#enquiry"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
                >
                  <span>{siteConfig.home.primaryCtaLabel}</span>
                  <ArrowRight className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-[#0B1F3A] bg-white border border-slate-300 rounded-lg hover:border-[#0B1F3A] hover:bg-slate-50 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
                >
                  <span>{siteConfig.home.secondaryCtaLabel}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[440px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <SmartImage
                  src={siteImages.heroHomeTutoring}
                  alt="Qualified Nigerian female home tutor guiding a primary school child through a mathematics workbook at home"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-column institutional strip below the hero split */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {siteConfig.home.proofStrip.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="font-display text-lg font-semibold text-[#0B1F3A]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Featured Services */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200">
            <div className="space-y-3 max-w-2xl">
              <p className="text-sm font-medium text-[#8C6A1B]">Featured Programmes</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] tracking-tight">
                Focused Home Support Built Around Your Child
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors whitespace-nowrap shrink-0"
            >
              <span>View all 4 services &amp; Naira rates</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Marquee Featured Service */}
            {leadService && (
              <article className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] overflow-hidden">
                <div className="aspect-[16/10] w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                  <SmartImage
                    src={siteImages[leadService.imageKey]}
                    alt={leadService.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>{leadService.number}. {leadService.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums text-[#8C6A1B] font-semibold">
                        From {leadService.samplePrice} / month
                      </span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-[1.7rem] font-bold text-[#0B1F3A]">
                      {leadService.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {leadService.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <Link
                      to={`/contact?programme=${leadService.id}#enquiry`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors"
                    >
                      <span>Book this programme</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/services"
                      className="text-sm font-medium text-slate-600 hover:text-[#0B1F3A] transition-colors"
                    >
                      Programme details
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* Two Complementary Featured Services */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {secondaryServices.map((service) => (
                <article
                  key={service.id}
                  className="flex-1 flex flex-col justify-between p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>{service.number}. {service.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums text-[#8C6A1B] font-semibold">
                        From {service.samplePrice} / month
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-[#0B1F3A]">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {service.summary}
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm text-slate-700">
                    {service.highlights.slice(0, 2).map((point) => (
                      <li key={point} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="w-4 h-4 text-[#C59B38] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <Link
                      to={`/contact?programme=${service.id}#enquiry`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors"
                    >
                      <span>Book a lesson</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/services"
                      className="text-sm font-medium text-slate-500 hover:text-[#0B1F3A] transition-colors"
                    >
                      See fees
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Parents Choose BrightPath */}
      <section className="py-16 sm:py-20 bg-[#0B1F3A] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-sm font-medium text-[#D8B45A]">Built on Parental Trust</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
                {siteConfig.home.whyChooseTitle}
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {siteConfig.home.whyChooseIntro}
              </p>

              <div className="pt-2">
                <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/15 bg-[#132E53]">
                  <SmartImage
                    src={siteImages.serviceSecondaryTutoring}
                    alt="Home tutor guiding a Nigerian secondary student through geometry and science notes"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {siteConfig.home.whyChooseReasons.map((reason) => (
                <div
                  key={reason.number}
                  className="p-6 sm:p-7 rounded-xl bg-[#132E53]/80 border border-white/10 space-y-3"
                >
                  <p className="font-display text-lg font-semibold text-[#D8B45A] tabular-nums">
                    {reason.number}.
                  </p>
                  <h3 className="font-display text-xl font-bold text-white">
                    {reason.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Milestones & Social Proof Counters */}
      <MilestonesSection />

      {/* Parent & Student Success Stories Slider */}
      <SuccessStoriesSlider />

      {/* Satisfied Parent Testimonials */}
      <ParentTestimonialsSection />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Parent Resources & Study Guides */}
      <ResourcesSection />

      {/* Parent Portal (Embedded under Home) */}
      <section
        id="parent-portal"
        aria-labelledby="parent-portal-heading"
        className="scroll-mt-20 py-16 sm:py-20 bg-[#F8FAFC] border-t border-slate-200"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium text-[#8C6A1B]">
              BrightPath Family &amp; Tutor Access
            </p>
            <h2
              id="parent-portal-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] tracking-tight"
            >
              Parent Portal
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Sign in securely to view your child’s monthly assessment progress reports, tutor session logs, and upcoming lesson targets—or manage student updates if you are an authorized BrightPath tutor.
            </p>
          </div>

          <ParentPortal />
        </div>
      </section>

      {/* Conversion Band */}
      <section className="py-16 sm:py-20 bg-[#FCF9F0] border-t border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-8 sm:p-10 rounded-xl bg-white border border-slate-200">
            <div className="space-y-3 max-w-2xl">
              <p className="text-sm font-medium text-[#8C6A1B]">
                Begin This Term With Confidence
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                Arrange a Qualified Home Tutor for Your Child Today
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Tell us your child’s class, subjects, and preferred weekly schedule. We will recommend a patient tutor matched to your family’s needs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                to="/contact#enquiry"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
              >
                <span>{siteConfig.home.primaryCtaLabel}</span>
                <ArrowRight className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
