"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

const MUSIC_URL = "https://xri1xbwynlfpuw7m.public.blob.vercel-storage.com/Seycara%20%20Alice%20in%20Paris%21%20%5BFull%20Album%5D%20-%20Seycara.mp3";

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(MUSIC_URL);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;

        const handleFirstInteraction = () => {
            if (!hasInteracted && audioRef.current) {
                setHasInteracted(true);
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => { });
            }
        };

        document.addEventListener('click', handleFirstInteraction, { once: true });
        document.addEventListener('keydown', handleFirstInteraction, { once: true });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [hasInteracted]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <button
            onClick={togglePlay}
            className={`music-btn ${isPlaying ? 'playing' : ''}`}
            title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
    );
}
