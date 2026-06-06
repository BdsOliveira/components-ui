/**
 * Restaurant — a sample vertical site (Decision 7; FR-012, SC-002).
 * Order: hero → about → services (menu) → testimonials → contact → footer.
 */
import type { WebsiteConfig } from '~~/sites/core/schemas'

export const restaurantSite: WebsiteConfig = {
  company: {
    name: 'Osteria Vera',
    tagline: 'Seasonal Italian, made by hand',
    contact: {
      email: 'ciao@osteriavera.example',
      phone: '+1 555 0188',
      address: '7 Vine Lane, Harborview',
    },
    social: { instagram: 'https://instagram.com/osteriavera' },
  },
  theme: { colors: { primary: '#b91c1c' } },
  sections: [
    {
      type: 'hero',
      variant: 'split',
      heading: 'A table waiting for you',
      subheading: 'Rustic Italian plates and a short, thoughtful wine list.',
      cta: { label: 'Reserve', href: '#contact' },
      media: { src: '/images/restaurant-hero.jpg', alt: 'Plated pasta dish' },
    },
    {
      type: 'about',
      variant: 'media-left',
      heading: 'From our kitchen',
      body: 'We cook what the market gives us, changing the menu with the seasons.',
      media: { src: '/images/restaurant-kitchen.jpg', alt: 'Chefs at work' },
    },
    {
      type: 'services',
      heading: 'On the menu',
      items: [
        { title: 'Antipasti', description: 'Small plates to share.' },
        { title: 'Primi', description: 'Hand-made pasta daily.' },
        { title: 'Dolci', description: 'House desserts.' },
      ],
    },
    {
      type: 'testimonials',
      variant: 'carousel',
      heading: 'Guests love it',
      items: [
        { quote: 'The pasta is unreal.', author: 'J. Romano', rating: 5 },
        { quote: 'Cozy and delicious.', author: 'S. Patel' },
      ],
    },
    {
      type: 'contact',
      heading: 'Find us',
      hours: [
        { label: 'Tue–Sun', value: '17:00–23:00' },
        { label: 'Mon', value: 'Closed' },
      ],
    },
    { type: 'footer' },
  ],
}
