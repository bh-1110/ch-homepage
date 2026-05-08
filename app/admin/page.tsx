import { Anchor, Container, Text, Title } from '@mantine/core';
import { AdminRedirectClient } from './AdminRedirectClient';

export const metadata = {
  title: 'CMS | Psychotherapie Wien'
};

export default function AdminRedirectPage() {
  return (
    <Container size="sm" py={64}>
      <AdminRedirectClient />
      <Title order={1}>CMS wird geladen</Title>
      <Text mt="md">
        Falls nichts passiert, öffnen Sie <Anchor href="/admin/index.html">/admin/index.html</Anchor>.
      </Text>
    </Container>
  );
}
