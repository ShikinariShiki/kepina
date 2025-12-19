"use client";

import { X } from "lucide-react";

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    title: string;
}

export function ImagePreviewModal({ isOpen, onClose, imageSrc, title }: ImagePreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <img src={imageSrc} alt={title} className="w-full rounded-lg object-contain max-h-[70vh]" />
            </div>
        </div>
    );
}

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title }: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">Delete CTA</h3>
                <p className="text-white/70 mb-6">
                    Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
