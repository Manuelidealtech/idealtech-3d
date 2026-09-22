'use client';
import { useEffect } from 'react';

export function TrackView({ productId, shareId }: { productId: string; shareId?: string }) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId, shareId: shareId || null }),
      keepalive: true,
    }).catch(() => {});
  }, [productId, shareId]);
  return null;
}
