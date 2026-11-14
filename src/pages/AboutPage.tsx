import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { siteImages } from '../data/siteImages';
import { SmartImage } from '../components/SmartImage';
import { MeetOurTutors } from '../components/MeetOurTutors';

export function AboutPage() {
  return (
    <div>
      {/* About Introduction */}
      <section className="bg-[#FCF9F0]/60 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <p className="text-sm font-medium text-[#8C6A1B]">
                {siteConfig.about.kicker}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#0B1F3A] leading-[1.15] tracking-tight">
                {siteConfig.about.headline}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {siteConfig.about.intro}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <SmartImage
                  src={siteImages.aboutPersonalisedLearning}
                  alt="Neatly stacked academic textbooks, handwritten revision notes, and a brass compass on a sunlit wooden study desk"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-4">
              <p className="text-xs font-semibold tracking-wide text-[#8C6A1B]">01 · Purpose</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                {siteConfig.about.mission.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {siteConfig.about.mission.text}
              </p>
            </div>

            <div className="p-8 rounded-xl border border-slate-200 bg-[#0B1F3A] text-white space-y-4">
              <p className="text-xs font-semibold tracking-wide text-[#D8B45A]">02 · Direction</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {siteConfig.about.vision.title}
              </h2>
              <p className="text-slate-300 leading-relaxed">
                {siteConfig.about.vision.text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Importance of Personalised Learning */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-3">
              <p className="text-sm font-medium text-[#8C6A1B]">Educational Philosophy</p>
              <h2 className="font-display text-3xl font-bold text-[#0B1F3A] leading-tight">
                {siteConfig.about.personalisedLearningTitle}
              </h2>
            </div>

            <div className="lg:col-span-8 space-y-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              {siteConfig.about.personalisedLearningParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Commitments: Patience, Discipline, Academic Improvement, Individual Attention */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-sm font-medium text-[#8C6A1B]">What Guides Our Tutors</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A]">
                {siteConfig.about.commitmentsTitle}
              </h2>
            </div>

            <Link
              to="/contact#enquiry"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
            >
              <span>Book a Lesson</span>
              <ArrowRight className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {siteConfig.about.commitments.map((commitment) => (
              <div
                key={commitment.number}
                className="p-7 sm:p-8 rounded-xl bg-white border border-slate-200 space-y-3"
              >
                <p className="font-display text-lg font-bold text-[#C59B38] tabular-nums">
                  {commitment.number}.
                </p>
                <h3 className="font-display text-2xl font-bold text-[#0B1F3A]">
                  {commitment.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {commitment.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Tutors */}
      <MeetOurTutors />
    </div>
  );
}
