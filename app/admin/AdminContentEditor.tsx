'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';
import { IconDeviceFloppy, IconRefresh, IconSparkles } from '@tabler/icons-react';
import type { HomepageContent } from '../../lib/homepage';

type TextItem = {
  title: string;
  text: string;
};

type LocationItem = {
  name: string;
  address: string;
};

export function AdminContentEditor({ initialContent }: { initialContent: HomepageContent }) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState('Bereit.');
  const [isSaving, setIsSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/content', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (data.content) {
          setContent(mergeHomepageContent(initialContent, data.content as Partial<HomepageContent>));
          setUpdatedAt(data.updatedAt ?? null);
          setStatus('Runtime-Inhalte aus Cloudflare geladen.');
        } else {
          setStatus('Noch keine Runtime-Inhalte gespeichert. Die Datei-Version ist geladen.');
        }
      })
      .catch((error) => {
        setStatus(`Runtime-Inhalte konnten nicht geladen werden: ${error.message}`);
      });
  }, []);

  const lastSaved = useMemo(() => {
    if (!updatedAt) return 'Noch nicht in D1 gespeichert';

    return new Intl.DateTimeFormat('de-AT', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(updatedAt));
  }, [updatedAt]);

  function update(path: string[], value: string) {
    setContent((current) => setAtPath(current, path, value));
  }

  function updateListItem<T extends TextItem | LocationItem>(path: string[], index: number, key: keyof T, value: string) {
    setContent((current) => {
      const next = structuredClone(current);
      const list = getAtPath(next, path) as T[];
      list[index] = { ...list[index], [key]: value };
      return next;
    });
  }

  function updateStringList(path: string[], index: number, value: string) {
    setContent((current) => {
      const next = structuredClone(current);
      const list = getAtPath(next, path) as string[];
      list[index] = value;
      return next;
    });
  }

  async function saveContent() {
    setIsSaving(true);
    setStatus('Speichern...');

    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Speichern fehlgeschlagen.');
      }

      setUpdatedAt(data.updatedAt);
      setStatus('Gespeichert. Die öffentliche Seite lädt diese Inhalte jetzt zur Laufzeit.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Box className="adminPage">
      <Container size="xl" py={{ base: 28, md: 44 }}>
        <Group justify="space-between" align="flex-start" mb="xl">
          <Box>
            <Text className="sectionLabel">Runtime CMS</Text>
            <Title order={1}>Inhalte bearbeiten</Title>
            <Text c="dimmed" mt="xs">
              Letzte Speicherung: {lastSaved}
            </Text>
          </Box>
          <Group>
            <Button component="a" href="/" variant="default">
              Website ansehen
            </Button>
            <Button leftSection={<IconDeviceFloppy size={18} />} color="teal" loading={isSaving} onClick={saveContent}>
              Speichern
            </Button>
          </Group>
        </Group>

        <Alert icon={<IconSparkles size={18} />} color="teal" mb="lg">
          {status}
        </Alert>

        <Tabs defaultValue="start">
          <Tabs.List>
            <Tabs.Tab value="start">Start</Tabs.Tab>
            <Tabs.Tab value="angebot">Angebot</Tabs.Tab>
            <Tabs.Tab value="kontakt">Kontakt</Tabs.Tab>
            <Tabs.Tab value="blog">Blog</Tabs.Tab>

          </Tabs.List>

          <Tabs.Panel value="start" pt="lg">
            <Stack gap="md">
              <AdminCard title="Marke">
                <SimpleGrid cols={{ base: 1, md: 3 }}>
                  <TextInput label="Name" value={content.brand.name} onChange={(event) => update(['brand', 'name'], event.currentTarget.value)} />
                  <TextInput label="Untertitel" value={content.brand.subtitle} onChange={(event) => update(['brand', 'subtitle'], event.currentTarget.value)} />
                  <TextInput label="Kürzel" value={content.brand.mark} onChange={(event) => update(['brand', 'mark'], event.currentTarget.value)} />
                </SimpleGrid>
              </AdminCard>

              <AdminCard title="Hero">
                <Stack>
                  <TextInput label="Badge" value={content.hero.badge} onChange={(event) => update(['hero', 'badge'], event.currentTarget.value)} />
                  <Textarea label="Titel" minRows={2} value={content.hero.title} onChange={(event) => update(['hero', 'title'], event.currentTarget.value)} />
                  <Textarea label="Text" minRows={3} value={content.hero.text} onChange={(event) => update(['hero', 'text'], event.currentTarget.value)} />
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Primärer Button" value={content.hero.primaryButton} onChange={(event) => update(['hero', 'primaryButton'], event.currentTarget.value)} />
                    <TextInput label="Sekundärer Button" value={content.hero.secondaryButton} onChange={(event) => update(['hero', 'secondaryButton'], event.currentTarget.value)} />
                  </SimpleGrid>
                  <TextInput label="Bildpfad" value={content.hero.image} onChange={(event) => update(['hero', 'image'], event.currentTarget.value)} />
                  <TextInput label="Bildbeschreibung" value={content.hero.imageAlt} onChange={(event) => update(['hero', 'imageAlt'], event.currentTarget.value)} />
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Hinweis-Titel" value={content.hero.noteTitle} onChange={(event) => update(['hero', 'noteTitle'], event.currentTarget.value)} />
                    <Textarea label="Hinweis-Text" value={content.hero.noteText} onChange={(event) => update(['hero', 'noteText'], event.currentTarget.value)} />
                  </SimpleGrid>
                </Stack>
              </AdminCard>

              <TextItemList title="Infokacheln" items={content.infoItems} onChange={(index, key, value) => updateListItem<TextItem>(['infoItems'], index, key, value)} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="angebot" pt="lg">
            <Stack gap="md">
              <SectionIntroEditor title="Angebot Einleitung" value={content.servicesIntro} path={['servicesIntro']} onChange={update} />
              <TextItemList title="Angebote" items={content.services} onChange={(index, key, value) => updateListItem<TextItem>(['services'], index, key, value)} />
              <AdminCard title="Arbeitsweise">
                <Stack>
                  <TextInput label="Label" value={content.approach.label} onChange={(event) => update(['approach', 'label'], event.currentTarget.value)} />
                  <TextInput label="Titel" value={content.approach.title} onChange={(event) => update(['approach', 'title'], event.currentTarget.value)} />
                  {content.approach.paragraphs.map((paragraph, index) => (
                    <Textarea key={index} label={`Absatz ${index + 1}`} minRows={3} value={paragraph} onChange={(event) => updateStringList(['approach', 'paragraphs'], index, event.currentTarget.value)} />
                  ))}
                  <TextInput label="Themen-Titel" value={content.approach.topicsTitle} onChange={(event) => update(['approach', 'topicsTitle'], event.currentTarget.value)} />
                  {content.approach.topics.map((topic, index) => (
                    <TextInput key={index} label={`Thema ${index + 1}`} value={topic} onChange={(event) => updateStringList(['approach', 'topics'], index, event.currentTarget.value)} />
                  ))}
                </Stack>
              </AdminCard>
              <TextItemList title="Ablauf" items={content.process.steps} onChange={(index, key, value) => updateListItem<TextItem>(['process', 'steps'], index, key, value)} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="kontakt" pt="lg">
            <Stack gap="md">
              <AdminCard title="Kontakt">
                <Stack>
                  <TextInput label="Label" value={content.contact.label} onChange={(event) => update(['contact', 'label'], event.currentTarget.value)} />
                  <TextInput label="Titel" value={content.contact.title} onChange={(event) => update(['contact', 'title'], event.currentTarget.value)} />
                  <Textarea label="Text" minRows={3} value={content.contact.text} onChange={(event) => update(['contact', 'text'], event.currentTarget.value)} />
                  <TextInput label="Adresse" value={content.contact.address} onChange={(event) => update(['contact', 'address'], event.currentTarget.value)} />
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Telefon" value={content.contact.phone} onChange={(event) => update(['contact', 'phone'], event.currentTarget.value)} />
                    <TextInput label="E-Mail" value={content.contact.email} onChange={(event) => update(['contact', 'email'], event.currentTarget.value)} />
                  </SimpleGrid>
                  <TextInput label="E-Mail Betreff" value={content.contact.emailSubject} onChange={(event) => update(['contact', 'emailSubject'], event.currentTarget.value)} />
                  <Textarea label="E-Mail Textvorlage" minRows={5} value={content.contact.emailBody} onChange={(event) => update(['contact', 'emailBody'], event.currentTarget.value)} />
                </Stack>
              </AdminCard>

              <AdminCard title="Praxisstandorte">
                <Stack>
                  {content.contact.locations.map((location, index) => (
                    <SimpleGrid key={index} cols={{ base: 1, md: 2 }}>
                      <TextInput label={`Standort ${index + 1}`} value={location.name} onChange={(event) => updateListItem<LocationItem>(['contact', 'locations'], index, 'name', event.currentTarget.value)} />
                      <TextInput label="Adresse" value={location.address} onChange={(event) => updateListItem<LocationItem>(['contact', 'locations'], index, 'address', event.currentTarget.value)} />
                    </SimpleGrid>
                  ))}
                </Stack>
              </AdminCard>

              <AdminCard title="Kontaktformular und Zeiten">
                <Stack>
                  <TextInput label="Formular-Titel" value={content.contact.contactFormTitle} onChange={(event) => update(['contact', 'contactFormTitle'], event.currentTarget.value)} />
                  <Textarea label="Formular-Text" value={content.contact.contactFormText} onChange={(event) => update(['contact', 'contactFormText'], event.currentTarget.value)} />
                  <TextInput label="Button" value={content.contact.contactFormButton} onChange={(event) => update(['contact', 'contactFormButton'], event.currentTarget.value)} />
                  <TextInput label="Erfolgsmeldung" value={content.contact.contactFormSuccess} onChange={(event) => update(['contact', 'contactFormSuccess'], event.currentTarget.value)} />
                  <TextInput label="Öffnungszeiten Titel" value={content.contact.hoursTitle} onChange={(event) => update(['contact', 'hoursTitle'], event.currentTarget.value)} />
                  {content.contact.hours.map((line, index) => (
                    <TextInput key={index} label={`Zeile ${index + 1}`} value={line} onChange={(event) => updateStringList(['contact', 'hours'], index, event.currentTarget.value)} />
                  ))}
                </Stack>
              </AdminCard>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="blog" pt="lg">
            <SectionIntroEditor title="Blog-Teaser" value={content.blogTeaser} path={['blogTeaser']} onChange={update} />
          </Tabs.Panel>

        </Tabs>


        <Stack gap="md" mt="xl">
          <Text className="sectionLabel">Footer</Text>
          <AdminCard title="Footer und Download">
            <Stack>
              <TextInput label="Footer-Text" value={content.footer.text} onChange={(event) => update(['footer', 'text'], event.currentTarget.value)} />
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                <TextInput label="Download-Beschriftung" value={content.footer.downloadLabel} onChange={(event) => update(['footer', 'downloadLabel'], event.currentTarget.value)} />
                <TextInput label="Download-Datei" value={content.footer.downloadHref} onChange={(event) => update(['footer', 'downloadHref'], event.currentTarget.value)} />
              </SimpleGrid>
            </Stack>
          </AdminCard>

          <Text className="sectionLabel">Rechtliches</Text>
          <AdminCard title="Impressum">
            <Stack>
              <TextInput label="Titel" value={content.legalPages.impressum.title} onChange={(event) => update(['legalPages', 'impressum', 'title'], event.currentTarget.value)} />
              <Textarea label="Text" minRows={16} value={content.legalPages.impressum.text} onChange={(event) => update(['legalPages', 'impressum', 'text'], event.currentTarget.value)} />
            </Stack>
          </AdminCard>

          <AdminCard title="Datenschutzerklärung">
            <Stack>
              <TextInput label="Titel" value={content.legalPages.datenschutzerklaerung.title} onChange={(event) => update(['legalPages', 'datenschutzerklaerung', 'title'], event.currentTarget.value)} />
              <Textarea label="Text" minRows={18} value={content.legalPages.datenschutzerklaerung.text} onChange={(event) => update(['legalPages', 'datenschutzerklaerung', 'text'], event.currentTarget.value)} />
            </Stack>
          </AdminCard>
        </Stack>        <Divider my="xl" />
        <Group justify="space-between">
          <Button leftSection={<IconRefresh size={18} />} variant="default" onClick={() => window.location.reload()}>
            Neu laden
          </Button>
          <Button leftSection={<IconDeviceFloppy size={18} />} color="teal" loading={isSaving} onClick={saveContent}>
            Speichern
          </Button>
        </Group>
      </Container>
    </Box>
  );
}

