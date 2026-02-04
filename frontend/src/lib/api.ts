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
            // Log the error but do NOT auto-logout immediately to prevent loops
            console.error("API 401 Unauthorized - Token may be invalid or expired. Check backend or re-login manually.");
            // clearAuth(); // Disable auto-logout for now
        }
        return Promise.reject(error);
    }
);
