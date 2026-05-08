'use client';

import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconArrowUp, IconMail, IconMessageCircle, IconPhone } from '@tabler/icons-react';
import { trackContactAction } from './tracking';

type FloatingActionsProps = {
  phone: string;
  email: string;
  emailSubject: string;
  emailBody: string;
  phoneConversionSendTo: string;
  emailConversionSendTo: string;
  conversionCurrency: string;
  conversionValue: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function FloatingActions({
  phone,
  email,
  emailSubject,
  emailBody,
  phoneConversionSendTo,
  emailConversionSendTo,
  conversionCurrency,
  conversionValue
}: FloatingActionsProps) {
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const emailHref = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  function openWithConversion(href: string, sendTo: string) {
    const action = href.startsWith('tel:') ? 'phone' : 'email';
    trackContactAction(`contact_${action}_click`, {
      contact_action: action,
      contact_target: action === 'phone' ? phone : email
    });

    if (!sendTo || typeof window.gtag !== 'function') {
      window.location.href = href;
      return;
    }

    let didNavigate = false;
    const navigate = () => {
      if (didNavigate) {
        return;
      }

      didNavigate = true;
      window.location.href = href;
    };

    window.gtag('event', 'conversion', {
      send_to: sendTo,
      value: Number(conversionValue) || 1,
      currency: conversionCurrency || 'EUR',
      event_callback: navigate
    });

    window.setTimeout(navigate, 900);
  }

  function scrollToContactForm() {
    trackContactAction('contact_form_jump_click', {
      contact_action: 'contact_form'
    });

    document.getElementById('kontaktformular')?.scrollIntoView({
      behavior: 'smooth'
    });
  }

  function scrollToTop() {
    trackContactAction('contact_back_to_top_click', {
      contact_action: 'back_to_top'
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  return (
    <Box className="floatingActions" aria-label="Schnellzugriff">
      <Tooltip label="Telefonkontakt" position="left" withArrow>
        <ActionIcon
          type="button"
          aria-label="Telefonkontakt"
          className="floatingAction"
          color="teal"
          size="xl"
          radius="md"
          onClick={() => openWithConversion(phoneHref, phoneConversionSendTo)}
        >
          <IconPhone size={22} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="E-Mail-Kontakt" position="left" withArrow>
        <ActionIcon
          type="button"
          aria-label="E-Mail-Kontakt"
          className="floatingAction"
          color="teal"
          size="xl"
          radius="md"
          onClick={() => openWithConversion(emailHref, emailConversionSendTo)}
        >
          <IconMail size={22} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Zum Kontaktformular" position="left" withArrow>
        <ActionIcon
          type="button"
          aria-label="Zum Kontaktformular"
          className="floatingAction"
          color="teal"
          size="xl"
          radius="md"
          onClick={scrollToContactForm}
        >
          <IconMessageCircle size={22} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Zum Seitenbeginn" position="left" withArrow>
        <ActionIcon
          type="button"
          aria-label="Zum Seitenbeginn"
          className="floatingAction floatingActionBack"
          color="dark"
          size="xl"
          radius="md"
          onClick={scrollToTop}
        >
          <IconArrowUp size={22} />
        </ActionIcon>
      </Tooltip>
    </Box>
  );
}
