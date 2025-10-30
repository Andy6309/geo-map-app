// app/page.tsx
"use client";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MapHeader from "@/components/Map/MapHeader";

// Dynamically import the JavaScript file
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <main className="h-screen w-screen relative overflow-hidden">
            <MapHeader />
            <div className="absolute top-[57px] left-0 right-0 bottom-0 z-0">
                <Map />
            </div>
        </main>
    );
}
