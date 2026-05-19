import '@mantine/core/styles.css';
import './styles.css';

import type { Metadata } from 'next';
import { MantineProvider, createTheme } from '@mantine/core';

const siteUrl = 'https://www.christelhable.com';
const siteTitle = 'Psychotherapie und Coaching in Wien | Mag. Christel Hable';
const siteDescription =
  'Psychotherapie, Mentalcoaching und Business Coaching in 1010 und 1170 Wien. Vertrauliche Begleitung bei Belastung, Krisen, Stress, Führungsthemen und persönlicher Weiterentwicklung.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | Mag. Christel Hable'
  },
  description: siteDescription,
  applicationName: 'Mag. Christel Hable',
  authors: [{ name: 'Mag. Christel Hable', url: siteUrl }],
  creator: 'Mag. Christel Hable',
  publisher: 'Mag. Christel Hable',
  keywords: [
    'Psychotherapie Wien',
    'Psychotherapeutin Wien',
    'Psychotherapie 1010 Wien',
    'Psychotherapie 1170 Wien',
    'Mentalcoaching Wien',
    'Business Coaching Wien',
    'Coaching Wien',
    'Mag. Christel Hable'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'de_AT',
    url: '/',
    siteName: 'Mag. Christel Hable',
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: '/uploads/PortraitCH2.JPG',
        width: 1200,
        height: 900,
        alt: 'Mag. Christel Hable'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/uploads/PortraitCH2.JPG']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

const theme = createTheme({
  fontFamily: 'Inter, Arial, sans-serif',
  headings: {
    fontFamily: 'Georgia, Cambria, serif',
    fontWeight: '500'
  },
  primaryColor: 'teal',
  defaultRadius: 'md',
  colors: {
    teal: [
      '#eef8f6',
      '#dcefeb',
      '#b8ded7',
      '#8fcac0',
      '#6bb5aa',
      '#539f95',
      '#42857d',
      '#386b66',
      '#315754',
      '#294947'
    ]
  }
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-mantine-color-scheme="light">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
