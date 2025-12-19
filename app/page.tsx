"use client";

import { useState, useEffect } from "react";
import { User } from "./types";
import { ParticlesBackground } from "./components/ParticlesBackground";
import { MusicPlayer } from "./components/MusicPlayer";
import { AuthModal } from "./components/AuthModal";
import { Dashboard } from "./components/Dashboard";
import { LandingPage } from "./components/LandingPage";
import { Loader2 } from "lucide-react";

export default function KepinaDayOff() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("kepina_current_user");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
    };

    const handleGoogleLogin = (googleUser: { id: string; email: string; name: string; image?: string }) => {
        const users: User[] = JSON.parse(localStorage.getItem("kepina_users") || "[]");
        let existingUser = users.find((u) => u.email === googleUser.email && u.provider === 'google');

        if (!existingUser) {
            existingUser = {
                id: googleUser.id,
                username: googleUser.name,
                email: googleUser.email,
                image: googleUser.image,
                provider: 'google',
                createdAt: new Date().toISOString(),
            };
            users.push(existingUser);
            localStorage.setItem("kepina_users", JSON.stringify(users));
        }

        localStorage.setItem("kepina_current_user", JSON.stringify(existingUser));
        setCurrentUser(existingUser);
        setIsAuthModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("kepina_current_user");
        setCurrentUser(null);
    };

    const openAuthModal = (mode: "login" | "register") => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={48} className="text-primary-400 animate-spin" />
            </div>
        );
    }

    return (
        <main className="relative min-h-screen">
            <ParticlesBackground />

            {currentUser ? (
                <Dashboard user={currentUser} onLogout={handleLogout} />
            ) : (
                <LandingPage onOpenAuth={openAuthModal} />
            )}

            <MusicPlayer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
                initialMode={authMode}
            />
        </main>
    );
}
