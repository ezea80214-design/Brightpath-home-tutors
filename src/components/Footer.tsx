import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { siteConfig, buildWhatsAppUrl } from '../data/siteConfig';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappHref = buildWhatsAppUrl(
    siteConfig.contact.whatsapp,
    'Hello BrightPath Home Tutors, I would like to enquire about home tutoring lessons for my child.'
  );

  return (
    <footer className="bg-[#0B1F3A] text-slate-300 border-t border-[#1D4173]/60">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Summary */}
          <div className="md:col-span-5 space-y-4">
            <Link
              to="/"
              className="inline-block font-display text-2xl font-bold text-white tracking-tight"
            >
              {siteConfig.brand.name}
            </Link>
            <p className="text-[#D8B45A] font-medium text-sm">
              {siteConfig.brand.tagline}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Trusted one-on-one home tutoring for primary and secondary school students across Surulere and Lagos—focused on patience, academic improvement, and disciplined study habits.
            </p>
          </div>

          {/* Pages */}
          <div className="md:col-span-3 space-y-4">
            <h2 className="font-sans text-sm font-semibold text-white tracking-wide">
              Explore
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#D8B45A] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#D8B45A] transition-colors">
                  Tutoring Services &amp; Fees
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D8B45A] transition-colors">
                  About BrightPath
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D8B45A] transition-colors">
                  Contact &amp; Book a Lesson
                </Link>
              </li>
              <li>
                <Link to="/#parent-portal" className="hover:text-[#D8B45A] transition-colors">
                  Parent Portal (Home)
                </Link>
              </li>
            </ul>
          </div>

          {/* Verified Contact Info */}
          <div className="md:col-span-4 space-y-4">
            <h2 className="font-sans text-sm font-semibold text-white tracking-wide">
              Contact Information
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D8B45A] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{siteConfig.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D8B45A] shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="hover:text-[#D8B45A] transition-colors tabular-nums"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#D8B45A] shrink-0" aria-hidden="true" />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D8B45A] transition-colors tabular-nums"
                >
                  WhatsApp: {siteConfig.contact.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D8B45A] shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-[#D8B45A] transition-colors break-all"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {currentYear} {siteConfig.brand.name}. All rights reserved.
          </p>
          <p>{siteConfig.brand.locationLabel}</p>
        </div>
      </div>
    </footer>
  );
}
