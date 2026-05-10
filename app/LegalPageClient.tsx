'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { HomepageContent, LegalPageContent } from '../lib/homepage';

export function LegalPageClient({
  pageKey,
  initialPage
}: {
  pageKey: keyof HomepageContent['legalPages'];
  initialPage: LegalPageContent;
}) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    let active = true;

    fetch('/api/content', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const runtimePage = data?.content?.legalPages?.[pageKey];
        if (active && runtimePage) {
          setPage(runtimePage as LegalPageContent);
        }
      })
      .catch(() => {
        // Keep bundled legal text when D1 is not initialized yet.
      });

    return () => {
      active = false;
    };
  }, [pageKey]);

  return (
    <Box className="legalPage">
      <Container size="md" py={{ base: 36, md: 64 }}>
        <Button component="a" href="/" variant="subtle" color="dark" leftSection={<IconArrowLeft size={18} />}>
          Zur Startseite
        </Button>
        <Paper className="legalPanel" radius="md" p={{ base: 'lg', md: 'xl' }} mt="xl">
          <Stack gap="lg">
            <Title order={1}>{page.title}</Title>
            <Box className="legalText">
              {page.text.split('\n').map((line, index) =>
                line.trim() ? (
                  <Text key={index}>{line}</Text>
                ) : (
                  <Box key={index} h={10} />
                )
              )}
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
