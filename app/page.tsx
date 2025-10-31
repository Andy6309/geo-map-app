// app/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import MapHeader from "@/components/Map/MapHeader";
import { useIsMobile } from "@/hooks/useIsMobile";

// Dynamically import the JavaScript file
const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '5px solid #007bff',
                    borderTop: '5px solid #007bff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <div style={{
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif'
                }}>
                    Loading map data...
                </div>
            </div>
        </div>
    )
});

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const isMobile = useIsMobile();
    const geocoderContainerRef = useRef<HTMLDivElement | null>(null);

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

    // Adjust header height and bottom offset based on device
    // Mobile header is taller to include search bar
    const headerHeight = isMobile ? '88px' : '57px'; // 36px header + 52px search bar on mobile
    const bottomOffset = isMobile ? '60px' : '0px'; // Account for mobile toolbar

    return (
        <main className="h-screen w-screen relative overflow-hidden">
            <MapHeader 
                geocoderContainerRef={geocoderContainerRef}
            />
            <div 
                className="absolute left-0 right-0 z-0"
                style={{ top: headerHeight, bottom: bottomOffset }}
            >
                <Map 
                    geocoderContainerRef={geocoderContainerRef}
                    onSearchToggle={() => {}}
                    showSearch={true}
                />
            </div>
        </main>
    );
}
