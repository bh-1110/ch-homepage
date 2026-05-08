'use client';

type TrackingPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: TrackingPayload[];
  }
}

export function trackContactAction(eventName: string, payload: TrackingPayload = {}) {
  const eventPayload = {
    event: eventName,
    ...payload
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventPayload);
  console.info('[contact-action]', eventPayload);
}