function mergeHomepageContent(fallback: HomepageContent, runtime: Partial<HomepageContent>): HomepageContent {
  return {
    ...fallback,
    ...runtime,
    brand: { ...fallback.brand, ...runtime.brand },
    hero: { ...fallback.hero, ...runtime.hero },
    servicesIntro: { ...fallback.servicesIntro, ...runtime.servicesIntro },
    approach: { ...fallback.approach, ...runtime.approach },
    process: { ...fallback.process, ...runtime.process },
    blogTeaser: { ...fallback.blogTeaser, ...runtime.blogTeaser },
    contact: { ...fallback.contact, ...runtime.contact },
    footer: { ...fallback.footer, ...runtime.footer },
    legalPages: {
      impressum: {
        ...fallback.legalPages.impressum,
        ...runtime.legalPages?.impressum
      },
      datenschutzerklaerung: {
        ...fallback.legalPages.datenschutzerklaerung,
        ...runtime.legalPages?.datenschutzerklaerung
      }
    }
  };
}

function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="adminCard" radius="md" padding="xl">
      <Title order={2} mb="lg">
        {title}
      </Title>
      {children}
    </Card>
  );
}

function SectionIntroEditor({
  title,
  value,
  path,
  onChange
}: {
  title: string;
  value: { label: string; title: string; text?: string; badge?: string; cardTitle?: string; cardText?: string; button?: string };
  path: string[];
  onChange: (path: string[], value: string) => void;
}) {
  return (
    <AdminCard title={title}>
      <Stack>
        <TextInput label="Label" value={value.label} onChange={(event) => onChange([...path, 'label'], event.currentTarget.value)} />
        <TextInput label="Titel" value={value.title} onChange={(event) => onChange([...path, 'title'], event.currentTarget.value)} />
        {'text' in value && <Textarea label="Text" minRows={3} value={value.text ?? ''} onChange={(event) => onChange([...path, 'text'], event.currentTarget.value)} />}
        {'badge' in value && <TextInput label="Badge" value={value.badge ?? ''} onChange={(event) => onChange([...path, 'badge'], event.currentTarget.value)} />}
        {'cardTitle' in value && <TextInput label="Karten-Titel" value={value.cardTitle ?? ''} onChange={(event) => onChange([...path, 'cardTitle'], event.currentTarget.value)} />}
        {'cardText' in value && <Textarea label="Karten-Text" value={value.cardText ?? ''} onChange={(event) => onChange([...path, 'cardText'], event.currentTarget.value)} />}
        {'button' in value && <TextInput label="Button" value={value.button ?? ''} onChange={(event) => onChange([...path, 'button'], event.currentTarget.value)} />}
      </Stack>
    </AdminCard>
  );
}

function TextItemList({
  title,
  items,
  onChange
}: {
  title: string;
  items: TextItem[];
  onChange: (index: number, key: keyof TextItem, value: string) => void;
}) {
  return (
    <AdminCard title={title}>
      <Stack>
        {items.map((item, index) => (
          <Box key={index}>
            {index > 0 && <Divider my="md" />}
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              <TextInput label={`Titel ${index + 1}`} value={item.title} onChange={(event) => onChange(index, 'title', event.currentTarget.value)} />
              <Textarea label="Text" minRows={3} value={item.text} onChange={(event) => onChange(index, 'text', event.currentTarget.value)} />
            </SimpleGrid>
          </Box>
        ))}
      </Stack>
    </AdminCard>
  );
}

function getAtPath(target: Record<string, unknown>, path: string[]) {
  return path.reduce<unknown>((current, key) => (current as Record<string, unknown>)[key], target);
}

function setAtPath<T extends Record<string, unknown>>(target: T, path: string[], value: string): T {
  const next = structuredClone(target);
  const parent = getAtPath(next, path.slice(0, -1)) as Record<string, unknown>;
  parent[path[path.length - 1]] = value;
  return next;
}
