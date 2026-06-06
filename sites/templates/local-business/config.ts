/**
 * Local business — a sample vertical site (Decision 7; FR-012, SC-002).
 * Order: hero → services → cta → testimonials → contact → footer.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'

export const localBusinessSite: WebsiteConfig = {
  company: {
    name: 'Northside Auto Care',
    tagline: 'Honest repairs, done right',
    contact: {
      email: 'shop@northsideauto.example',
      phone: '+1 555 0167',
      address: '210 Garage Road, Northside',
    },
    social: { instagram: 'https://instagram.com/northsideauto' },
  },
  theme: { colors: { primary: '#ea580c' } },
  sections: [
    {
      type: 'hero',
      variant: 'minimal',
      heading: 'Your car, in good hands',
      subheading: 'Family-run service and repair for every make and model.',
      cta: { label: 'Get a quote', href: '#contact' },
    },
    {
      type: 'services',
      variant: 'list',
      heading: 'What we do',
      items: [
        { title: 'Oil & maintenance' },
        { title: 'Brakes & tires' },
        { title: 'Diagnostics' },
      ],
    },
    {
      type: 'cta',
      heading: 'Need a repair fast?',
      body: 'Same-day appointments available.',
      cta: { label: 'Call now', href: '#contact' },
      secondaryCta: { label: 'See services', href: '#services' },
    },
    {
      type: 'testimonials',
      heading: 'Trusted by neighbors',
      items: [
        { quote: 'Fair price and quick turnaround.', author: 'R. Diaz' },
        { quote: 'They explained everything clearly.', author: 'K. Owens' },
      ],
    },
    { type: 'contact', heading: 'Come by the shop' },
    { type: 'footer', variant: 'minimal' },
  ],
}
