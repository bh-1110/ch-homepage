import { LegalPageClient } from '../LegalPageClient';
import { getHomepageContent } from '../../lib/homepage';

export const metadata = {
  title: 'Impressum',
  robots: {
    index: false,
    follow: true
  },
  alternates: {
    canonical: '/impressum'
  }
};

export default function ImpressumPage() {
  const content = getHomepageContent();

  return <LegalPageClient pageKey="impressum" initialPage={content.legalPages.impressum} />;
}
