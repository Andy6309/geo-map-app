// app/page.tsx
"use client";
import dynamic from "next/dynamic";
import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Add debug logging
console.log('Page component rendering. NODE_ENV:', process.env.NODE_ENV);
console.log('Mapbox token available:', !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? 'Yes' : 'No');

// Dynamically import the JavaScript file
const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div>Loading map...</div> 
});

export default function Home() {
  useEffect(() => {
    console.log('Page mounted. Client-side environment.');
    console.log('Window object available:', typeof window !== 'undefined');
  }, []);

  return (
    <main className="h-screen w-screen">
      <ErrorBoundary>
        <Map />
      </ErrorBoundary>
    </main>
  );
}
