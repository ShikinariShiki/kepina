"use client";

import { useState, useEffect, useCallback } from "react";
import { CTA } from "../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useCTAs(userId: string | undefined) {
    const [ctas, setCtas] = useState<CTA[]>([]);

    useEffect(() => {
        if (!userId) return;
        const storedCTAs: CTA[] = JSON.parse(localStorage.getItem("kepina_ctas") || "[]");
        setCtas(storedCTAs.filter((c) => c.userId === userId));
    }, [userId]);

    const saveCTAs = useCallback((newCTAs: CTA[]) => {
        if (!userId) return;
        const allCTAs: CTA[] = JSON.parse(localStorage.getItem("kepina_ctas") || "[]");
        const otherUsersCTAs = allCTAs.filter((c) => c.userId !== userId);
        localStorage.setItem("kepina_ctas", JSON.stringify([...otherUsersCTAs, ...newCTAs]));
        setCtas(newCTAs);
    }, [userId]);

    const createCTA = useCallback((ctaData: Omit<CTA, "id" | "createdAt" | "updatedAt" | "userId">) => {
        if (!userId) return;
        const newCTA: CTA = {
            ...ctaData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId,
        };
        saveCTAs([...ctas, newCTA]);
    }, [userId, ctas, saveCTAs]);

    const updateCTA = useCallback((id: string, ctaData: Omit<CTA, "id" | "createdAt" | "updatedAt" | "userId">) => {
        const updated = ctas.map((c) =>
            c.id === id
                ? { ...c, ...ctaData, updatedAt: new Date().toISOString() }
                : c
        );
        saveCTAs(updated);
    }, [ctas, saveCTAs]);

    const deleteCTA = useCallback((id: string) => {
        saveCTAs(ctas.filter((c) => c.id !== id));
    }, [ctas, saveCTAs]);

    return {
        ctas,
        createCTA,
        updateCTA,
        deleteCTA,
    };
}
