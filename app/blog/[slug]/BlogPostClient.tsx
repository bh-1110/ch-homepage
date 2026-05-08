'use client';

import { Badge, Box, Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { BlogPost } from '../../../lib/blog';

export function BlogPostClient({ post }: { post: BlogPost }) {
  return (
    <Box className="blogPage">
      <Container size="md" py={{ base: 32, md: 64 }}>
        <Button component="a" href="/blog" variant="subtle" color="dark" leftSection={<IconArrowLeft size={18} />}>
          Alle Beiträge
        </Button>
        <Paper className="postPanel" radius="md" p={{ base: 'lg', md: 'xl' }} mt="xl">
          <Stack gap="md">
            <Group gap="sm">
              <Badge color="teal" variant="light" radius="sm">
                {post.category}
              </Badge>
              <Text size="sm" c="dimmed">
                {formatDate(post.date)}
              </Text>
            </Group>
            <Title order={1} className="postTitle">
              {post.title}
            </Title>
            <Text size="lg" c="dimmed">
              {post.excerpt}
            </Text>
          </Stack>
          <Box className="postContent" dangerouslySetInnerHTML={{ __html: post.html }} />
        </Paper>
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
