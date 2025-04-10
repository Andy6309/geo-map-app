"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import LoginForm from "@/components/loginform"; // Import the login form component

// Dynamically import the JavaScript file and specify the prop type
const Map = dynamic<{ username: string }>(() => import("@/components/Map"), { ssr: false });

export default function Home() {
    const [username, setUsername] = useState<string | null>(null); // State to store the username

    return (
        <main className="h-screen w-screen">
            {!username ? (
                // Show login form if no username is set
                <LoginForm onLogin={setUsername} />
            ) : (
                // Pass the username to the Map component
                <Map username={username} />
            )}
        </main>
    );
}
