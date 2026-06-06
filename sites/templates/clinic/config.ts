/**
 * Clinic — a sample vertical site assembled from the core block set
 * (Decision 7; FR-012, SC-002). Pure orchestration of the eight neutral blocks
 * via configuration: hero → services → testimonials → faq → contact → footer.
 * Cross-cutting contact/social live once on `company` and are sourced by the
 * Contact/Footer blocks.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'

export const clinicSite: WebsiteConfig = {
  company: {
    name: 'Bright Smile Dental',
    tagline: 'Modern dental care for the whole family',
    contact: {
      email: 'hello@brightsmile.example',
      phone: '+1 555 0100',
      address: '12 Park Avenue, Springfield',
    },
    social: { instagram: 'https://instagram.com/brightsmile' },
    legal: { legalName: 'Bright Smile Dental LLC' },
  },
  theme: { colors: { primary: '#0ea5e9' } },
  sections: [
    {
      type: 'hero',
      variant: 'centered',
      heading: 'Confident smiles start here',
      subheading: 'Gentle, modern dentistry in the heart of Springfield.',
      cta: { label: 'Book a visit', href: '#contact' },
    },
    {
      type: 'services',
      heading: 'Our services',
      items: [
        { title: 'Cleanings & check-ups', description: 'Routine care to keep teeth healthy.' },
        { title: 'Whitening', description: 'Brighten your smile safely.' },
        { title: 'Implants', description: 'Permanent, natural-looking replacements.' },
      ],
    },
    {
      type: 'testimonials',
      heading: 'What patients say',
      items: [
        { quote: 'Painless and friendly — best dentist I have had.', author: 'A. Lopez' },
        { quote: 'My kids actually look forward to visits now.', author: 'M. Chen', role: 'Parent' },
      ],
    },
    {
      type: 'faq',
      heading: 'Questions',
      items: [
        { question: 'Do you take insurance?', answer: 'Yes, most major plans are accepted.' },
        { question: 'Do you see children?', answer: 'Absolutely — we welcome all ages.' },
      ],
    },
    { type: 'contact', heading: 'Visit us', showForm: true, hours: [{ label: 'Mon–Fri', value: '9–5' }] },
    { type: 'footer' },
  ],
}
