import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export function SuccessStoriesSlider() {
  const stories = siteConfig.home.successStories;
  const [activeIndex, setActiveIndex] = useState(0);
  const total = stories.length;

  if (total === 0) return null;

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToPrevious();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToNext();
    }
  };

  return (
    <section
      aria-labelledby="success-stories-heading"
      onKeyDown={handleKeyDown}
      className="py-16 sm:py-20 bg-white border-t border-slate-200"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.home.successStoriesKicker}
            </p>
            <h2
              id="success-stories-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] tracking-tight"
            >
              {siteConfig.home.successStoriesTitle}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {siteConfig.home.successStoriesIntro}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium text-slate-500 tabular-nums mr-1">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous success story"
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-[#0B1F3A] hover:border-[#0B1F3A] hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next success story"
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-[#0B1F3A] hover:border-[#0B1F3A] hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Slider Viewport */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Parent and student testimonials"
          className="overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFC]"
        >
          <div
            className="flex transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {stories.map((story, index) => (
              <article
                key={story.name}
                aria-hidden={index !== activeIndex}
                className="w-full shrink-0 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span>{story.perspective}</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.programme}</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.location}</span>
                    </div>
                    <Quote className="w-6 h-6 text-[#C59B38] shrink-0" aria-hidden="true" />
                  </div>

                  <blockquote className="font-display text-xl sm:text-2xl lg:text-[1.7rem] font-medium text-[#0B1F3A] leading-snug max-w-4xl">
                    “{story.quote}”
                  </blockquote>
                </div>

                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0B1F3A] text-base">{story.name}</p>
                    <p className="text-sm text-slate-600">{story.role}</p>
                  </div>
                  <p className="text-sm font-medium text-[#8C6A1B]">{story.outcome}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Direct Story Selector */}
        <div
          role="tablist"
          aria-label="Select a success story"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {stories.map((story, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={story.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIndex(index)}
                className={`text-left px-4 py-3.5 rounded-lg border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38] ${
                  isActive
                    ? 'bg-[#0B1F3A] border-[#0B1F3A] text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className={isActive ? 'text-[#D8B45A] font-medium' : 'text-slate-500'}>
                    {story.perspective}
                  </span>
                  <span
                    className={`tabular-nums ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p
                  className={`text-sm font-semibold truncate ${
                    isActive ? 'text-white' : 'text-[#0B1F3A]'
                  }`}
                >
                  {story.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
