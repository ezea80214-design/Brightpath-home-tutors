import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { siteImages } from '../data/siteImages';
import { SmartImage } from './SmartImage';

export function MeetOurTutors() {
  const tutors = siteConfig.about.tutors;

  if (!tutors || tutors.length === 0) return null;

  return (
    <section
      aria-labelledby="meet-tutors-heading"
      className="py-16 sm:py-20 bg-white border-t border-slate-200"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.about.tutorsKicker}
            </p>
            <h2
              id="meet-tutors-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] tracking-tight"
            >
              {siteConfig.about.tutorsTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {siteConfig.about.tutorsIntro}
            </p>
          </div>

          <Link
            to="/contact#enquiry"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C59B38]"
          >
            <span>Request a tutor match</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Tutor Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tutors.map((tutor) => (
            <article
              key={tutor.name}
              className="grid grid-cols-1 sm:grid-cols-12 rounded-xl border border-slate-200 bg-[#F8FAFC] overflow-hidden"
            >
              <div className="sm:col-span-5 aspect-square sm:aspect-auto sm:h-full bg-slate-100 border-b sm:border-b-0 sm:border-r border-slate-200">
                <SmartImage
                  src={siteImages[tutor.imageKey]}
                  alt={tutor.imageAlt}
                  fallbackTitle={tutor.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#0B1F3A]">
                      {tutor.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#8C6A1B] mt-0.5">
                      {tutor.role}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                    <GraduationCap
                      className="w-4 h-4 text-[#0B1F3A] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>
                      {tutor.credentials}
                      <span aria-hidden="true"> · </span>
                      {tutor.experience}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {tutor.bio}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-1.5">
                  <p className="text-xs font-semibold text-[#0B1F3A]">
                    Subject Specialties
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {tutor.specialties.join(' · ')}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
