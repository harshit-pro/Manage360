// src/lib/api.ts
import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to requests (skip auth endpoints – they don't need it)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const url = config.url || "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/signup");
    if (!isAuthEndpoint) {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor – auto-redirect to login on 401 (only for protected endpoints)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/signup");

        if (error.response?.status === 401 && !isAuthEndpoint) {
            console.error("401 Unauthorized – token invalid or expired");
            // Clear stale auth data
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userRole");
            // Redirect to login (avoid redirect loop if already on login/signup)
            const path = window.location.pathname;
            if (path !== "/login" && path !== "/signup" && path !== "/") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;

