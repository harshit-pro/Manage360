// src/lib/auth.ts
// Authentication utilities using JWT stored in localStorage.

import api from "./api";

export const TOKEN_KEY = "accessToken";
export const ROLE_KEY = "userRole";

/** Store token and optional role after successful login */
export function setAuth(token: string, role?: string) {
    localStorage.setItem(TOKEN_KEY, token);
    if (role) {
        localStorage.setItem(ROLE_KEY, role);
    } else {
        localStorage.removeItem(ROLE_KEY);
    }
}

/** Clear authentication data (logout) */
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem('libraryName');
    localStorage.removeItem('totalSeats');
}

/** Retrieve stored JWT token */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/** Retrieve stored user role (if any) */
export function getUserRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
}

/** Check if user is authenticated AND token is still valid */
export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;
    // Try to check expiration from JWT payload
    try {
        const payload = decodeJwtPayload(token);
        if (payload?.exp) {
            // exp is in seconds, Date.now() is in milliseconds
            if (payload.exp * 1000 < Date.now()) {
                // Token has expired – clear stale auth data
                clearAuth();
                return false;
            }
        }
    } catch {
        // If decode fails, fall through – let the API call decide
    }
    // Token exists and is not detectably expired
    return true;
}

/** Perform login against backend */
export async function login(email: string, password: string): Promise<{ token: string; role: string }> {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, role, libraryName } = response.data;
    setAuth(accessToken, role);
    // Persist library name for UI display
    if (libraryName) {
        localStorage.setItem('libraryName', libraryName);
    }
    return { token: accessToken, role };
}

/** Logout helper */
export function logout() {
    clearAuth();
}
// Decode JWT payload (base64url) without verification
function decodeJwtPayload(token: string): any {
    try {
        const payload = token.split(".")[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/** Return current user info extracted from JWT (if present) */
export function currentUser(): { name?: string; email?: string; role?: string; libraryName?: string } | null {
    const token = getToken();
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return {
        name: payload.libraryName || payload.sub?.split('@')[0] || 'User',
        email: payload.sub,
        role: payload.role ?? getUserRole(),
        libraryName: payload.libraryName || getLibraryName() || undefined,
    };
}

/** Alias for logout used by UI components */
export const signOut = logout;

// ====================
// Additional auth helpers used by the UI
// ====================

/** Simple user type for demo purposes */
export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
}

// Real signup – creates library and owner via backend
export async function signup(payload: {
    libraryName: string;
    address?: string;
    city?: string;
    totalSeats: number;
    regPrefix?: string;
    email: string;
    password: string;
}): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/signup', payload);
    const { accessToken } = response.data;
    // Store token (JWT contains role=OWNER and libraryId)
    setAuth(accessToken);
    // Start of Selection
    // Persist library name for UI display
    localStorage.setItem('libraryName', payload.libraryName);
    localStorage.setItem('totalSeats', payload.totalSeats.toString());
    return { accessToken };
}

// Demo signUp helper for seeding local demo data (does NOT call backend)
export function signUp(name: string, email: string, password: string): User {
    const users: User[] = JSON.parse(localStorage.getItem("cl.users") || "[]");
    // Prevent duplicate email entries
    if (users.find((u) => u.email === email)) {
        throw new Error("User with this email already exists");
    }
    const id = Math.random().toString(36).substring(2, 10);
    const newUser: User = { id, name, email, password };
    users.push(newUser);
    localStorage.setItem("cl.users", JSON.stringify(users));
    return newUser;

}
export const createUser = signUp;
// Retrieve a user by email from local demo storage
export function getUserByEmail(email: string): User | undefined {
    const users: User[] = JSON.parse(localStorage.getItem("cl.users") || "[]");
    return users.find((u) => u.email === email);
}

// Retrieve stored library name (set during signup)
export function getLibraryName(): string | null {
    return localStorage.getItem('libraryName');
}

/** 
 * Update local library metadata and notify components to refresh.
 * This ensures changes in Settings reflect globally without a page reload.
 */
export function updateLibraryMetadata(name: string, totalSeats?: number, templatesJson?: string) {
    localStorage.setItem('libraryName', name);
    if (totalSeats !== undefined) {
        localStorage.setItem('totalSeats', totalSeats.toString());
    }
    if (templatesJson !== undefined) {
        localStorage.setItem('messageTemplates', templatesJson);
    }
    window.dispatchEvent(new Event('library-updated'));
}
