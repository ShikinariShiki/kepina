"use client";

import { Sparkles, Target, Image, Music } from "lucide-react";

interface LandingPageProps {
    onOpenAuth: (mode: "login" | "register") => void;
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Hero Section */}
            <div className="text-center z-10 animate-fade-in">
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary-500/20 flex items-center justify-center animate-float">
                        <Sparkles size={48} className="text-primary-400" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                    <span className="text-primary-400">Kepina</span>
                    <span className="text-white/80"> Day Off</span>
                </h1>
                <p className="text-lg md:text-xl text-white/60 mb-8 max-w-lg mx-auto">
                    Welcome to my special corner of the internet. Create, manage, and share your moments with style.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onOpenAuth("register")}
                        className="btn-primary text-lg px-8 py-4 glow-pink"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => onOpenAuth("login")}
                        className="btn-secondary text-lg px-8 py-4"
                    >
                        Sign In
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up">
                <div className="glass rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <Target size={24} className="text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Manage CTAs</h3>
                    <p className="text-white/60 text-sm">Create and organize your calls to action</p>
                </div>
                <div className="glass rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent-500/20 flex items-center justify-center">
                        <Image size={24} className="text-accent-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Image Proofs</h3>
                    <p className="text-white/60 text-sm">Upload visual proof for each CTA</p>
                </div>
                <div className="glass rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <Music size={24} className="text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Vibes</h3>
                    <p className="text-white/60 text-sm">Enjoy background music while you work</p>
                </div>
            </div>
        </div>
    );
}
