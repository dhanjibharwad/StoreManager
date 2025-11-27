// components/GoogleMapScript.tsx
'use client';
import Script from 'next/script';

export default function GoogleMapScript() {
  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=...&libraries=places`}
      strategy="afterInteractive"
    />
  );
}
