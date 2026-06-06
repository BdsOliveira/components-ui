/**
 * School — a sample vertical site (Decision 7; FR-012, SC-002).
 * Order: hero → about → services → faq → cta → contact → footer.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'

export const schoolSite: WebsiteConfig = {
  company: {
    name: 'Riverside Academy',
    tagline: 'Curiosity, character, community',
    contact: {
      email: 'admissions@riverside.example',
      phone: '+1 555 0125',
      address: '90 Learning Way, Riverside',
    },
    social: { facebook: 'https://facebook.com/riversideacademy' },
    legal: { legalName: 'Riverside Academy Inc.' },
  },
  theme: { colors: { primary: '#15803d' } },
  sections: [
    {
      type: 'hero',
      heading: 'Where students grow',
      subheading: 'A nurturing K–12 environment focused on the whole child.',
      cta: { label: 'Apply now', href: '#contact' },
    },
    {
      type: 'about',
      heading: 'Our approach',
      body: 'Small classes, dedicated teachers, and a curriculum that balances rigor and joy.',
      highlights: [
        { label: 'Class size', value: '16' },
        { label: 'Graduation', value: '99%' },
      ],
    },
    {
      type: 'services',
      heading: 'Programs',
      items: [
        { title: 'Elementary' },
        { title: 'Middle school' },
        { title: 'High school' },
        { title: 'Arts & athletics' },
      ],
    },
    {
      type: 'faq',
      variant: 'list',
      heading: 'Admissions FAQ',
      items: [
        { question: 'When do applications open?', answer: 'Rolling, from October each year.' },
        { question: 'Is financial aid available?', answer: 'Yes, need-based aid is offered.' },
      ],
    },
    {
      type: 'cta',
      variant: 'boxed',
      heading: 'Ready to visit?',
      cta: { label: 'Schedule a tour', href: '#contact' },
    },
    { type: 'contact', heading: 'Get in touch', showForm: true },
    { type: 'footer' },
  ],
}
