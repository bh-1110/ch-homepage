'use client';

import { useEffect } from 'react';

export function AdminRedirectClient() {
  useEffect(() => {
    window.location.replace('/admin/index.html');
  }, []);

  return null;
}
