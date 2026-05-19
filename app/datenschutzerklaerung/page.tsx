import { LegalPageClient } from '../LegalPageClient';
import { getHomepageContent } from '../../lib/homepage';

export const metadata = {
  title: 'Datenschutzerklärung',
  robots: {
    index: false,
    follow: true
  },
  alternates: {
    canonical: '/datenschutzerklaerung'
  }
};

export default function DatenschutzerklaerungPage() {
  const content = getHomepageContent();

  return (
    <LegalPageClient
      pageKey="datenschutzerklaerung"
      initialPage={content.legalPages.datenschutzerklaerung}
    />
  );
}
