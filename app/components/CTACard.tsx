"use client";

import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { CTA } from "../types";

interface CTACardProps {
    cta: CTA;
    onEdit: () => void;
    onDelete: () => void;
    onViewImage: () => void;
}

export function CTACard({ cta, onEdit, onDelete, onViewImage }: CTACardProps) {
    return (
        <div className="card group">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors">
                    {cta.title}
                </h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title="Edit"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/40 text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {cta.description && (
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{cta.description}</p>
            )}

            {cta.link && (
                <a
                    href={cta.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 text-sm hover:text-primary-300 transition-colors inline-flex items-center gap-1 mb-3 truncate max-w-full"
                >
                    <ExternalLink size={14} />
                    <span className="truncate">{cta.link}</span>
                </a>
            )}

            {cta.imageProof && (
                <div
                    onClick={onViewImage}
                    className="mt-3 cursor-pointer relative overflow-hidden rounded-lg"
                >
                    <img
                        src={cta.imageProof}
                        alt="Proof"
                        className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-sm">Click to view</span>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/40">
                Updated {new Date(cta.updatedAt).toLocaleDateString()}
            </div>
        </div>
    );
}
