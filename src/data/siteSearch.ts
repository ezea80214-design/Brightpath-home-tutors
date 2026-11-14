import { siteConfig } from './siteConfig';

export interface SearchResultItem {
  id: string;
  section: 'Services' | 'Study Guides' | 'FAQs' | 'Tutors & About' | 'Parent Portal' | 'Contact';
  title: string;
  subtitle: string;
  to: string;
  keywords: string;
}

function buildSearchIndex(): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  // 1. Tutoring Services & Naira Fees
  for (const service of siteConfig.services) {
    items.push({
      id: `service-${service.id}`,
      section: 'Services',
      title: service.title,
      subtitle: `${service.category} · ${service.samplePrice} ${service.billingCycle}`,
      to: `/services#${service.id}`,
      keywords: [
        service.title,
        service.category,
        service.summary,
        service.description,
        service.samplePrice,
        service.priceNote,
        ...service.highlights,
      ].join(' '),
    });
  }

  // 2. Parent Resources & Study Guides
  for (const guide of siteConfig.home.resources) {
    items.push({
      id: `resource-${guide.id}`,
      section: 'Study Guides',
      title: guide.title,
      subtitle: `${guide.category} · ${guide.readTime}`,
      to: `/?resource=${guide.id}#resources-heading`,
      keywords: [
        guide.title,
        guide.category,
        guide.audience,
        guide.summary,
        ...guide.bodyParagraphs,
        ...guide.actionSteps,
      ].join(' '),
    });
  }

  // 3. Frequently Asked Questions
  siteConfig.home.faqs.forEach((faq, index) => {
    items.push({
      id: `faq-${index}`,
      section: 'FAQs',
      title: faq.question,
      subtitle: 'Frequently Asked Questions',
      to: `/?faq=${index}#faq-heading`,
      keywords: `${faq.question} ${faq.answer}`,
    });
  });

  // 4. Tutors & About BrightPath
  for (const tutor of siteConfig.about.tutors) {
    items.push({
      id: `tutor-${tutor.name.toLowerCase().replace(/\s+/g, '-')}`,
      section: 'Tutors & About',
      title: tutor.name,
      subtitle: `${tutor.role} · ${tutor.credentials}`,
      to: '/about#meet-tutors-heading',
      keywords: [
        tutor.name,
        tutor.role,
        tutor.credentials,
        tutor.experience,
        tutor.bio,
        ...tutor.specialties,
      ].join(' '),
    });
  }

  items.push({
    id: 'about-mission-vision',
    section: 'Tutors & About',
    title: 'Mission, Vision & Personalised Learning',
    subtitle: 'Patience · Discipline · Academic Improvement · Individual Attention',
    to: '/about',
    keywords: [
      siteConfig.about.headline,
      siteConfig.about.intro,
      siteConfig.about.mission.text,
      siteConfig.about.vision.text,
      ...siteConfig.about.personalisedLearningParagraphs,
    ].join(' '),
  });

  // 5. Contact, WhatsApp & Business Hours
  items.push({
    id: 'contact-booking',
    section: 'Contact',
    title: 'Book a Lesson, Phone, WhatsApp & Business Hours',
    subtitle: `${siteConfig.contact.phone} · ${siteConfig.contact.address}`,
    to: '/contact#enquiry',
    keywords: `contact phone whatsapp email address hours enquiry book lesson ${siteConfig.contact.phone} ${siteConfig.contact.whatsapp} ${siteConfig.contact.email} ${siteConfig.contact.address}`,
  });

  // 6. Parent Portal (under Home)
  items.push({
    id: 'parent-portal',
    section: 'Parent Portal',
    title: 'Parent Portal — Progress Reports, Session Logs & Tutor Workspace',
    subtitle: 'Located on Home · Secure Google Sign-In for parents and authorized tutors',
    to: '/#parent-portal',
    keywords:
      'parent portal login sign in progress reports tutor notes session logs assessment score student feedback tutor dashboard home',
  });

  // 7. Parent Testimonials
  items.push({
    id: 'parent-testimonials',
    section: 'Tutors & About',
    title: 'Parent Testimonials & Family Reviews',
    subtitle: `${siteConfig.home.parentTestimonials.length} verified Lagos parent reviews · 4.9 / 5 average rating`,
    to: '/#parent-testimonials',
    keywords: siteConfig.home.parentTestimonials
      .map((t) => `${t.parentName} ${t.location} ${t.programme} ${t.outcome} ${t.quote}`)
      .join(' ')
      .concat(' testimonials reviews parent feedback social proof satisfied parents'),
  });

  return items;
}

const searchIndex = buildSearchIndex();

export function searchSiteContent(rawQuery: string): SearchResultItem[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const tokens = query.split(/\s+/).filter(Boolean);

  const scored = searchIndex
    .map((item) => {
      const titleLower = item.title.toLowerCase();
      const subtitleLower = item.subtitle.toLowerCase();
      const haystack = `${titleLower} ${subtitleLower} ${item.keywords.toLowerCase()}`;

      const allMatch = tokens.every((token) => haystack.includes(token));
      if (!allMatch) return null;

      let score = 0;
      if (titleLower.includes(query)) score += 10;
      for (const token of tokens) {
        if (titleLower.includes(token)) score += 4;
        if (subtitleLower.includes(token)) score += 2;
      }

      return { item, score };
    })
    .filter((entry): entry is { item: SearchResultItem; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((entry) => entry.item);

  return scored;
}
