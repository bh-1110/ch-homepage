import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type HomepageContent = {
  brand: {
    name: string;
    subtitle: string;
    mark: string;
  };
  hero: {
    badge: string;
    title: string;
    text: string;
    primaryButton: string;
    secondaryButton: string;
    image: string;
    imageAlt: string;
    noteTitle: string;
    noteText: string;
  };
  infoItems: TextItem[];
  servicesIntro: SectionIntro;
  services: TextItem[];
  approach: {
    label: string;
    title: string;
    paragraphs: string[];
    topicsTitle: string;
    topics: string[];
  };
  process: {
    label: string;
    title: string;
    steps: TextItem[];
  };
  blogTeaser: {
    label: string;
    title: string;
    text: string;
    badge: string;
    cardTitle: string;
    cardText: string;
    button: string;
  };
  contact: {
    label: string;
    title: string;
    text: string;
    address: string;
    locations: LocationItem[];
    phone: string;
    email: string;
    emailSubject: string;
    emailBody: string;
    contactFormTitle: string;
    contactFormText: string;
    contactFormButton: string;
    contactFormSuccess: string;
    contactFormEndpoint: string;
    googleTagManagerId: string;
    googleAdsTagId: string;
    phoneConversionSendTo: string;
    emailConversionSendTo: string;
    conversionCurrency: string;
    conversionValue: string;
    hoursTitle: string;
    hours: string[];
  };
  footer: {
    text: string;
    downloadLabel: string;
    downloadHref: string;
  };
  legalPages: {
    impressum: LegalPageContent;
    datenschutzerklaerung: LegalPageContent;
  };
};

type TextItem = {
  title: string;
  text: string;
};

type SectionIntro = {
  label: string;
  title: string;
  text: string;
};

type LocationItem = {
  name: string;
  address: string;
};

export type LegalPageContent = {
  title: string;
  text: string;
};

export function getHomepageContent(): HomepageContent {
  const file = readFileSync(join(process.cwd(), 'content', 'pages', 'homepage.json'), 'utf8');

  return JSON.parse(file) as HomepageContent;
}
