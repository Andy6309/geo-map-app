// app/page.tsx
"use client";
import dynamic from "next/dynamic";

// Dynamically import the JavaScript file
const Map = dynamic(() => import("@/components/map.js"), { ssr: false });

export default function Home() {
    return (
        <main className="h-screen w-screen">
            <Map />
        </main>
    );
}
