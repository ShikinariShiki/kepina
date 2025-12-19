"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { User } from "../types";
import { GoogleLoginButton } from "./GoogleLoginButton";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User) => void;
    onGoogleLogin: (googleUser: { id: string; email: string; name: string; image?: string }) => void;
    initialMode?: "login" | "register";
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function AuthModal({ isOpen, onClose, onLogin, onGoogleLogin, initialMode = "login" }: AuthModalProps) {
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }

        const users: User[] = JSON.parse(localStorage.getItem("kepina_users") || "[]");

        if (mode === "register") {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (password.length < 4) {
                setError("Password must be at least 4 characters");
                return;
            }
            if (users.find((u) => u.username === username)) {
                setError("Username already exists");
                return;
            }

            const newUser: User = {
                id: generateId(),
                username,
                password,
                provider: 'credentials',
                createdAt: new Date().toISOString(),
            };
            users.push(newUser);
            localStorage.setItem("kepina_users", JSON.stringify(users));
            localStorage.setItem("kepina_current_user", JSON.stringify(newUser));
            onLogin(newUser);
            resetForm();
        } else {
            const user = users.find((u) => u.username === username && u.password === password);
            if (!user) {
                setError("Invalid username or password");
                return;
            }
            localStorage.setItem("kepina_current_user", JSON.stringify(user));
            onLogin(user);
            resetForm();
        }
    };

    const resetForm = () => {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary-400">
                        {mode === "login" ? "Welcome Back" : "Join Kepina"}
                    </h2>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Google Login */}
                <div className="mb-6">
                    <GoogleLoginButton onSuccess={onGoogleLogin} />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-[rgb(20,8,35)] text-white/40">or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/70 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="Enter your password"
                        />
                    </div>

                    {mode === "register" && (
                        <div>
                            <label className="block text-sm text-white/70 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                placeholder="Confirm your password"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary w-full">
                        {mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center text-white/60">
                    {mode === "login" ? (
                        <p>
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={() => {
                                    setMode("register");
                                    resetForm();
                                }}
                                className="text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <button
                                onClick={() => {
                                    setMode("login");
                                    resetForm();
                                }}
                                className="text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                Sign in
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
