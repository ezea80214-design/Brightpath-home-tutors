import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SmartImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle = 'BrightPath Home Tutors',
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full min-h-[240px] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0B1F3A] via-[#132E53] to-[#1D4173] text-white p-8 text-center"
      >
        <div className="w-12 h-12 rounded-lg border border-[#C59B38]/40 bg-[#C59B38]/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-[#D8B45A]" aria-hidden="true" />
        </div>
        <p className="font-display text-lg font-semibold text-white">{fallbackTitle}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
