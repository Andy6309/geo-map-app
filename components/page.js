// app/page.tsx

"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map"), { ssr: false });


export default function Home() {
    return (
        <main className="h-screen w-screen">
            <Map />
        </main>
    );
}
