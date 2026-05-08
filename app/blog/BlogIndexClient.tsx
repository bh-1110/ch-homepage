'use client';

import { Badge, Box, Button, Card, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

type BlogCard = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
};

export function BlogIndexClient({ posts }: { posts: BlogCard[] }) {
  return (
    <Box className="blogPage">
      <Container size="xl" py={{ base: 32, md: 56 }}>
        <Button component="a" href="/" variant="subtle" color="dark" leftSection={<IconArrowLeft size={18} />}>
          Zur Startseite
        </Button>
        <Stack gap="md" mt="xl" maw={780}>
          <Text className="sectionLabel">Blog</Text>
          <Title order={1} className="blogTitle">
            Gedanken aus der Praxis
          </Title>
          <Text size="xl" c="dimmed">
            Kurze Beiträge zu Psychotherapie, Selbstfürsorge und Orientierung in belastenden Lebensphasen.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt={42}>
          {posts.map((post) => (
            <Card key={post.slug} className="blogCard" radius="md" padding="xl">
              <Group gap="sm" mb="md">
                <Badge color="teal" variant="light" radius="sm">
                  {post.category}
                </Badge>
                <Text size="sm" c="dimmed">
                  {formatDate(post.date)}
                </Text>
              </Group>
              <Title order={2}>{post.title}</Title>
              <Text c="dimmed" mt="sm">
                {post.excerpt}
              </Text>
              <Button
                component="a"
                href={`/blog/${post.slug}`}
                variant="light"
                color="teal"
                mt="xl"
                rightSection={<IconArrowRight size={17} />}
              >
                Beitrag lesen
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00`));
}
