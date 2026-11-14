import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { searchSiteContent, type SearchResultItem } from '../data/siteSearch';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const desktopSearchContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  const results = searchSiteContent(query);
  const showResultsPanel = dropdownOpen && query.trim().length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchContainerRef.current &&
        !desktopSearchContainerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (item: SearchResultItem) => {
    setQuery('');
    setDropdownOpen(false);
    setHighlightedIndex(-1);
    setMobileMenuOpen(false);
    navigate(item.to);
  };

  const handleDesktopKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setDropdownOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!showResultsPanel || results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (event.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
      event.preventDefault();
      handleSelectResult(results[highlightedIndex]);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (results.length > 0) {
      const target = highlightedIndex >= 0 && results[highlightedIndex] ? results[highlightedIndex] : results[0];
      handleSelectResult(target);
    } else {
      setDropdownOpen(true);
    }
  };

  const openMobileSearch = () => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => {
      mobileSearchInputRef.current?.focus();
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          onClick={() => {
            setMobileMenuOpen(false);
            setDropdownOpen(false);
          }}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#0B1F3A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C59B38]"
        >
          {siteConfig.brand.name}
        </Link>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `py-1.5 whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C59B38] ${
                  isActive
                    ? 'text-[#0B1F3A] font-semibold border-[#C59B38]'
                    : 'text-slate-600 border-transparent hover:text-[#0B1F3A] hover:border-slate-300'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Site-wide Search Bar + Primary CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div ref={desktopSearchContainerRef} className="relative">
            <form onSubmit={handleFormSubmit} role="search" aria-label="Site-wide search">
              <div className="relative flex items-center">
                <Search
                  className="w-4 h-4 text-slate-400 pointer-events-none absolute left-3"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setDropdownOpen(true);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => {
                    if (query.trim().length > 0) setDropdownOpen(true);
                  }}
                  onKeyDown={handleDesktopKeyDown}
                  placeholder="Search services, guides..."
                  aria-label="Search services, study guides, and FAQs"
                  aria-expanded={showResultsPanel}
                  aria-controls="desktop-search-results"
                  className="w-44 xl:w-56 h-10 pl-9 pr-8 text-sm text-[#0B1F3A] placeholder:text-slate-400 bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#C59B38]/25 transition-colors"
                />
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setDropdownOpen(false);
                      setHighlightedIndex(-1);
                    }}
                    aria-label="Clear search"
                    className="absolute right-2 p-1 text-slate-400 hover:text-[#0B1F3A]"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </form>

            {/* Live Search Results Dropdown */}
            {showResultsPanel && (
              <div
                id="desktop-search-results"
                role="listbox"
                aria-label="Search results"
                className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-lg z-50 divide-y divide-slate-100"
              >
                {results.length > 0 ? (
                  results.map((item, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        onClick={() => handleSelectResult(item)}
                        className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition-colors ${
                          isHighlighted ? 'bg-[#FCF9F0]' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-semibold text-[#8C6A1B]">
                            {item.section}
                          </p>
                          <p className="text-sm font-semibold text-[#0B1F3A] truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                        </div>
                        <ArrowRight
                          className="w-4 h-4 text-slate-400 shrink-0 mt-4"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })
                ) : (
                  <div className="p-5 space-y-2 text-sm">
                    <p className="font-semibold text-[#0B1F3A]">
                      No matching pages for “{query}”
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Try searching for “Primary”, “WAEC”, “Mathematics”, “Vetting”, “Reading”, or “Fees”.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setDropdownOpen(false);
                        navigate('/contact#enquiry');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6A1B] hover:text-[#0B1F3A] pt-1"
                    >
                      <span>Ask our coordinator directly</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            to="/contact#enquiry"
            className="inline-flex items-center justify-center px-4 lg:px-5 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
          >
            {siteConfig.home.primaryCtaLabel}
          </Link>
        </div>

        {/* Mobile Search & Menu Triggers */}
        <div className="lg:hidden flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={openMobileSearch}
            aria-label="Open site search"
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#0B1F3A] hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#C59B38]"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#0B1F3A] hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#C59B38]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation & search panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 max-h-[82vh] overflow-y-auto"
        >
          {/* Mobile Search Input */}
          <form onSubmit={handleFormSubmit} role="search" aria-label="Mobile site search">
            <div className="relative flex items-center">
              <Search
                className="w-4 h-4 text-slate-400 pointer-events-none absolute left-3"
                aria-hidden="true"
              />
              <input
                ref={mobileSearchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, study guides, FAQs..."
                aria-label="Search services, study guides, and FAQs"
                className="w-full h-11 pl-9 pr-9 text-sm text-[#0B1F3A] placeholder:text-slate-400 bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B1F3A]"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-[#0B1F3A]"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>

          {query.trim().length > 0 && (
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 bg-[#F8FAFC]">
              {results.length > 0 ? (
                results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-[#FCF9F0] transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-[#8C6A1B]">{item.section}</p>
                      <p className="text-sm font-semibold text-[#0B1F3A] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </button>
                ))
              ) : (
                <p className="px-3.5 py-3 text-xs text-slate-600">
                  No matches for “{query}”. Try “Primary”, “WAEC”, “Reading”, or “Vetting”.
                </p>
              )}
            </div>
          )}

          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#FCF9F0] text-[#0B1F3A] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#0B1F3A]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/contact#enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors"
            >
              {siteConfig.home.primaryCtaLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
