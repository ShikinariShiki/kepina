"use client";

import { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { User, CTA } from "../types";
import { useCTAs } from "../hooks/useCTAs";
import { CTACard } from "./CTACard";
import { CTAFormModal } from "./CTAFormModal";
import { ImagePreviewModal, DeleteConfirmModal } from "./Modals";

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
    const { ctas, createCTA, updateCTA, deleteCTA } = useCTAs(user.id);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCTA, setEditingCTA] = useState<CTA | null>(null);
    const [deleteConfirmCTA, setDeleteConfirmCTA] = useState<CTA | null>(null);
    const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

    const handleCreateCTA = (ctaData: Omit<CTA, "id" | "createdAt" | "updatedAt" | "userId">) => {
        createCTA(ctaData);
        setIsFormOpen(false);
    };

    const handleUpdateCTA = (ctaData: Omit<CTA, "id" | "createdAt" | "updatedAt" | "userId">) => {
        if (!editingCTA) return;
        updateCTA(editingCTA.id, ctaData);
        setEditingCTA(null);
        setIsFormOpen(false);
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <header className="glass rounded-2xl p-4 md:p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        {user.image && (
                            <img src={user.image} alt={user.username} className="w-12 h-12 rounded-full" />
                        )}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-primary-400">Kepina Dashboard</h1>
                            <p className="text-white/60 mt-1">Welcome back, {user.username}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setEditingCTA(null);
                                setIsFormOpen(true);
                            }}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={20} />
                            New CTA
                        </button>
                        <button onClick={onLogout} className="btn-secondary flex items-center gap-2">
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* CTA Grid */}
            {ctas.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <Plus size={32} className="text-primary-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No CTAs yet</h2>
                    <p className="text-white/60 mb-6">Create your first Call to Action to get started</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create First CTA
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ctas.map((cta) => (
                        <CTACard
                            key={cta.id}
                            cta={cta}
                            onEdit={() => {
                                setEditingCTA(cta);
                                setIsFormOpen(true);
                            }}
                            onDelete={() => setDeleteConfirmCTA(cta)}
                            onViewImage={() =>
                                cta.imageProof && setPreviewImage({ src: cta.imageProof, title: cta.title })
                            }
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CTAFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingCTA(null);
                }}
                onSave={editingCTA ? handleUpdateCTA : handleCreateCTA}
                editingCTA={editingCTA}
            />

            <DeleteConfirmModal
                isOpen={!!deleteConfirmCTA}
                onClose={() => setDeleteConfirmCTA(null)}
                onConfirm={() => deleteConfirmCTA && deleteCTA(deleteConfirmCTA.id)}
                title={deleteConfirmCTA?.title || ""}
            />

            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageSrc={previewImage?.src || ""}
                title={previewImage?.title || ""}
            />
        </div>
    );
}
