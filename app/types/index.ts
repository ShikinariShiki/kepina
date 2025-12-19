// User type
export interface User {
    id: string;
    username: string;
    password?: string;
    email?: string;
    image?: string;
    provider?: 'credentials' | 'google';
    createdAt: string;
}

// CTA type
export interface CTA {
    id: string;
    title: string;
    description: string;
    link: string;
    imageProof: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

// Auth state
export interface AuthState {
    user: User | null;
    isLoading: boolean;
}
