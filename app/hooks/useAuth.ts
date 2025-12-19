"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("kepina_current_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((username: string, password: string): { success: boolean; error?: string } => {
        const users: User[] = JSON.parse(localStorage.getItem("kepina_users") || "[]");
        const foundUser = users.find((u) => u.username === username && u.password === password);

        if (!foundUser) {
            return { success: false, error: "Invalid username or password" };
        }

        localStorage.setItem("kepina_current_user", JSON.stringify(foundUser));
        setUser(foundUser);
        return { success: true };
    }, []);

    const register = useCallback((username: string, password: string): { success: boolean; error?: string } => {
        const users: User[] = JSON.parse(localStorage.getItem("kepina_users") || "[]");

        if (users.find((u) => u.username === username)) {
            return { success: false, error: "Username already exists" };
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
        setUser(newUser);
        return { success: true };
    }, []);

    const loginWithGoogle = useCallback((googleUser: { id: string; email: string; name: string; image?: string }) => {
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
        setUser(existingUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("kepina_current_user");
        setUser(null);
    }, []);

    return {
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        setUser,
    };
}
