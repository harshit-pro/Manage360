// src/lib/api.ts
// Centralized Axios instance for all API calls.

import axios, { InternalAxiosRequestConfig } from "axios";
import { getToken, clearAuth } from "./auth";

export const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add Authorization header if token exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle 401 – auto logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth and optionally redirect – the UI can listen to auth state changes
            clearAuth();
            // Optionally you could trigger a custom event or use a global state manager.
        }
        return Promise.reject(error);
    }
);
