"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { CTA } from "../types";

interface CTAFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (cta: Omit<CTA, "id" | "createdAt" | "updatedAt" | "userId">) => void;
    editingCTA: CTA | null;
}

export function CTAFormModal({ isOpen, onClose, onSave, editingCTA }: CTAFormModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [imageProof, setImageProof] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingCTA) {
            setTitle(editingCTA.title);
            setDescription(editingCTA.description);
            setLink(editingCTA.link);
            setImageProof(editingCTA.imageProof);
        } else {
            resetForm();
        }
    }, [editingCTA, isOpen]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setLink("");
        setImageProof(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size must be less than 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageProof(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            description: description.trim(),
            link: link.trim(),
            imageProof,
        });
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary-400">
                        {editingCTA ? "Edit CTA" : "Create New CTA"}
                    </h2>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/70 mb-2">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field"
                            placeholder="Enter CTA title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field min-h-[100px] resize-none"
                            placeholder="Enter description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">Link</label>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="input-field"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/70 mb-2">Image Proof</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/50 transition-colors"
                        >
                            {imageProof ? (
                                <div className="relative">
                                    <img
                                        src={imageProof}
                                        alt="Preview"
                                        className="max-h-48 mx-auto rounded-lg object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageProof(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-white/40 flex flex-col items-center">
                                    <Upload size={32} className="mb-2" />
                                    <p>Click to upload image</p>
                                    <p className="text-xs mt-1">Max 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {editingCTA ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
