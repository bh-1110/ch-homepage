'use client';

import { useEffect, useState } from 'react';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Grid,
  Group,
  List,
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
  IconMail,
  IconMapPin,
  IconMessageCircle,
  IconPhone,
  IconShieldHeart,
  IconSparkles
} from '@tabler/icons-react';
import type { HomepageContent } from '../lib/homepage';
import { trackContactAction } from './tracking';

export function HomeClient({ content }: { content: HomepageContent }) {
  const [runtimeContent, setRuntimeContent] = useState(content);

  useEffect(() => {
    let active = true;

    fetch('/api/content', { cache: 'no-store' })
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

  const contactEmailHref = `mailto:${content.contact.email}?subject=${encodeURIComponent(
    content.contact.emailSubject
  )}&body=${encodeURIComponent(content.contact.emailBody)}`;
  const infoIcons = [
    <IconMessageCircle key="message" size={20} />,
    <IconCalendarHeart key="calendar" size={20} />,
    <IconClock key="clock" size={20} />
  ];

  return (
    <Box>
      <Box className="hero">
        <Container size="xl">
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
              <Button component="a" href="#angebot" variant="subtle" color="dark">
                Angebot
              </Button>
              <Button component="a" href="#ablauf" variant="subtle" color="dark">
                Ablauf
              </Button>
              <Button component="a" href="/blog" variant="subtle" color="dark">
                Blog
              </Button>
              <Button component="a" href="#kontakt" variant="light" color="teal" leftSection={<IconMail size={17} />}>
                Kontakt
              </Button>
            </Group>
          </Group>

          <Grid align="center" gap={{ base: 32, md: 52 }} className="heroGrid">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Badge variant="light" color="teal" size="lg" radius="sm">
                  {content.hero.badge}
                </Badge>
                <Stack gap="md">
                  <Title order={1} className="heroTitle">
                    {content.hero.title}
                  </Title>
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
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper className="imagePanel" radius="md">
                <img src={content.hero.image} alt={content.hero.imageAlt} />
                <Paper className="heroNote" radius="md" shadow="lg">
                  <Group gap="sm" align="flex-start">
                    <ThemeIcon color="teal" variant="light" size="lg" radius="sm">
                      <IconShieldHeart size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700}>{content.hero.noteTitle}</Text>
                      <Text size="sm" c="dimmed">
                        {content.hero.noteText}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              </Paper>
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
                        src={getMapUrl(`${location.name}, ${location.address}`)}
                        loading="lazy"
                      />
                    </Box>
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
              <ContactForm content={content} contactEmailHref={contactEmailHref} />
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
              <Anchor href={content.footer.downloadHref} size="sm" c="dark" download>
                {content.footer.downloadLabel}
              </Anchor>
            </Group>
          </Group>
        </Container>
      </Box>
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

function ContactForm({
  content,
  contactEmailHref
}: {
  content: HomepageContent;
  contactEmailHref: string;
}) {
  const [status, setStatus] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    trackContactAction('contact_form_submit_click', {
      contact_action: 'contact_form_submit',
      has_endpoint: Boolean(content.contact.contactFormEndpoint)
    });

    if (content.contact.contactFormEndpoint) {
      const response = await fetch(content.contact.contactFormEndpoint, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        form.reset();
        setStatus(content.contact.contactFormSuccess);
      } else {
        setStatus('Die Anfrage konnte nicht gesendet werden. Bitte nutzen Sie E-Mail oder Telefon.');
      }

      return;
    }

    const body = [
      content.contact.emailBody,
      '',
      '--- Formularangaben ---',
      `Name: ${payload.name ?? ''}`,
      `Telefon: ${payload.phone ?? ''}`,
      `E-Mail: ${payload.email ?? ''}`,
      `Nachricht: ${payload.message ?? ''}`
    ].join('\n');
    const href = `mailto:${content.contact.email}?subject=${encodeURIComponent(
      content.contact.emailSubject
    )}&body=${encodeURIComponent(body)}`;

    setStatus(content.contact.contactFormSuccess);
    window.location.href = href || contactEmailHref;
  }

  return (
    <Paper component="form" className="contactFormPanel" radius="md" p="xl" onSubmit={handleSubmit}>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput name="name" label="Name" required />
          <TextInput name="phone" label="Telefon" />
        </SimpleGrid>
        <TextInput name="email" label="E-Mail" type="email" required />
        <Textarea name="message" label="Nachricht" minRows={5} required />
        <Checkbox
          required
          name="privacy"
          label="Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden."
        />
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            {status}
          </Text>
          <Button type="submit" color="teal" rightSection={<IconArrowRight size={17} />}>
            {content.contact.contactFormButton}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
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
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
