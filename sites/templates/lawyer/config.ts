/**
 * Lawyer — a sample vertical site (Decision 7; FR-012, SC-002).
 * Order: hero → about → services → cta → contact → footer.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'

export const lawyerSite: WebsiteConfig = {
  company: {
    name: 'Hale & Mercer',
    tagline: 'Trusted counsel since 1998',
    contact: {
      email: 'office@halemercer.example',
      phone: '+1 555 0142',
      address: '400 Court Street, Metropolis',
    },
    social: { linkedin: 'https://linkedin.com/company/halemercer' },
    legal: { legalName: 'Hale & Mercer LLP' },
  },
  theme: { colors: { primary: '#1e3a8a' } },
  sections: [
    {
      type: 'hero',
      variant: 'split',
      heading: 'Experienced advocates on your side',
      subheading: 'Corporate, family, and real-estate law handled with care.',
      cta: { label: 'Request a consultation', href: '#contact' },
      media: { src: '/images/lawyer-hero.jpg', alt: 'Attorneys in discussion' },
    },
    {
      type: 'about',
      variant: 'media-right',
      heading: 'Two decades of results',
      body: 'Our partners bring deep courtroom and negotiation experience to every matter.',
      media: { src: '/images/lawyer-team.jpg', alt: 'The firm partners' },
      highlights: [
        { label: 'Years', value: '25+' },
        { label: 'Cases won', value: '900+' },
      ],
    },
    {
      type: 'services',
      variant: 'list',
      heading: 'Practice areas',
      items: [
        { title: 'Corporate law' },
        { title: 'Family law' },
        { title: 'Real estate' },
      ],
    },
    {
      type: 'cta',
      variant: 'banner',
      heading: 'Facing a legal question?',
      body: 'Speak with a partner today.',
      cta: { label: 'Book a consultation', href: '#contact' },
    },
    { type: 'contact', heading: 'Contact the firm', variant: 'stacked' },
    { type: 'footer', variant: 'minimal' },
  ],
}
