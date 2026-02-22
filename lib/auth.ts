const API_BASE = 'http://localhost:5000/api';

export interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegisterData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export async function login(data: LoginData): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');

    // Store token and user in localStorage
    localStorage.setItem('token', json.token);
    localStorage.setItem('user', JSON.stringify(json.user));

    return json;
}

export async function register(data: RegisterData): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');

    return json;
}

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

export function getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export function logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
