import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../data/siteConfig';

interface MilestoneCounterProps {
  target: number;
  suffix: string;
  shouldAnimate: boolean;
}

function MilestoneCounter({ target, suffix, shouldAnimate }: MilestoneCounterProps) {
  const [displayValue, setDisplayValue] = useState(target);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(target);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }

    let animationFrameId = 0;
    const durationMs = 900;
    const startTime = performance.now();

    setDisplayValue(0);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Smooth cubic ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, shouldAnimate]);

  return (
    <span className="tabular-nums">
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export function MilestonesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEnteredView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const milestones = siteConfig.home.milestones;

  if (!milestones || milestones.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="milestones-heading"
      className="py-16 sm:py-20 bg-[#FCF9F0]/80 border-t border-slate-200"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.home.milestonesKicker}
            </p>
            <h2
              id="milestones-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] tracking-tight"
            >
              {siteConfig.home.milestonesTitle}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed">
            {siteConfig.home.milestonesIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {milestones.map((item, index) => {
            const clampedPercent = Math.max(0, Math.min(100, item.progressPercent));
            const targetScale = hasEnteredView ? clampedPercent / 100 : 0;

            return (
              <div
                key={item.label}
                className="p-7 sm:p-8 rounded-xl bg-white border border-slate-200 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-[#8C6A1B] tabular-nums">
                    {String(index + 1).padStart(2, '0')} · {item.timeframe}
                  </p>
                  <p
                    aria-label={`${item.value}${item.suffix} ${item.label}`}
                    className="font-display text-4xl sm:text-5xl font-bold text-[#0B1F3A] tracking-tight"
                  >
                    <MilestoneCounter
                      target={item.value}
                      suffix={item.suffix}
                      shouldAnimate={hasEnteredView}
                    />
                  </p>

                  {/* Animated Progress Bar */}
                  <div className="space-y-2 pt-1">
                    <div
                      role="progressbar"
                      aria-label={`${item.label}: ${item.progressLabel}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={clampedPercent}
                      className="h-2.5 w-full rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden"
                    >
                      <div
                        className="h-full w-full rounded-full bg-gradient-to-r from-[#0B1F3A] to-[#C59B38] origin-left transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{
                          transform: `scaleX(${targetScale})`,
                          transitionDelay: `${index * 90}ms`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{item.progressLabel}</span>
                      <span className="font-semibold text-[#0B1F3A] tabular-nums">
                        {clampedPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-1.5">
                  <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                    {item.label}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
