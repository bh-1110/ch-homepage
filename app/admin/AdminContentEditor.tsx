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
import { IconArrowUp, IconDeviceFloppy, IconPlus, IconRefresh, IconSparkles, IconTrash } from '@tabler/icons-react';
import type { HomepageContent } from '../../lib/homepage';

type TextItem = {
  title: string;
  text: string;
};

type LocationItem = {
  name: string;
  address: string;
};

type D1Status = 'loading' | 'loaded' | 'empty' | 'invalid' | 'error';

export function AdminContentEditor({ initialContent }: { initialContent: HomepageContent }) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState('D1-Inhalte werden geladen...');
  const [d1Status, setD1Status] = useState<D1Status>('loading');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isLocalEnvironment, setIsLocalEnvironment] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const isLocal = isLocalHost();
    setIsLocalEnvironment(isLocal);

    if (isLocal) {
      setStatus('Lokaler Datei-Stand aus content/pages/homepage.json geladen. Reload from D1 lädt bewusst den Cloudflare-Stand.');
      setD1Status('error');
      return;
    }

    loadFromD1();
  }, []);

  const lastSaved = useMemo(() => {
    if (!updatedAt) return 'Noch nicht in D1 gespeichert';

    return new Intl.DateTimeFormat('de-AT', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(updatedAt));
  }, [updatedAt]);
  const heroTitles = useMemo(() => getEditableHeroTitles(content), [content]);

  async function loadFromD1() {
    setIsReloading(true);
    setD1Status('loading');
    setStatus('D1-Inhalte werden geladen...');

    try {
      const response = await fetch('/api/admin/content', { cache: 'no-store' });
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        setD1Status('error');
        setUpdatedAt(null);
        setStatus('D1 ist in diesem lokalen Next-Dev-Server nicht verfügbar. Lokales Speichern bleibt möglich; Upload to D1 funktioniert erst in der Cloudflare-Umgebung.');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'D1-Inhalte konnten nicht geladen werden.');
      }

      if (!data.content) {
        setD1Status('empty');
        setUpdatedAt(null);
        setStatus('Keine D1-Inhalte vorhanden. Speichern ist gesperrt, damit der lokale Datei-Fallback nicht nach D1 geschrieben wird.');
        return;
      }

      if (!isHomepageContent(data.content)) {
        setD1Status('invalid');
        setUpdatedAt(data.updatedAt ?? null);
        setStatus('D1-Inhalte sind unvollständig oder veraltet. Speichern ist gesperrt, damit keine Datei-Fallback-Texte nach D1 gelangen.');
        return;
      }

      setContent(data.content);
      setUpdatedAt(data.updatedAt ?? null);
      setD1Status('loaded');
      setStatus('Runtime-Inhalte direkt aus D1 geladen. Speichern ist freigegeben.');
    } catch (error) {
      setD1Status('error');
      setStatus(`D1-Inhalte konnten nicht geladen werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsReloading(false);
    }
  }

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

  function updateHeroTitle(index: number, value: string) {
    setContent((current) => {
      const next = structuredClone(current);
      const titles = getEditableHeroTitles(next);
      titles[index] = value;
      next.hero.titles = titles;
      next.hero.title = getDisplayHeroTitles(next)[0] || next.hero.title;
      return next;
    });
  }

  function addHeroTitle() {
    setContent((current) => {
      const next = structuredClone(current);
      next.hero.titles = [...getEditableHeroTitles(next), ''];
      return next;
    });
  }

  function removeHeroTitle(index: number) {
    setContent((current) => {
      const next = structuredClone(current);
      const titles = getEditableHeroTitles(next).filter((_, itemIndex) => itemIndex !== index);
      next.hero.titles = titles.length ? titles : [next.hero.title];
      next.hero.title = getDisplayHeroTitles(next)[0] || next.hero.title;
      return next;
    });
  }

  async function saveContent() {
    if (!isLocalEnvironment) return;

    setIsSaving(true);
    setStatus('Save to local...');

    try {
      const response = await fetch('/api/local-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Save to local fehlgeschlagen.');
      }

      setStatus('In content/pages/homepage.json gespeichert. Andere Browser sehen den Stand nach Reload.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Save to local fehlgeschlagen.');
    } finally {
      setIsSaving(false);
    }
  }

  async function reloadFromLocal() {
    if (!isLocalEnvironment) return;

    setIsReloading(true);
    setStatus('Lokaler Datei-Stand wird geladen...');

    try {
      const response = await fetch('/api/local-content', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Reload from local fehlgeschlagen.');
      }

      if (!isHomepageContent(data.content)) {
        throw new Error('Lokale homepage.json ist unvollständig oder ungültig.');
      }

      setContent(data.content);
      setStatus('Lokaler Datei-Stand aus content/pages/homepage.json geladen.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Reload from local fehlgeschlagen.');
    } finally {
      setIsReloading(false);
    }
  }

  async function uploadToD1() {
    const confirmed = window.confirm(
      'Aktuellen CMS-Stand nach D1 hochladen? Dadurch werden die derzeitigen D1-Inhalte überschrieben.'
    );

    if (!confirmed) return;

    setIsUploading(true);
    setStatus('Upload to D1...');

    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, source: 'local-upload', confirmUpload: true })
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data?.error || 'Upload to D1 fehlgeschlagen.');
      }

      setUpdatedAt(data.updatedAt);
      setD1Status('loaded');
      setStatus('Upload to D1 abgeschlossen. Dieser Stand ist jetzt der Runtime-Inhalt.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload to D1 fehlgeschlagen.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Box className="adminPage" id="admin-top">
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
            <Button leftSection={<IconRefresh size={18} />} variant="default" loading={isReloading} onClick={loadFromD1}>
              Reload from D1
            </Button>
            <Button
              leftSection={<IconRefresh size={18} />}
              variant="default"
              disabled={!isLocalEnvironment}
              onClick={reloadFromLocal}
            >
              Reload from local
            </Button>
            <Button variant="light" color="orange" loading={isUploading} onClick={uploadToD1}>
              Upload to D1
            </Button>
            <Button leftSection={<IconDeviceFloppy size={18} />} color="teal" loading={isSaving && isLocalEnvironment} disabled={!isLocalEnvironment} onClick={saveContent}>
              Save to local
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
                  <TextInput
                    label="Titel-Wechsel in Sekunden"
                    value={String(content.hero.titleIntervalSeconds ?? 5)}
                    onChange={(event) => update(['hero', 'titleIntervalSeconds'], event.currentTarget.value)}
                  />
                  {heroTitles.map((title, index) => (
                    <Group key={index} align="flex-end" wrap="nowrap">
                      <Textarea
                        label={`Hero-Titel ${index + 1}`}
                        minRows={2}
                        value={title}
                        style={{ flex: 1 }}
                        onChange={(event) => updateHeroTitle(index, event.currentTarget.value)}
                      />
                      <Button
                        variant="subtle"
                        color="red"
                        aria-label={`Hero-Titel ${index + 1} entfernen`}
                        disabled={heroTitles.length <= 1}
                        onClick={() => removeHeroTitle(index)}
                      >
                        <IconTrash size={18} />
                      </Button>
                    </Group>
                  ))}
                  <Button variant="default" leftSection={<IconPlus size={18} />} onClick={addHeroTitle}>
                    Hero-Titel hinzufügen
                  </Button>
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
              <AdminCard title="Coaching">
                <Stack>
                  <TextInput label="Label" value={content.coaching.label} onChange={(event) => update(['coaching', 'label'], event.currentTarget.value)} />
                  <TextInput label="Titel" value={content.coaching.title} onChange={(event) => update(['coaching', 'title'], event.currentTarget.value)} />
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <Box className="contentCompareBox">
                      <Text fw={700}>Wird auf der Homepage angezeigt</Text>
                      <Text size="sm" c="dimmed" className="contentCompareText">
                        {initialContent.coaching.text}
                      </Text>
                    </Box>
                    <Box className="contentCompareBox">
                      <Text fw={700}>Wird im CMS angezeigt</Text>
                      <Text size="sm" c="dimmed" className="contentCompareText">
                        {content.coaching.text}
                      </Text>
                    </Box>
                  </SimpleGrid>
                  <Textarea label="Text" minRows={10} value={content.coaching.text} onChange={(event) => update(['coaching', 'text'], event.currentTarget.value)} />
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Bildpfad" value={content.coaching.image} onChange={(event) => update(['coaching', 'image'], event.currentTarget.value)} />
                    <TextInput label="Bildbeschreibung" value={content.coaching.imageAlt} onChange={(event) => update(['coaching', 'imageAlt'], event.currentTarget.value)} />
                  </SimpleGrid>
                </Stack>
              </AdminCard>
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
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Feldname Name" value={content.contact.contactFormNameLabel ?? 'Name'} onChange={(event) => update(['contact', 'contactFormNameLabel'], event.currentTarget.value)} />
                    <TextInput label="Feldname Telefon" value={content.contact.contactFormPhoneLabel ?? 'Telefon'} onChange={(event) => update(['contact', 'contactFormPhoneLabel'], event.currentTarget.value)} />
                    <TextInput label="Feldname E-Mail" value={content.contact.contactFormEmailLabel ?? 'E-Mail'} onChange={(event) => update(['contact', 'contactFormEmailLabel'], event.currentTarget.value)} />
                    <TextInput label="Feldname Nachricht" value={content.contact.contactFormMessageLabel ?? 'Nachricht'} onChange={(event) => update(['contact', 'contactFormMessageLabel'], event.currentTarget.value)} />
                  </SimpleGrid>
                  <Textarea
                    label="Datenschutz-Bestätigung"
                    value={
                      content.contact.contactFormPrivacyLabel ??
                      'Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden.'
                    }
                    onChange={(event) => update(['contact', 'contactFormPrivacyLabel'], event.currentTarget.value)}
                  />
                  <TextInput label="Button" value={content.contact.contactFormButton} onChange={(event) => update(['contact', 'contactFormButton'], event.currentTarget.value)} />
                  <TextInput label="Erfolgsmeldung" value={content.contact.contactFormSuccess} onChange={(event) => update(['contact', 'contactFormSuccess'], event.currentTarget.value)} />
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Formular-Absender" value={content.contact.contactFormSender ?? ''} onChange={(event) => update(['contact', 'contactFormSender'], event.currentTarget.value)} />
                    <TextInput label="Formular-Empfänger" value={content.contact.contactFormRecipient ?? ''} onChange={(event) => update(['contact', 'contactFormRecipient'], event.currentTarget.value)} />
                  </SimpleGrid>
                  <TextInput label="Formular-Betreff" value={content.contact.contactFormSubject ?? ''} onChange={(event) => update(['contact', 'contactFormSubject'], event.currentTarget.value)} />
                  <TextInput label="Öffnungszeiten Titel" value={content.contact.hoursTitle} onChange={(event) => update(['contact', 'hoursTitle'], event.currentTarget.value)} />
                  {content.contact.hours.map((line, index) => (
                    <TextInput key={index} label={`Zeile ${index + 1}`} value={line} onChange={(event) => updateStringList(['contact', 'hours'], index, event.currentTarget.value)} />
                  ))}
                </Stack>
              </AdminCard>

              <AdminCard title="Tracking">
                <Stack>
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Google Tag Manager ID" value={content.contact.googleTagManagerId} onChange={(event) => update(['contact', 'googleTagManagerId'], event.currentTarget.value)} />
                    <TextInput label="Google Ads Tag ID" value={content.contact.googleAdsTagId} onChange={(event) => update(['contact', 'googleAdsTagId'], event.currentTarget.value)} />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Telefon Conversion Send To" value={content.contact.phoneConversionSendTo} onChange={(event) => update(['contact', 'phoneConversionSendTo'], event.currentTarget.value)} />
                    <TextInput label="E-Mail Conversion Send To" value={content.contact.emailConversionSendTo} onChange={(event) => update(['contact', 'emailConversionSendTo'], event.currentTarget.value)} />
                  </SimpleGrid>
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <TextInput label="Conversion-Währung" value={content.contact.conversionCurrency} onChange={(event) => update(['contact', 'conversionCurrency'], event.currentTarget.value)} />
                    <TextInput label="Conversion-Wert" value={content.contact.conversionValue} onChange={(event) => update(['contact', 'conversionValue'], event.currentTarget.value)} />
                  </SimpleGrid>
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
          <AdminCard title="Footer">
            <Stack>
              <TextInput label="Footer-Text" value={content.footer.text} onChange={(event) => update(['footer', 'text'], event.currentTarget.value)} />
            </Stack>
          </AdminCard>

          <Text className="sectionLabel">Rechtliches</Text>
          <AdminCard title="Impressum">
            <Stack>
              <TextInput label="Titel" value={content.legalPages.impressum.title} onChange={(event) => update(['legalPages', 'impressum', 'title'], event.currentTarget.value)} />
              <Textarea
                label="Text"
                rows={10}
                autosize={false}
                value={content.legalPages.impressum.text}
                onChange={(event) => update(['legalPages', 'impressum', 'text'], event.currentTarget.value)}
              />
            </Stack>
          </AdminCard>

          <AdminCard title="Datenschutzerklärung">
            <Stack>
              <TextInput label="Titel" value={content.legalPages.datenschutzerklaerung.title} onChange={(event) => update(['legalPages', 'datenschutzerklaerung', 'title'], event.currentTarget.value)} />
              <Textarea
                label="Text"
                rows={10}
                autosize={false}
                value={content.legalPages.datenschutzerklaerung.text}
                onChange={(event) => update(['legalPages', 'datenschutzerklaerung', 'text'], event.currentTarget.value)}
              />
            </Stack>
          </AdminCard>
        </Stack>
      </Container>
      <Button
        component="a"
        href="#admin-top"
        className="adminBackTop"
        color="dark"
        aria-label="Zurück zum Seitenanfang"
      >
        <IconArrowUp size={20} />
      </Button>
    </Box>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isLocalHost() {
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function hasString(value: Record<string, unknown>, key: string) {
  return typeof value[key] === 'string';
}

function isHomepageContent(value: unknown): value is HomepageContent {
  if (!isRecord(value)) return false;

  const brand = value.brand;
  const hero = value.hero;
  const servicesIntro = value.servicesIntro;
  const coaching = value.coaching;
  const approach = value.approach;
  const process = value.process;
  const blogTeaser = value.blogTeaser;
  const contact = value.contact;
  const footer = value.footer;
  const legalPages = value.legalPages;

  return (
    isRecord(brand) &&
    hasString(brand, 'name') &&
    isRecord(hero) &&
    hasString(hero, 'title') &&
    isRecord(servicesIntro) &&
    hasString(servicesIntro, 'title') &&
    Array.isArray(value.services) &&
    isRecord(coaching) &&
    hasString(coaching, 'text') &&
    isRecord(approach) &&
    Array.isArray(approach.paragraphs) &&
    isRecord(process) &&
    Array.isArray(process.steps) &&
    isRecord(blogTeaser) &&
    hasString(blogTeaser, 'title') &&
    isRecord(contact) &&
    hasString(contact, 'email') &&
    isRecord(footer) &&
    hasString(footer, 'text') &&
    isRecord(legalPages)
  );
}

function getEditableHeroTitles(content: HomepageContent) {
  if (Array.isArray(content.hero.titles) && content.hero.titles.length) {
    return [...content.hero.titles];
  }

  return [content.hero.title];
}

function getDisplayHeroTitles(content: HomepageContent) {
  const titles = content.hero.titles?.map((title) => title.trim()).filter(Boolean);

  if (titles?.length) return titles;

  return [content.hero.title].filter(Boolean);
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
