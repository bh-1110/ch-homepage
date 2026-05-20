'use client';

import { useEffect, useState } from 'react';
import {
  Anchor,
  Badge,
  Box,
  Burger,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Drawer,
  Grid,
  Group,
  List,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title
} from '@mantine/core';
import {
  IconArrowRight,
  IconCalendarHeart,
  IconChevronRight,
  IconClock,
  IconCheck,
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconSparkles
} from '@tabler/icons-react';
import type { HomepageContent } from '../lib/homepage';
import { trackContactAction } from './tracking';
import { FloatingActions } from './FloatingActions';
import { GoogleAdsTag } from './GoogleAdsTag';
import { GoogleTagManager } from './GoogleTagManager';

export function HomeClient({ content }: { content: HomepageContent }) {
  const [runtimeContent, setRuntimeContent] = useState(content);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHeroTitleIndex, setActiveHeroTitleIndex] = useState(0);
  const [previousHeroTitle, setPreviousHeroTitle] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch(`/api/content?ts=${Date.now()}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data?.content) {
          setRuntimeContent(mergeHomepageContent(content, data.content as Partial<HomepageContent>));
        }
      })
      .catch(() => {
        // Keep the bundled content when the runtime CMS is not initialized yet.
      });

    return () => {
      active = false;
    };
  }, []);

  content = runtimeContent;
  const heroTitles = getHeroTitles(content);
  const activeHeroTitle = heroTitles[activeHeroTitleIndex % heroTitles.length];
  const heroTitleIntervalMs = getHeroTitleIntervalMs(content);

  useEffect(() => {
    if (heroTitles.length < 2) {
      setActiveHeroTitleIndex(0);
      setPreviousHeroTitle(null);
      return;
    }

    const timer = window.setInterval(() => {
      setPreviousHeroTitle(heroTitles[activeHeroTitleIndex % heroTitles.length]);
      setActiveHeroTitleIndex((index) => (index + 1) % heroTitles.length);
    }, heroTitleIntervalMs);
    const fadeTimer = previousHeroTitle
      ? window.setTimeout(() => setPreviousHeroTitle(null), 900)
      : undefined;

    return () => {
      window.clearInterval(timer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [activeHeroTitleIndex, heroTitles, heroTitleIntervalMs, previousHeroTitle]);

  const contactEmailHref = `mailto:${content.contact.email}?subject=${encodeURIComponent(
    content.contact.emailSubject
  )}&body=${encodeURIComponent(content.contact.emailBody)}`;
  const infoIcons = [
    <IconMessageCircle key="message" size={20} />,
    <IconCalendarHeart key="calendar" size={20} />,
    <IconClock key="clock" size={20} />
  ];
  const navItems = [
    { label: 'Angebot', href: '#angebot' },
    { label: 'Coaching', href: '#coaching' },
    { label: 'Ablauf', href: '#ablauf' },
    { label: 'Blog', href: '/blog' },
    { label: 'Kontakt', href: '#kontakt' }
  ];

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <Box>
      <GoogleTagManager containerId={content.contact.googleTagManagerId} />
      <GoogleAdsTag tagId={content.contact.googleAdsTagId} />
      <FloatingActions
        phone={content.contact.phone}
        email={content.contact.email}
        emailSubject={content.contact.emailSubject}
        emailBody={content.contact.emailBody}
        phoneConversionSendTo={content.contact.phoneConversionSendTo}
        emailConversionSendTo={content.contact.emailConversionSendTo}
        conversionCurrency={content.contact.conversionCurrency}
        conversionValue={content.contact.conversionValue}
      />

      <Box className="hero">
        <Container size="xl" className="heroNavContainer">
          <Group justify="space-between" align="center" className="nav">
            <Group gap="sm">
              <Box className="brandMark">{content.brand.mark}</Box>
              <Box>
                <Text fw={700} lh={1.1}>
                  {content.brand.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {content.brand.subtitle}
                </Text>
              </Box>
            </Group>
            <Group gap="xs" visibleFrom="sm">
              {navItems.slice(0, -1).map((item) => (
                <Button key={item.href} component="a" href={item.href} variant="subtle" color="dark">
                  {item.label}
                </Button>
              ))}
              <Button component="a" href="#kontakt" variant="light" color="teal" leftSection={<IconMail size={17} />}>
                Kontakt
              </Button>
            </Group>
            <Burger
              hiddenFrom="sm"
              opened={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((opened) => !opened)}
              aria-label="Menü öffnen"
              color="var(--ink)"
            />
          </Group>

          <Drawer
            opened={isMobileMenuOpen}
            onClose={closeMobileMenu}
            position="right"
            size="xs"
            title={content.brand.name}
            hiddenFrom="sm"
          >
            <Stack gap="xs">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component="a"
                  href={item.href}
                  variant={item.href === '#kontakt' ? 'light' : 'subtle'}
                  color={item.href === '#kontakt' ? 'teal' : 'dark'}
                  justify="flex-start"
                  onClick={closeMobileMenu}
                  leftSection={item.href === '#kontakt' ? <IconMail size={17} /> : undefined}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Drawer>
        </Container>

        <Box className="heroStage">
          <Paper className="imagePanel" radius="md">
            <img className="heroBackdropImage" src={content.hero.image} alt="" aria-hidden="true" />
            <img className="heroMainImage" src={content.hero.image} alt={content.hero.imageAlt} />
            <Box className="heroTitleOverlay">
              {previousHeroTitle && (
                <Title order={1} className="heroTitle heroTitlePrevious">
                  {previousHeroTitle}
                </Title>
              )}
              <Title key={activeHeroTitle} order={1} className="heroTitle heroTitleCurrent">
                {activeHeroTitle}
              </Title>
            </Box>
          </Paper>
        </Box>

        <Container size="xl">
          <Grid align="center" gap={{ base: 32, md: 52 }} className="heroGrid">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="xl">
                <Badge variant="light" color="teal" size="lg" radius="sm">
                  {content.hero.badge}
                </Badge>
                <Stack gap="md">
                  <Text size="xl" c="dimmed" maw={640}>
                    {content.hero.text}
                  </Text>
                </Stack>
                <Group gap="sm">
                  <Button
                    component="a"
                    href="#kontakt"
                    size="lg"
                    color="teal"
                    rightSection={<IconArrowRight size={18} />}
                  >
                    {content.hero.primaryButton}
                  </Button>
                  <Button component="a" href="#angebot" size="lg" variant="default">
                    {content.hero.secondaryButton}
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size="xl" py={{ base: 48, md: 80 }}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {content.infoItems.map((item, index) => (
            <InfoItem key={item.title} icon={infoIcons[index] ?? infoIcons[0]} title={item.title} text={item.text} />
          ))}
        </SimpleGrid>
      </Container>

      <Box className="sectionBand" id="angebot">
        <Container size="xl">
          <Grid gap={{ base: 28, md: 48 }}>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text className="sectionLabel">{content.servicesIntro.label}</Text>
              <Title order={2}>{content.servicesIntro.title}</Title>
              <Text mt="md" c="dimmed">
                {content.servicesIntro.text}
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {content.services.map((service) => (
                  <Card key={service.title} className="serviceCard" radius="md" padding="xl">
                    <Group gap="sm" mb="sm">
                      <ThemeIcon color="teal" variant="light" radius="sm">
                        <IconChevronRight size={18} />
                      </ThemeIcon>
                      <Title order={3}>{service.title}</Title>
                    </Group>
                    <Text c="dimmed">{service.text}</Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Container size="xl" py={{ base: 56, md: 88 }} id="coaching">
        <Grid align="center" gap={{ base: 32, md: 56 }}>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box className="coachingImagePanel">
              <img src={content.coaching.image} alt={content.coaching.imageAlt} />
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Text className="sectionLabel">{content.coaching.label}</Text>
            <Title order={2}>{content.coaching.title}</Title>
            <Stack gap="md" mt="md">
              {content.coaching.text.split('\n\n').map((paragraph) => (
                <Text key={paragraph} c="dimmed" size="lg">
                  {paragraph}
                </Text>
              ))}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      <Container size="xl" py={{ base: 56, md: 88 }}>
        <Grid align="center" gap={{ base: 32, md: 56 }}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md">
              <Text className="sectionLabel">{content.approach.label}</Text>
              <Title order={2}>{content.approach.title}</Title>
              {content.approach.paragraphs.map((paragraph) => (
                <Text key={paragraph} c="dimmed" size="lg">
                  {paragraph}
                </Text>
              ))}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper className="topicsPanel" radius="md" p="xl">
              <Group gap="sm" mb="md">
                <ThemeIcon color="yellow" variant="light" radius="sm">
                  <IconSparkles size={20} />
                </ThemeIcon>
                <Title order={3}>{content.approach.topicsTitle}</Title>
              </Group>
              <List spacing="sm" size="lg" icon={<ThemeIcon color="teal" radius="xl" size={20} />}>
                {content.approach.topics.map((topic) => (
                  <List.Item key={topic}>{topic}</List.Item>
                ))}
              </List>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      <Box className="sectionBand" id="ablauf">
        <Container size="xl">
          <Text className="sectionLabel">{content.process.label}</Text>
          <Title order={2} maw={720}>
            {content.process.title}
          </Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mt="xl">
            {content.process.steps.map((step, index) => (
              <Card key={step.title} className="stepCard" radius="md" padding="xl">
                <Text className="stepNumber">{String(index + 1).padStart(2, '0')}</Text>
                <Title order={3}>{step.title}</Title>
                <Text c="dimmed" mt="sm">
                  {step.text}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="xl" py={{ base: 56, md: 88 }}>
        <Grid align="center" gap={{ base: 28, md: 48 }}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Text className="sectionLabel">{content.blogTeaser.label}</Text>
            <Title order={2}>{content.blogTeaser.title}</Title>
            <Text c="dimmed" size="lg" mt="md">
              {content.blogTeaser.text}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card className="blogTeaser" radius="md" padding="xl">
              <Badge color="teal" variant="light" radius="sm" mb="md">
                {content.blogTeaser.badge}
              </Badge>
              <Title order={3}>{content.blogTeaser.cardTitle}</Title>
              <Text c="dimmed" mt="sm">
                {content.blogTeaser.cardText}
              </Text>
              <Button
                component="a"
                href="/blog"
                color="teal"
                variant="light"
                mt="xl"
                rightSection={<IconArrowRight size={17} />}
              >
                {content.blogTeaser.button}
              </Button>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      <Container size="xl" py={{ base: 56, md: 88 }} id="kontakt">
        <Grid gap={{ base: 32, md: 56 }}>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Text className="sectionLabel">{content.contact.label}</Text>
            <Title order={2}>{content.contact.title}</Title>
            <Text c="dimmed" size="lg" mt="md">
              {content.contact.text}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper className="contactPanel" radius="md" p="xl">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                <Stack gap="md">
                  <ContactLine icon={<IconMapPin size={19} />} text={content.contact.address} />
                  <ContactLine icon={<IconPhone size={19} />} text={content.contact.phone} href={`tel:${content.contact.phone.replace(/\s/g, '')}`} />
                  <ContactLine icon={<IconMail size={19} />} text={content.contact.email} href={contactEmailHref} />
                </Stack>
                <Stack gap="sm">
                  <Text fw={700}>{content.contact.hoursTitle}</Text>
                  {content.contact.hours.map((line) => (
                    <Text key={line} c="dimmed">
                      {line}
                    </Text>
                  ))}
                </Stack>
              </SimpleGrid>
              <Divider my="xl" />
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {content.contact.locations.map((location) => (
                  <Box key={location.name} className="locationMap">
                    <Text fw={700}>{location.name}</Text>
                    <Text c="dimmed" size="sm" mb="sm">
                      {location.address}
                    </Text>
                    <Box className="mapFrame">
                      <iframe
                        title={`Karte ${location.name}`}
                        src={getMapUrl(location.address)}
                        referrerPolicy="no-referrer-when-downgrade"
                        loading="lazy"
                      />
                    </Box>
                    <Anchor href={getMapLink(location.address)} target="_blank" rel="noreferrer" size="sm">
                      In Google Maps öffnen
                    </Anchor>
                  </Box>
                ))}
              </SimpleGrid>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      <Box className="sectionBand" id="kontaktformular">
        <Container size="xl">
          <Grid gap={{ base: 32, md: 56 }} align="start">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Text className="sectionLabel">Kontaktformular</Text>
              <Title order={2}>{content.contact.contactFormTitle}</Title>
              <Text c="dimmed" size="lg" mt="md">
                {content.contact.contactFormText}
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <ContactForm content={content} />
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box component="footer" className="siteFooter">
        <Container size="xl">
          <Group justify="space-between" align="center" gap="md">
            <Text size="sm" c="dimmed">
              {content.footer.text}
            </Text>
            <Group gap="md">
              <Anchor href="/impressum" size="sm" c="dark">
                Impressum
              </Anchor>
              <Anchor href="/datenschutzerklaerung" size="sm" c="dark">
                Datenschutzerklärung
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}

function getHeroTitles(content: HomepageContent) {
  const titles = content.hero.titles?.map((title) => title.trim()).filter(Boolean);
  return titles?.length ? titles : [content.hero.title];
}

function getHeroTitleIntervalMs(content: HomepageContent) {
  const seconds = Number(content.hero.titleIntervalSeconds);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 5000;
}

function mergeHomepageContent(fallback: HomepageContent, runtime: Partial<HomepageContent>): HomepageContent {
  return {
    ...fallback,
    ...runtime,
    brand: { ...fallback.brand, ...runtime.brand },
    hero: { ...fallback.hero, ...runtime.hero },
    servicesIntro: { ...fallback.servicesIntro, ...runtime.servicesIntro },
    coaching: { ...fallback.coaching, ...runtime.coaching },
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

function ContactForm({ content }: { content: HomepageContent }) {
  const [status, setStatus] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const contactFormEndpoint = content.contact.contactFormEndpoint || '/api/contact';
  const hasValidEmail = isEmail(email);
  const hasValidPhone = isPlausiblePhone(phone);
  const canSubmit = hasValidEmail || hasValidPhone;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setPhoneTouched(true);
      setStatus('Bitte geben Sie eine gültige Telefonnummer oder E-Mail-Adresse ein.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    trackContactAction('contact_form_submit_click', {
      contact_action: 'contact_form_submit',
      has_endpoint: true
    });

    setIsSubmitting(true);
    setStatus('');

    try {
      const response = await fetch(contactFormEndpoint, {
        method: 'POST',
        body: formData
      });
      const responseText = await response.text().catch(() => '');
      const data = parseJsonOrNull(responseText);

      if (response.ok) {
        form.reset();
        setEmail('');
        setPhone('');
        setPhoneTouched(false);
        setStatus('');
        setSuccessOpen(true);
      } else {
        setStatus(buildContactErrorMessage(response.status, data, responseText));
      }
    } catch {
      setStatus('Die Anfrage konnte nicht gesendet werden. Bitte nutzen Sie E-Mail oder Telefon.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Paper component="form" className="contactFormPanel" radius="md" p="xl" onSubmit={handleSubmit}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput name="name" label={content.contact.contactFormNameLabel || 'Name'} required />
            <TextInput
              name="phone"
              label={content.contact.contactFormPhoneLabel || 'Telefon'}
              value={phone}
              onChange={(event) => setPhone(event.currentTarget.value)}
              onBlur={() => setPhoneTouched(true)}
              error={phoneTouched && phone.trim() && !hasValidPhone ? 'Bitte geben Sie eine plausible Telefonnummer ein.' : undefined}
            />
          </SimpleGrid>
          <TextInput
            name="email"
            label={content.contact.contactFormEmailLabel || 'E-Mail'}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
          <Textarea name="message" label={content.contact.contactFormMessageLabel || 'Nachricht'} minRows={5} required />
          <Checkbox
            required
            name="privacy"
            label={
              content.contact.contactFormPrivacyLabel ||
              'Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden.'
            }
          />
          <Group justify="space-between" align="center">
            <Text size="sm" c={status ? 'red' : 'dimmed'}>
              {status}
            </Text>
            <Button
              type="submit"
              color="teal"
              loading={isSubmitting}
              disabled={!canSubmit}
              rightSection={<IconArrowRight size={17} />}
            >
              {content.contact.contactFormButton}
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Modal opened={successOpen} onClose={() => setSuccessOpen(false)} centered withCloseButton={false} size="md">
        <Stack align="center" gap="lg" ta="center" py="md">
          <ThemeIcon size={64} radius="xl" color="teal" variant="light">
            <IconCheck size={36} />
          </ThemeIcon>
          <Title order={2}>Nachricht gesendet</Title>
          <Text size="lg">{content.contact.contactFormSuccess}</Text>
          <Button size="lg" color="teal" onClick={() => setSuccessOpen(false)}>
            Schließen
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

function isEmail(value: string) {
  const trimmed = value.trim();
  return Boolean(trimmed) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function parseJsonOrNull(value: string) {
  if (!value) return null;

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function buildContactErrorMessage(status: number, data: Record<string, unknown> | null, responseText: string) {
  const providerStatus = data?.providerStatus;
  const providerCode = data?.providerCode;
  const providerMessage = data?.providerMessage;
  const fallbackMessage = typeof data?.error === 'string' ? data.error : 'Die Anfrage konnte nicht gesendet werden.';
  const details = [
    `HTTP-Status: ${status}`,
    providerStatus ? `Brevo-Status: ${providerStatus}` : '',
    providerCode ? `Brevo-Code: ${providerCode}` : '',
    providerMessage ? `Brevo-Meldung: ${providerMessage}` : '',
    !data && responseText ? `Antwort: ${responseText.slice(0, 120)}` : ''
  ].filter(Boolean);

  return `${fallbackMessage} Bitte nutzen Sie E-Mail oder Telefon. ${details.join(' | ')}`;
}

function isPlausiblePhone(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return false;
  if (!/^\+?[0-9][0-9\s()./-]*$/.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function InfoItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Paper className="infoItem" radius="md" p="lg">
      <Group gap="md" align="flex-start">
        <ThemeIcon color="teal" variant="light" size="lg" radius="sm">
          {icon}
        </ThemeIcon>
        <Box>
          <Text fw={700}>{title}</Text>
          <Text c="dimmed" size="sm">
            {text}
          </Text>
        </Box>
      </Group>
    </Paper>
  );
}

function ContactLine({ icon, text, href }: { icon: React.ReactNode; text: string; href?: string }) {
  const content = href ? (
    <Anchor href={href} c="dark">
      {text}
    </Anchor>
  ) : (
    <Text>{text}</Text>
  );

  return (
    <Group gap="sm" align="flex-start" wrap="nowrap">
      <ThemeIcon color="teal" variant="light" radius="sm">
        {icon}
      </ThemeIcon>
      {content}
    </Group>
  );
}

function getMapUrl(query: string) {
  return `https://maps.google.com/maps?output=embed&z=15&q=${encodeURIComponent(query)}`;
}

function getMapLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
