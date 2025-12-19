"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Calendar, MapPin, Coffee, Camera, Utensils, Train, AlertTriangle, Wallet,
    Music, Umbrella, BatteryCharging, Car, ChevronDown, ChevronUp, Info, Clock,
    ArrowRight, Sparkles, Shield, Ticket, CalendarPlus, ExternalLink, Volume2,
    VolumeX, Palmtree, Star, ShoppingBag, Shuffle, CloudLightning, AlertOctagon,
    List, CheckSquare, MessageCircle, Map as MapIcon, User, RefreshCw, Heart,
    ToggleLeft, ToggleRight, CheckCircle2, XCircle, DollarSign, CloudRain, Sun,
    Navigation, LogIn, LogOut, UserPlus, X, Upload, Pencil, Trash2, ImageIcon, Plus
} from 'lucide-react';

// Types
interface UserData {
    id: string;
    username: string;
    email: string;
    image?: string;
    persona: 'Kevin' | 'Dina';
    provider: 'google';
    createdAt: string;
}

interface CustomCTA {
    id: string;
    text: string;
    reward: string;
    imageProof: string | null;
    completed: boolean;
    userId: string;
    createdAt: string;
}

// Google OAuth Config
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
                    renderButton: (element: HTMLElement | null, options: { theme: string; size: string; width: number }) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const OneDayTrip = () => {
    const [activeTab, setActiveTab] = useState('timeline');
    const [expandedItem, setExpandedItem] = useState<string | number | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);

    // Auth States
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showPersonaModal, setShowPersonaModal] = useState(false);
    const [pendingGoogleUser, setPendingGoogleUser] = useState<{ id: string; email: string; name: string; image?: string } | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<'Kevin' | 'Dina'>('Kevin');

    // Custom CTA States
    const [customCTAs, setCustomCTAs] = useState<CustomCTA[]>([]);
    const [showCTAModal, setShowCTAModal] = useState(false);
    const [editingCTA, setEditingCTA] = useState<CustomCTA | null>(null);
    const [ctaText, setCTAText] = useState('');
    const [ctaReward, setCTAReward] = useState('');
    const [ctaImage, setCTAImage] = useState<string | null>(null);
    const [deletingCTA, setDeletingCTA] = useState<CustomCTA | null>(null);

    // Toggles
    const [planMode, setPlanMode] = useState('main'); // 'main' (Sunny) or 'rain' (Indoor/Plan B)
    const [userPersona, setUserPersona] = useState('Kevin');
    const [budgetMode, setBudgetMode] = useState('realistic'); // 'optimistic', 'realistic', 'pessimistic'

    // States - Expanded Tasks (6 items per person)
    const [kevinTasks, setKevinTasks] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
    const [dinaTasks, setDinaTasks] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });
    const [currentTopic, setCurrentTopic] = useState("Hal apa yang kamu pengen orang lain tau tentang kamu, tapi jarang ada yang nanya?");

    const audioRef = useRef<HTMLAudioElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- THEME CONFIGURATION ---
    const getTheme = () => {
        switch (activeTab) {
            case 'timeline': return { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-100', shadow: 'shadow-indigo-200' };
            case 'details': return { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-100', shadow: 'shadow-blue-200' };
            case 'missions': return { bg: 'bg-pink-600', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-100', shadow: 'shadow-pink-200' };
            case 'cta': return { bg: 'bg-cyan-600', text: 'text-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-100', shadow: 'shadow-cyan-200' };
            case 'chat': return { bg: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50', border: 'border-violet-100', shadow: 'shadow-violet-200' };
            case 'maps': return { bg: 'bg-teal-600', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-100', shadow: 'shadow-teal-200' };
            case 'risks': return { bg: 'bg-red-600', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-100', shadow: 'shadow-red-200' };
            case 'spots': return { bg: 'bg-orange-600', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-100', shadow: 'shadow-orange-200' };
            case 'budget': return { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-200' };
            default: return { bg: 'bg-gray-800', text: 'text-gray-800', light: 'bg-gray-50', border: 'border-gray-100', shadow: 'shadow-gray-200' };
        }
    };
    const theme = getTheme();

    // Load user session and CTAs from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('kepina_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setUserPersona(user.persona);
        }
        const storedCTAs = localStorage.getItem('kepina_ctas');
        if (storedCTAs) {
            setCustomCTAs(JSON.parse(storedCTAs));
        }
    }, []);

    // Save CTAs to localStorage when changed
    useEffect(() => {
        if (customCTAs.length > 0 || localStorage.getItem('kepina_ctas')) {
            localStorage.setItem('kepina_ctas', JSON.stringify(customCTAs));
        }
    }, [customCTAs]);

    useEffect(() => {
        // Fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Audio Force Autoplay with muted start
        const playAudio = async () => {
            try {
                if (audioRef.current) {
                    // Try to play unmuted first
                    audioRef.current.volume = 0.7;
                    await audioRef.current.play();
                    setIsPlaying(true);
                }
            } catch (err) {
                // If blocked, try muted autoplay
                if (audioRef.current) {
                    audioRef.current.muted = true;
                    audioRef.current.play().catch(() => { });
                }
                setIsPlaying(false);

                // Add interaction listener to unmute and play properly
                const handleInteraction = () => {
                    if (audioRef.current) {
                        audioRef.current.muted = false;
                        audioRef.current.volume = 0.7;
                        if (audioRef.current.paused) {
                            audioRef.current.play();
                        }
                        setIsPlaying(true);
                        ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt =>
                            document.removeEventListener(evt, handleInteraction)
                        );
                    }
                };
                ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt =>
                    document.addEventListener(evt, handleInteraction, { once: false })
                );
            }
        };

        // Delay to ensure audio element is mounted
        setTimeout(playAudio, 100);

        return () => {
            if (link.parentNode) {
                document.head.removeChild(link);
            }
        };
    }, []);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
            setIsPlaying(!isPlaying);
        }
    };

    // --- DATA: SCHEDULES ---

    const mainSchedule = [
        { id: 1, time: '07:00 - 09:15', activity: 'OTW Surabaya', location: 'St Malang -> Gubeng', icon: <Train />, desc: 'Perjalanan naik KA Penataran. Bawa snack!', image: 'https://images.unsplash.com/photo-1535736592231-15b565d6c84c?q=80&w=1000', theme: 'bg-blue-50 text-blue-900', iconTheme: 'bg-blue-100 text-blue-600' },
        { id: 2, time: '09:30 - 10:45', activity: 'Morning Coffee', location: 'Kopi Nako Gubeng', icon: <Coffee />, desc: 'Ngopi cantik depan stasiun. Touch up dulu.', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000', theme: 'bg-amber-50 text-amber-900', iconTheme: 'bg-amber-100 text-amber-600' },
        { id: 3, time: '11:00 - 11:20', activity: 'Move to TP', location: 'Via Gocar', icon: <Car />, desc: 'Drop di Lobby TP 6.', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000', theme: 'bg-blue-50 text-blue-900', iconTheme: 'bg-blue-100 text-blue-600' },
        { id: 4, time: '11:20 - 13:00', activity: 'Lunch Dining', location: 'TP 6 (Zenbu/Carnaby)', icon: <Utensils />, desc: 'Makan siang estetik & kenyang.', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1000', theme: 'bg-orange-50 text-orange-900', iconTheme: 'bg-orange-100 text-orange-600' },
        { id: 5, time: '13:00 - 14:00', activity: 'Photobooth', location: 'TP 1 / TP 2', icon: <Camera />, desc: 'Selfie Time atau PhotoCandy.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000', theme: 'bg-purple-50 text-purple-900', iconTheme: 'bg-purple-100 text-purple-600' },
        { id: 6, time: '15:00 - 15:15', activity: 'To Alun-Alun', location: 'Via Gocar', icon: <Car />, desc: 'Pindah lokasi ke pusat kota.', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000', theme: 'bg-blue-50 text-blue-900', iconTheme: 'bg-blue-100 text-blue-600' },
        { id: 7, time: '15:15 - 16:30', activity: 'Art Gallery', location: 'Basement Alun-Alun', icon: <MapPin />, desc: 'Liat pameran seni indoor adem.', image: 'https://images.unsplash.com/photo-1518998053901-5348d3969105?q=80&w=1000', theme: 'bg-pink-50 text-pink-900', iconTheme: 'bg-pink-100 text-pink-600' },
        { id: 8, time: '16:30 - 17:00', activity: 'To Kota Lama', location: 'Via Gocar', icon: <Car />, desc: 'Menuju spot utama.', image: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?q=80&w=1000', theme: 'bg-blue-50 text-blue-900', iconTheme: 'bg-blue-100 text-blue-600' },
        { id: 9, time: '17:00 - 18:30', activity: 'Golden Hour', location: 'Zona Eropa', icon: <Camera />, desc: 'Foto di depan Gedung Internatio.', image: 'https://images.unsplash.com/photo-1572917947470-4f51952e7249?q=80&w=1000', theme: 'bg-orange-50 text-orange-900', iconTheme: 'bg-orange-100 text-orange-600' },
        { id: 10, time: '18:50 - 20:30', activity: 'Dinner & Lights', location: 'Tunjungan', icon: <Music />, desc: 'Kuliner malam & live music.', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1000', theme: 'bg-indigo-50 text-indigo-900', iconTheme: 'bg-indigo-100 text-indigo-600' },
        { id: 11, time: '20:30 - 21:00', activity: 'Back to Station', location: 'St Gubeng Baru', icon: <Ticket />, desc: 'Pulang ke Malang.', image: 'https://images.unsplash.com/photo-1514316973305-653609800619?q=80&w=1000', theme: 'bg-slate-100 text-slate-800', iconTheme: 'bg-slate-200 text-slate-700' }
    ];

    // PLAN B: RAINY / INDOOR DAY - Full Structure
    const rainSchedule = [
        { id: 101, time: '07:00 - 09:15', activity: 'OTW Surabaya (Rainy)', location: 'St Malang -> Gubeng', icon: <Train />, desc: 'Hujan? No worries. Kereta tetep jalan. Bawa payung lipat!', image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000', theme: 'bg-slate-50 text-slate-900', iconTheme: 'bg-slate-100 text-slate-600' },
        { id: 102, time: '09:30 - 11:30', activity: 'Indoor Museum Tour', location: 'House of Sampoerna', icon: <MapPin />, desc: 'Ganti plan outdoor ke Museum. Full AC, estetik, dan ada cafe indoor.', image: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?q=80&w=1000', theme: 'bg-red-50 text-red-900', iconTheme: 'bg-red-100 text-red-600' },
        { id: 103, time: '11:30 - 12:00', activity: 'Move to Mall', location: 'Via Gocar', icon: <Car />, desc: 'Pesen Gocar (Bluebird kalo ujan deres biar dapet). Tujuan: Tunjungan Plaza.', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000', theme: 'bg-blue-50 text-blue-900', iconTheme: 'bg-blue-100 text-blue-600' },
        { id: 104, time: '12:00 - 14:00', activity: 'Lunch & Dessert', location: 'TP 5 & 6', icon: <Utensils />, desc: "Lunch di Sushi Tei / Marugame. Lanjut dessert di Toby's Estate.", image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=1000', theme: 'bg-orange-50 text-orange-900', iconTheme: 'bg-orange-100 text-orange-600' },
        { id: 105, time: '14:00 - 16:30', activity: 'Cinema / Bowling', location: 'XXI / Funworld TP', icon: <Music />, desc: 'Nonton film terbaru atau main bowling di Funworld biar gak bosen nunggu ujan reda.', image: 'https://images.unsplash.com/photo-1533561362706-0f722956fb59?q=80&w=1000', theme: 'bg-purple-50 text-purple-900', iconTheme: 'bg-purple-100 text-purple-600' },
        { id: 106, time: '16:30 - 19:00', activity: 'Shopping & Dinner', location: 'Uniqlo / H&M', icon: <ShoppingBag />, desc: 'Window shopping. Early dinner di Food Court TP (banyak pilihan).', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000', theme: 'bg-pink-50 text-pink-900', iconTheme: 'bg-pink-100 text-pink-600' },
        { id: 107, time: '19:00 - 20:00', activity: 'Coffee before Home', location: 'Starbucks Stasiun', icon: <Coffee />, desc: 'Nunggu kereta di Starbucks Stasiun Gubeng Baru (Indoor).', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000', theme: 'bg-amber-50 text-amber-900', iconTheme: 'bg-amber-100 text-amber-600' },
        { id: 108, time: '20:30 - 21:00', activity: 'Safe Trip Home', location: 'St Gubeng -> Malang', icon: <Ticket />, desc: 'Pulang dengan selamat dan kering!', image: 'https://images.unsplash.com/photo-1514316973305-653609800619?q=80&w=1000', theme: 'bg-slate-100 text-slate-800', iconTheme: 'bg-slate-200 text-slate-700' }
    ];

    // --- DATA: MISSIONS (BESTIE EDITION), TOPICS, BUDGET, SPOTS, MAPS ---

    const missionsData = {
        Kevin: [
            { id: 1, text: "Fotoin Dina pas lagi ketawa (Candid)", reward: "Bestie of The Year" },
            { id: 2, text: "Beliin tiket kereta tanpa antri (Gercep)", reward: "Efficiency God" },
            { id: 3, text: "Jagain pas nyebrang di Tunjungan (Bodyguard)", reward: "Protector +100" },
            { id: 4, text: "Bikin video cinematic 5 detik (Vlog Mode)", reward: "Content Creator" },
            { id: 5, text: "Tebak lagu favorit Dina di cafe (Music Guru)", reward: "Soul Connection" },
            { id: 6, text: "Puji outfit Dina hari ini (Hype Man)", reward: "Mood Booster" }
        ],
        Dina: [
            { id: 1, text: "Pilihin tempat makan yang enak (Foodie)", reward: "Taste Master" },
            { id: 2, text: "Arahin pose foto Kevin biar cool (Director)", reward: "Visual Queen" },
            { id: 3, text: "Beliin air minum pas Kevin haus (Hydration)", reward: "Life Saver" },
            { id: 4, text: "Ingetin barang bawaan pas pindah (Reminder)", reward: "Brain Storage" },
            { id: 5, text: "Review jujur makanan Kevin (Food Critic)", reward: "Honesty +100" },
            { id: 6, text: "Ajak selfie mirror di toilet mall (Narcissist)", reward: "Memory Locked" }
        ]
    };

    const topicsData = [
        "Apa first impression kamu pas ketemu aku?", "Kalo kita bisa liburan ke luar angkasa, mau ngapain?",
        "Hal apa yang paling bikin kamu ilfeel?", "Apa memori masa kecil yang paling kamu inget?",
        "Kalo besok kiamat, makanan terakhir yang mau dimakan apa?", "Apa lagu yang paling menggambarkan mood kamu sekarang?",
        "Siapa tokoh fiksi yang mirip sama aku?", "Apa goals terbesar kamu tahun depan?",
        "Apa kebiasaan aneh aku yang kamu notice?", "Kalo punya uang 1M sekarang, dipake apa?",
        "Apa momen ter-awkward kita?", "Sebutin 3 hal yang bikin kamu bersyukur hari ini."
    ];

    const budgetPlans: Record<string, { total: string; vibe: string; items: { item: string; qty: string; price: string; total: string }[] }> = {
        optimistic: {
            total: "Rp 200.000",
            vibe: "Hemat Pangkal Kaya",
            items: [
                { item: "Tiket KA (Eko)", qty: "2x", price: "24.000", total: "48.000" },
                { item: "Angkot/Ojol Hemat", qty: "4x", price: "10.000", total: "40.000" },
                { item: "Makan Kaki Lima", qty: "2x", price: "25.000", total: "50.000" },
                { item: "Air Mineral (Alfamart)", qty: "2x", price: "5.000", total: "10.000" },
                { item: "Tiket Masuk (Alun2)", qty: "2x", price: "Free", total: "0" },
                { item: "Dana Darurat", qty: "1x", price: "50.000", total: "50.000" }
            ]
        },
        realistic: {
            total: "Rp 350.000",
            vibe: "Standard Liburan",
            items: [
                { item: "Tiket KA (Eko/Eks)", qty: "2x", price: "30.000", total: "60.000" },
                { item: "Gocar (Patungan)", qty: "4x", price: "15.000", total: "60.000" },
                { item: "Makan Cafe/Mall", qty: "1x", price: "75.000", total: "75.000" },
                { item: "Snack/Kopi", qty: "2x", price: "25.000", total: "50.000" },
                { item: "Photobooth", qty: "1x", price: "35.000", total: "35.000" },
                { item: "Dana Darurat", qty: "1x", price: "70.000", total: "70.000" }
            ]
        },
        pessimistic: {
            total: "Rp 600.000+",
            vibe: "Sultan Mode / Jaga-jaga",
            items: [
                { item: "Tiket KA (Eks)", qty: "2x", price: "60.000", total: "120.000" },
                { item: "Gocar Premium", qty: "4x", price: "30.000", total: "120.000" },
                { item: "Fine Dining", qty: "1x", price: "150.000", total: "150.000" },
                { item: "Belanja/Oleh2", qty: "1x", price: "100.000", total: "100.000" },
                { item: "Photobooth Print", qty: "2x", price: "40.000", total: "80.000" },
                { item: "Dana Darurat", qty: "1x", price: "100.000", total: "100.000" }
            ]
        }
    };

    const spotsData = [
        { title: "Tunjungan Plaza 6", cat: "Dining & Lifestyle", img: "https://images.unsplash.com/photo-1519567241046-7f570eee3c9e?q=80&w=1000", desc: "Pusat kuliner estetik. Wajib ke Chameleon Hall buat foto." },
        { title: "Kopi Nako Gubeng", cat: "Coffee Shop", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000", desc: "Arsitektur kaca hits. Kopi susu-nya juara." },
        { title: "Gedung Internatio", cat: "Kota Lama", img: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1000", desc: "Vibes Eropa 1920-an. Datang pas Golden Hour (16:30)." },
        { title: "Pos Bloc Sby", cat: "Creative Hub", img: "https://images.unsplash.com/photo-1582037928769-181f2422677e?q=80&w=1000", desc: "Bekas kantor pos jadi tempat nongkrong artsy." },
        { title: "Alun-Alun Bawah Tanah", cat: "Art & Public Space", img: "https://images.unsplash.com/photo-1518998053901-5348d3969105?q=80&w=1000", desc: "Ada galeri seni dan skate park. Adem full AC." },
        { title: "Jalan Tunjungan", cat: "Street View", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000", desc: "Malioboro-nya Surabaya. Bagus banget pas malem." }
    ];

    // Data for Maps/Distance - POPULATED
    const mapsData = [
        { id: 1, route: "St. Malang -> St. Gubeng", distance: "90 KM", time: "2 Jam", mode: "Kereta", icon: <Train /> },
        { id: 2, route: "St. Gubeng -> Kopi Nako", distance: "200 M", time: "3 Menit", mode: "Jalan Kaki", icon: <Coffee /> },
        { id: 3, route: "Kopi Nako -> Tunjungan Plaza", distance: "2.5 KM", time: "15 Menit", mode: "Gocar/Mobil", icon: <Car /> },
        { id: 4, route: "TP 6 -> Alun-Alun SBY", distance: "1.2 KM", time: "8 Menit", mode: "Gocar/Mobil", icon: <Car /> },
        { id: 5, route: "Alun-Alun -> Kota Lama", distance: "3.8 KM", time: "20 Menit", mode: "Gocar (Traffic)", icon: <Car /> },
        { id: 6, route: "Kota Lama -> St. Gubeng", distance: "4.2 KM", time: "25 Menit", mode: "Gocar (Macet Sore)", icon: <Car /> },
    ];

    // --- HELPER FUNCTIONS ---

    const handleTaskCheck = (id: number) => {
        if (userPersona === 'Kevin') setKevinTasks(prev => ({ ...prev, [id]: !prev[id] }));
        else setDinaTasks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isAllTasksCompleted = () => Object.values(userPersona === 'Kevin' ? kevinTasks : dinaTasks).every(status => status === true);

    const shuffleTopic = () => setCurrentTopic(topicsData[Math.floor(Math.random() * topicsData.length)]);

    const createCalendarLink = (item: { time: string; activity: string; desc: string; location: string }) => {
        const dates = "20251228T" + item.time.split(' - ')[0].replace(':', '') + "00/" + "20251228T" + item.time.split(' - ')[1].replace(':', '') + "00";
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.activity)}&dates=${dates}&details=${encodeURIComponent(item.desc)}&location=${encodeURIComponent(item.location)}`;
    };

    // --- GOOGLE AUTH FUNCTIONS ---

    // Parse JWT token from Google
    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    };

    // Handle Google login callback
    const handleGoogleCallback = (response: { credential: string }) => {
        const userData = parseJwt(response.credential);
        if (userData) {
            const googleUser = {
                id: userData.sub,
                email: userData.email,
                name: userData.name,
                image: userData.picture
            };

            // Check if user already exists
            const users: UserData[] = JSON.parse(localStorage.getItem('kepina_users') || '[]');
            const existingUser = users.find(u => u.email === googleUser.email);

            if (existingUser) {
                // Login existing user
                localStorage.setItem('kepina_user', JSON.stringify(existingUser));
                setCurrentUser(existingUser);
                setUserPersona(existingUser.persona);
                setShowAuthModal(false);
            } else {
                // New user - need to pick persona
                setPendingGoogleUser(googleUser);
                setShowAuthModal(false);
                setShowPersonaModal(true);
            }
        }
    };

    // Initialize Google OAuth
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    // Complete registration with persona
    const completeGoogleRegistration = () => {
        if (!pendingGoogleUser) return;

        const newUser: UserData = {
            id: pendingGoogleUser.id,
            username: pendingGoogleUser.name,
            email: pendingGoogleUser.email,
            image: pendingGoogleUser.image,
            persona: selectedPersona,
            provider: 'google',
            createdAt: new Date().toISOString()
        };

        const users: UserData[] = JSON.parse(localStorage.getItem('kepina_users') || '[]');
        users.push(newUser);
        localStorage.setItem('kepina_users', JSON.stringify(users));
        localStorage.setItem('kepina_user', JSON.stringify(newUser));

        setCurrentUser(newUser);
        setUserPersona(newUser.persona);
        setPendingGoogleUser(null);
        setShowPersonaModal(false);
    };

    // Mock Google login for demo (when no client ID)
    const handleMockGoogleLogin = () => {
        const mockUser = {
            id: 'mock_' + generateId(),
            email: 'demo@gmail.com',
            name: 'Demo User',
            image: undefined
        };

        const users: UserData[] = JSON.parse(localStorage.getItem('kepina_users') || '[]');
        const existingUser = users.find(u => u.email === mockUser.email);

        if (existingUser) {
            localStorage.setItem('kepina_user', JSON.stringify(existingUser));
            setCurrentUser(existingUser);
            setUserPersona(existingUser.persona);
            setShowAuthModal(false);
        } else {
            setPendingGoogleUser(mockUser);
            setShowAuthModal(false);
            setShowPersonaModal(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('kepina_user');
        setCurrentUser(null);
    };

    // --- CTA CRUD FUNCTIONS ---

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran gambar maksimal 5MB!');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setCTAImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveCTA = () => {
        if (!ctaText.trim() || !currentUser) return;

        if (editingCTA) {
            // Update existing CTA
            setCustomCTAs(prev => prev.map(c =>
                c.id === editingCTA.id
                    ? { ...c, text: ctaText.trim(), reward: ctaReward.trim(), imageProof: ctaImage }
                    : c
            ));
        } else {
            // Create new CTA
            const newCTA: CustomCTA = {
                id: generateId(),
                text: ctaText.trim(),
                reward: ctaReward.trim() || 'Achievement Unlocked',
                imageProof: ctaImage,
                completed: false,
                userId: currentUser.id,
                createdAt: new Date().toISOString()
            };
            setCustomCTAs(prev => [...prev, newCTA]);
        }
        resetCTAForm();
    };

    const resetCTAForm = () => {
        setCTAText('');
        setCTAReward('');
        setCTAImage(null);
        setEditingCTA(null);
        setShowCTAModal(false);
    };

    const handleEditCTA = (cta: CustomCTA) => {
        setEditingCTA(cta);
        setCTAText(cta.text);
        setCTAReward(cta.reward);
        setCTAImage(cta.imageProof);
        setShowCTAModal(true);
    };

    const handleDeleteCTA = (id: string) => {
        setCustomCTAs(prev => prev.filter(c => c.id !== id));
        setDeletingCTA(null);
    };

    const toggleCTAComplete = (id: string) => {
        setCustomCTAs(prev => prev.map(c =>
            c.id === id ? { ...c, completed: !c.completed } : c
        ));
    };

    const getUserCTAs = () => {
        if (!currentUser) return [];
        return customCTAs.filter(c => c.userId === currentUser.id);
    };

    // Get display name (first word of username)
    const getDisplayName = () => {
        if (!currentUser) return '';
        return currentUser.username.split(' ')[0];
    };

    // --- COMPONENTS ---

    const renderTimeline = (data: typeof mainSchedule) => (
        <div className="relative pl-4 md:pl-6 space-y-8 ml-2">
            <div className={`absolute left-[27px] md:left-[35px] top-6 bottom-6 w-0 border-l-2 border-dashed ${planMode === 'main' ? 'border-indigo-200' : 'border-slate-300'}`}></div>
            {data.map((item) => (
                <div key={item.id} className="relative pl-8 md:pl-12 group animate-in slide-in-from-bottom-4 duration-500">
                    <div className={`absolute left-0 top-0 w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-[#F0F4F9] flex items-center justify-center z-10 transition-all duration-300 shadow-sm scale-100 hover:scale-105 ${item.iconTheme}`}>
                        {item.icon}
                    </div>
                    <div onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)} className={`${item.theme} rounded-[24px] p-5 md:p-6 cursor-pointer transition-all duration-300 relative shadow-sm hover:shadow-md hover:translate-x-1`}>
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <span className="inline-block text-[10px] font-bold uppercase bg-white/40 px-2 py-0.5 rounded-md mb-1 backdrop-blur-sm">{item.time}</span>
                                <h3 className="font-bold text-xl leading-tight mb-1">{item.activity}</h3>
                                <div className="text-sm font-medium opacity-80 flex items-center gap-1.5"><MapPin size={14} /> {item.location}</div>
                            </div>
                            <div className={`transition-transform duration-300 opacity-60 ${expandedItem === item.id ? 'rotate-180' : ''}`}><ChevronDown size={20} /></div>
                        </div>
                        {expandedItem === item.id && (
                            <div className="mt-4 pt-4 border-t border-black/10 animate-in fade-in zoom-in-95 duration-300">
                                <div className="h-40 rounded-xl overflow-hidden mb-3 shadow-inner"><img src={item.image} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" alt={item.activity} /></div>
                                <p className="text-sm font-medium leading-relaxed mb-3">{item.desc}</p>
                                <div className="flex gap-2">
                                    <a href={createCalendarLink(item)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/50 hover:bg-white text-xs font-bold py-2 rounded-lg text-center transition-colors shadow-sm">Save Date</a>
                                    <a href={`https://www.google.com/search?q=${encodeURIComponent(item.location)}`} target="_blank" rel="noopener noreferrer" className="w-10 flex items-center justify-center bg-white/50 hover:bg-white rounded-lg transition-colors shadow-sm"><ExternalLink size={14} /></a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ fontFamily: 'Montserrat, sans-serif' }} className="min-h-screen bg-[#F0F4F9] text-[#1F1F1F] flex flex-col md:flex-row selection:bg-pink-200">
            <audio ref={audioRef} src="https://xri1xbwynlfpuw7m.public.blob.vercel-storage.com/Seycara%20%20Alice%20in%20Paris%21%20%5BFull%20Album%5D%20-%20Seycara.mp3" loop autoPlay />
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />

            {/* SIDEBAR */}
            <aside className="bg-[#F0F4F9] p-4 md:p-6 md:w-80 lg:w-[320px] md:h-screen md:sticky md:top-0 flex flex-col z-20 shrink-0">
                {/* User Info / Auth */}
                <div className="bg-white rounded-[28px] p-4 shadow-sm mb-4">
                    {currentUser ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${currentUser.persona === 'Kevin' ? 'bg-indigo-500' : 'bg-pink-500'}`}>
                                    {getDisplayName().charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{getDisplayName()}</div>
                                    <div className="text-xs text-gray-400">as {currentUser.persona}</div>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-all">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setShowAuthModal(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all">
                            <LogIn size={18} /> Login / Register
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-[28px] p-6 shadow-sm mb-4 hover:shadow-md transition-all duration-500 group">
                    <div className="flex justify-between items-center mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm transition-colors ${planMode === 'main' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                            {planMode === 'main' ? <><Palmtree size={14} /> Holiday</> : <><CloudRain size={14} /> Rainy Mode</>}
                        </div>
                        <button onClick={toggleMusic} className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${isPlaying ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100'}`}>{isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-[#1F1F1F] group-hover:text-indigo-600 transition-colors">Kevin & Dina&apos;s</h1>
                    <div className="text-2xl font-light text-gray-400 mb-4">SBY Trip</div>
                    <div className="text-xs text-gray-500 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-2 mb-1"><Calendar size={14} /> 28 Des 2025</div>
                        <div className="flex items-center gap-2"><MapIcon size={14} /> Malang - SBY</div>
                    </div>
                </div>
                <nav className="hidden md:flex flex-col gap-2 bg-white rounded-[28px] p-3 shadow-sm flex-1 overflow-y-auto">
                    {[
                        { id: 'timeline', icon: <Clock size={20} />, label: 'Timeline' },
                        { id: 'details', icon: <List size={20} />, label: 'Full Rundown' },
                        { id: 'missions', icon: <CheckSquare size={20} />, label: 'Missions' },
                        { id: 'cta', icon: <Plus size={20} />, label: 'My CTAs', requireAuth: true },
                        { id: 'budget', icon: <Wallet size={20} />, label: 'Budget Plan' },
                        { id: 'spots', icon: <MapPin size={20} />, label: 'Spots Guide' },
                        { id: 'chat', icon: <MessageCircle size={20} />, label: 'Deep Talk' },
                        { id: 'maps', icon: <Navigation size={20} />, label: 'Distance Info' },
                        { id: 'risks', icon: <Shield size={20} />, label: 'Mitigation' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.requireAuth && !currentUser) {
                                    setShowAuthModal(true);
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 text-sm font-bold ${activeTab === item.id ? `${theme.bg} text-white shadow-lg shadow-indigo-200 transform scale-105` : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 relative flex flex-col h-full overflow-y-auto scroll-smooth">
                {/* Mobile Nav */}
                <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 overflow-x-auto whitespace-nowrap no-scrollbar">
                    <div className="flex gap-2">
                        {['timeline', 'details', 'missions', 'cta', 'budget', 'spots', 'chat', 'maps'].map((id) => (
                            <button
                                key={id}
                                onClick={() => {
                                    if (id === 'cta' && !currentUser) {
                                        setShowAuthModal(true);
                                    } else {
                                        setActiveTab(id);
                                    }
                                }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${activeTab === id ? `${theme.bg} text-white border-transparent` : 'bg-white text-gray-500 border-gray-200'}`}
                            >
                                {id === 'cta' ? 'CTAs' : id}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cover Header */}
                <div className={`w-full h-32 md:h-48 ${theme.bg} relative overflow-hidden transition-colors duration-500`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-4 left-4 md:left-8 text-white z-10">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <h2 className="text-3xl md:text-4xl font-black">{activeTab === 'timeline' ? 'The Journey' : activeTab === 'missions' ? 'Friendship Quests' : activeTab === 'budget' ? 'Money Matters' : activeTab === 'chat' ? 'Connect' : activeTab === 'spots' ? 'Hidden Gems' : activeTab === 'maps' ? 'Route Info' : 'Details'}</h2>
                    </div>
                </div>

                <div className="p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-10 min-h-screen -mt-6 relative z-10">

                    {/* --- TIMELINE PAGE --- */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${planMode === 'main' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {planMode === 'main' ? <Sun size={20} /> : <CloudRain size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 font-bold uppercase">Current Mode</div>
                                        <div className="font-black text-gray-800 text-lg">{planMode === 'main' ? "Sunny Day Plan" : "Rainy / Indoor Plan"}</div>
                                    </div>
                                </div>
                                <div className="bg-gray-100 p-1 rounded-full flex">
                                    <button onClick={() => setPlanMode('main')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${planMode === 'main' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Main</button>
                                    <button onClick={() => setPlanMode('rain')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${planMode === 'rain' ? 'bg-slate-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Indoor</button>
                                </div>
                            </div>
                            {renderTimeline(planMode === 'main' ? mainSchedule : rainSchedule)}
                        </div>
                    )}

                    {/* --- DETAILS TABLE PAGE --- */}
                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2"><List size={20} className="text-blue-600" /> Detailed Rundown</h3>
                                    <div className="flex gap-2">
                                        <span className={`w-3 h-3 rounded-full ${planMode === 'main' ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                                        <span className={`w-3 h-3 rounded-full ${planMode === 'rain' ? 'bg-slate-500' : 'bg-gray-300'}`}></span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Time</th>
                                                <th className="px-6 py-4 font-bold">Activity</th>
                                                <th className="px-6 py-4 font-bold">Location</th>
                                                <th className="px-6 py-4 font-bold">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(planMode === 'main' ? mainSchedule : rainSchedule).map((item) => (
                                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-blue-600 whitespace-nowrap">{item.time}</td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                                        <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                            {item.icon} {item.activity}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{item.location}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs leading-relaxed max-w-xs">{item.desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MISSIONS (CTA) PAGE --- */}
                    {activeTab === 'missions' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-pink-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Select Persona</h3>
                                    <p className="text-gray-500 text-sm">Switch to see your specific missions.</p>
                                </div>
                                <div className="flex bg-gray-100 p-1.5 rounded-full">
                                    <button onClick={() => setUserPersona('Kevin')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${userPersona === 'Kevin' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-indigo-600'}`}><User size={16} /> Kevin</button>
                                    <button onClick={() => setUserPersona('Dina')} className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${userPersona === 'Dina' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-500 hover:text-pink-600'}`}><User size={16} /> Dina</button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {(userPersona === 'Kevin' ? missionsData.Kevin : missionsData.Dina).map((task) => (
                                    <div key={task.id} onClick={() => handleTaskCheck(task.id)} className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4 group hover:scale-[1.01] ${(userPersona === 'Kevin' ? kevinTasks[task.id] : dinaTasks[task.id])
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-white hover:border-pink-200 shadow-sm'
                                        }`}>
                                        <div className="flex items-center gap-4 w-full">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${(userPersona === 'Kevin' ? kevinTasks[task.id] : dinaTasks[task.id])
                                                ? 'bg-green-500 text-white scale-110 rotate-12'
                                                : 'bg-gray-100 text-gray-300 group-hover:bg-pink-100 group-hover:text-pink-400'
                                                }`}>
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <span className={`font-bold text-lg transition-all ${(userPersona === 'Kevin' ? kevinTasks[task.id] : dinaTasks[task.id]) ? 'text-green-800 line-through opacity-50' : 'text-gray-700'}`}>
                                                {task.text}
                                            </span>
                                        </div>
                                        {(userPersona === 'Kevin' ? kevinTasks[task.id] : dinaTasks[task.id]) && (
                                            <span className="text-xs font-black uppercase tracking-wider bg-green-200 text-green-800 px-4 py-2 rounded-full animate-in zoom-in spin-in-3">{task.reward}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isAllTasksCompleted() && (
                                <div className="mt-8 p-10 bg-gradient-to-br from-pink-100 to-white rounded-[32px] text-center border-4 border-pink-200 animate-in zoom-in duration-700 relative overflow-hidden shadow-xl">
                                    <div className="relative z-10">
                                        <div className="inline-block p-4 bg-white rounded-full shadow-md mb-4"><Heart size={48} className="text-pink-500 fill-pink-500 animate-pulse" /></div>
                                        <h3 className="text-3xl font-black text-pink-800 mb-4">Mission Accomplished!</h3>
                                        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl max-w-2xl mx-auto border border-pink-100">
                                            <p className="text-pink-900 font-semibold text-lg md:text-xl leading-relaxed italic">
                                                &quot;{userPersona === 'Kevin'
                                                    ? "Dear Kevin, hari ini seru banget! Makasih udah jadi partner traveling yang paling asik, nggak ribet, dan selalu siap sedia. Energinya pas banget, deep talk-nya dapet, recehnya juga dapet. Bener-bener grateful bisa ngabisin waktu seharian sama lo. Next trip kemana lagi kita?"
                                                    : "Dear Dina, thank you udah jadi teman jalan yang paling pengertian. Ketawa kamu hari ini nular banget dan bikin capeknya ilang. Makasih udah mau diajak eksplor sana-sini tanpa ngeluh. You made this trip unforgettable! Let's make more memories soon!"}&quot;
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- BUDGET PAGE (3 SCENARIOS) --- */}
                    {activeTab === 'budget' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex justify-center mb-6">
                                <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                                    {['optimistic', 'realistic', 'pessimistic'].map((mode) => (
                                        <button key={mode} onClick={() => setBudgetMode(mode)} className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${budgetMode === mode ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-emerald-600'}`}>
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Summary Card */}
                                <div className="w-full md:w-1/3 bg-emerald-600 text-white p-8 rounded-[32px] shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-500">
                                    <div className="relative z-10">
                                        <div className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={14} /> Estimated Total</div>
                                        <div className="text-5xl font-black mb-4 tracking-tighter">{budgetPlans[budgetMode].total}</div>
                                        <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10">
                                            {budgetPlans[budgetMode].vibe}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-400 rounded-full blur-3xl opacity-50"></div>
                                </div>

                                {/* Detailed List */}
                                <div className="flex-1 bg-white rounded-[32px] p-2 shadow-sm border border-gray-100">
                                    <table className="w-full text-sm">
                                        <thead className="text-gray-400 text-xs uppercase border-b border-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-bold">Item</th>
                                                <th className="px-6 py-4 text-center font-bold">Qty</th>
                                                <th className="px-6 py-4 text-right font-bold">Price</th>
                                                <th className="px-6 py-4 text-right font-bold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {budgetPlans[budgetMode].items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-700">{item.item}</td>
                                                    <td className="px-6 py-4 text-center text-gray-500 bg-gray-50/50 rounded-lg m-1">{item.qty}</td>
                                                    <td className="px-6 py-4 text-right text-gray-500">{item.price}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{item.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SPOTS GUIDE PAGE (RICH VISUALS) --- */}
                    {activeTab === 'spots' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {spotsData.map((spot, i) => (
                                <div key={i} className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 cursor-pointer">
                                    <div className="h-64 overflow-hidden relative">
                                        <img src={spot.img} alt={spot.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-orange-800 shadow-sm">
                                            {spot.cat}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">{spot.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{spot.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- MAPS PAGE (DISTANCE INFO) --- */}
                    {activeTab === 'maps' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-teal-50 border border-teal-100 p-8 rounded-[32px] text-center mb-6">
                                <Navigation size={48} className="mx-auto text-teal-600 mb-4" />
                                <h2 className="text-2xl font-bold text-teal-800">Route & Distance</h2>
                                <p className="text-teal-600">Estimasi waktu tempuh normal (tanpa macet parah).</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mapsData.map((route, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-teal-50 p-3 rounded-full text-teal-600">{route.icon}</div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{route.mode}</div>
                                                <div className="font-bold text-gray-800">{route.route}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-teal-600">{route.distance}</div>
                                            <div className="text-xs font-bold text-gray-400">{route.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- CHAT & CONNECT PAGE --- */}
                    {activeTab === 'chat' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-violet-600 text-white p-10 rounded-[40px] text-center shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="inline-block bg-white/20 p-4 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-inner">
                                        <MessageCircle size={48} />
                                    </div>
                                    <h2 className="text-4xl font-black mb-4 tracking-tight">Deep Talk Generator</h2>
                                    <p className="text-violet-200 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
                                        Gak ada lagi momen diem-dieman pas nunggu makanan. Tekan tombol buat dapet topik random!
                                    </p>

                                    <div className="bg-white text-violet-900 p-8 md:p-12 rounded-[32px] shadow-2xl min-h-[200px] flex items-center justify-center relative mx-auto max-w-3xl transform transition-all hover:scale-[1.02]">
                                        <p className="text-2xl md:text-3xl font-bold leading-snug">&quot;{currentTopic}&quot;</p>
                                        <div className="absolute top-6 left-6 opacity-10"><MessageCircle size={80} /></div>
                                    </div>

                                    <button onClick={shuffleTopic} className="mt-10 bg-white text-violet-600 px-10 py-5 rounded-full font-black text-lg shadow-lg hover:shadow-xl hover:bg-violet-50 transition-all flex items-center gap-3 mx-auto active:scale-95 group">
                                        <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" /> Spin Topic
                                    </button>
                                </div>
                                {/* Background Decor */}
                                <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'risks' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-red-600 text-white p-8 rounded-[32px] flex items-center gap-6 shadow-lg">
                                <Shield size={48} className="shrink-0" />
                                <div>
                                    <h2 className="text-2xl font-bold">Risk Mitigation</h2>
                                    <p className="opacity-90">Prepare for the worst, hope for the best.</p>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                {[
                                    { r: "Low Battery", m: "Bawa PB 20k mAh" }, { r: "Copet", m: "Tas di depan" },
                                    { r: "Mabuk", m: "Antimo + Tolak Angin" }, { r: "Cashless Error", m: "Bawa Cash 200k" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border-l-8 border-red-500 flex justify-between items-center hover:shadow-md transition-all">
                                        <span className="font-bold text-gray-800 text-lg">{item.r}</span>
                                        <span className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm font-bold">{item.m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- CTA (Custom Call to Actions) PAGE --- */}
                    {activeTab === 'cta' && currentUser && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-cyan-600 text-white p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                                <div className="flex items-center gap-4">
                                    <Plus size={48} className="shrink-0" />
                                    <div>
                                        <h2 className="text-2xl font-bold">My Call to Actions</h2>
                                        <p className="opacity-90">Tambah misi pribadi kamu untuk trip ini!</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCTAModal(true)}
                                    className="bg-white text-cyan-600 px-6 py-3 rounded-full font-bold hover:bg-cyan-50 transition-all flex items-center gap-2"
                                >
                                    <Plus size={20} /> Tambah CTA
                                </button>
                            </div>

                            {getUserCTAs().length === 0 ? (
                                <div className="bg-white p-12 rounded-[32px] text-center shadow-sm">
                                    <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckSquare size={40} className="text-cyan-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada CTA</h3>
                                    <p className="text-gray-500">Klik tombol &quot;Tambah CTA&quot; untuk membuat misi pertama kamu!</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {getUserCTAs().map((cta) => (
                                        <div
                                            key={cta.id}
                                            className={`p-6 rounded-[24px] border-2 transition-all duration-300 ${cta.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <button
                                                        onClick={() => toggleCTAComplete(cta.id)}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 mt-1 ${cta.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300 hover:bg-cyan-100 hover:text-cyan-500'
                                                            }`}
                                                    >
                                                        <CheckCircle2 size={20} />
                                                    </button>
                                                    <div className="flex-1">
                                                        <span className={`font-bold text-lg block mb-1 ${cta.completed ? 'text-green-800 line-through opacity-60' : 'text-gray-800'}`}>
                                                            {cta.text}
                                                        </span>
                                                        {cta.reward && (
                                                            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                                                                {cta.reward}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {cta.imageProof && (
                                                        <button
                                                            onClick={() => setExpandedItem(expandedItem === cta.id ? null : cta.id)}
                                                            className="p-2 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-all"
                                                        >
                                                            <ImageIcon size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditCTA(cta)}
                                                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingCTA(cta)}
                                                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {cta.imageProof && expandedItem === cta.id && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                                                    <img src={cta.imageProof} alt="Proof" className="w-full max-h-64 object-contain rounded-xl" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* --- AUTH MODAL (Google OAuth) --- */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAuthModal(false)}>
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800">Login</h2>
                            <button onClick={() => setShowAuthModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                                <User size={40} className="text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Selamat Datang!</h3>
                                <p className="text-gray-500 text-sm">Login dengan Google untuk mengakses fitur My CTAs</p>
                            </div>

                            {/* Google Sign In Button */}
                            <button
                                onClick={handleMockGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <p className="text-xs text-gray-400">
                                Dengan login, kamu setuju untuk menggunakan aplikasi ini sesuai ketentuan.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PERSONA SELECTION MODAL --- */}
            {showPersonaModal && pendingGoogleUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800">Pilih Persona</h2>
                            <p className="text-gray-500 text-sm mt-2">Halo {pendingGoogleUser.name.split(' ')[0]}! Kamu mau jadi siapa?</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedPersona('Kevin')}
                                    className={`flex-1 p-6 rounded-2xl border-2 transition-all ${selectedPersona === 'Kevin'
                                        ? 'bg-indigo-50 border-indigo-500 shadow-lg'
                                        : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black ${selectedPersona === 'Kevin' ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600'
                                        }`}>
                                        K
                                    </div>
                                    <div className="font-bold text-gray-800">Kevin</div>
                                </button>
                                <button
                                    onClick={() => setSelectedPersona('Dina')}
                                    className={`flex-1 p-6 rounded-2xl border-2 transition-all ${selectedPersona === 'Dina'
                                        ? 'bg-pink-50 border-pink-500 shadow-lg'
                                        : 'bg-gray-50 border-gray-200 hover:border-pink-300'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black ${selectedPersona === 'Dina' ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'
                                        }`}>
                                        D
                                    </div>
                                    <div className="font-bold text-gray-800">Dina</div>
                                </button>
                            </div>

                            <button
                                onClick={completeGoogleRegistration}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${selectedPersona === 'Kevin' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-pink-600 hover:bg-pink-700'
                                    }`}
                            >
                                Lanjut sebagai {selectedPersona}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CTA MODAL --- */}
            {showCTAModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetCTAForm}>
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800">{editingCTA ? 'Edit CTA' : 'Tambah CTA'}</h2>
                            <button onClick={resetCTAForm} className="p-2 rounded-full hover:bg-gray-100 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 block mb-2">Misi / CTA</label>
                                <input
                                    type="text"
                                    value={ctaText}
                                    onChange={(e) => setCTAText(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
                                    placeholder="Contoh: Coba es pisang ijo di Gubeng"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 block mb-2">Reward (Optional)</label>
                                <input
                                    type="text"
                                    value={ctaReward}
                                    onChange={(e) => setCTAReward(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
                                    placeholder="Contoh: Foodie Master"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 block mb-2">Image Proof (Optional)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-all"
                                >
                                    {ctaImage ? (
                                        <div className="relative">
                                            <img src={ctaImage} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setCTAImage(null); }}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Klik untuk upload gambar (max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveCTA}
                                disabled={!ctaText.trim()}
                                className="w-full py-4 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {editingCTA ? 'Update CTA' : 'Simpan CTA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {deletingCTA && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeletingCTA(null)}>
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 mb-2">Hapus CTA?</h2>
                        <p className="text-gray-500 mb-6">CTA ini akan dihapus permanen.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingCTA(null)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDeleteCTA(deletingCTA.id)}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OneDayTrip;
