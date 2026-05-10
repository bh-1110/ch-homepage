import '@mantine/core/styles.css';
import './styles.css';

import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';

export const metadata: Metadata = {
  title: 'Psychotherapie in Wien | Mag. Anna Berger',
  description:
    'Psychotherapeutische Praxis in Wien für Erwachsene, Jugendliche und Paare. Ruhige, wertschätzende Begleitung bei Belastung, Angst, Krisen und Beziehungsthemen.'
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
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
