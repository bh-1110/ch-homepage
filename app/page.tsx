import { HomeClient } from './HomeClient';
import { getHomepageContent } from '../lib/homepage';

export default function Home() {
  const content = getHomepageContent();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: content.brand.name,
    description: content.hero.text,
    url: 'https://www.christelhable.com',
    image: 'https://www.christelhable.com/uploads/PortraitCH2.JPG',
    telephone: content.contact.phone,
    email: content.contact.email,
    areaServed: 'Wien',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ledererhof 2 / Drahtgasse 3, TOP 6',
      postalCode: '1010',
      addressLocality: 'Wien',
      addressCountry: 'AT'
    },
    location: content.contact.locations.map((location) => ({
      '@type': 'Place',
      name: location.name,
      address: location.address
    })),
    serviceType: ['Psychotherapie', 'Mentalcoaching', 'Business Coaching'],
    priceRange: '$$'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeClient content={content} />
    </>
  );
}
