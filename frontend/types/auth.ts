export interface User {
    id: number;
    email: string;
    is_active: boolean;
    is_verified: boolean;
    first_name?: string;
    last_name?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
