// src/lib/library.ts
// API helpers for fetching and updating the current library profile

import api from "./api";

export interface Library {
    id: string;
    name: string;
    address: string;
    city: string;
    totalSeats: number;
    contact: string;
    templatesJson?: string;
    createdAt: string; // ISO date string
}

/** Fetch the library profile of the currently logged‑in library */
export async function getCurrentLibrary(): Promise<Library> {
    const response = await api.get("/library/me");
    return response.data as Library;
}

/** Update library details (all fields optional except id) */
export async function updateLibrary(payload: {
    id: string;
    name?: string;
    address?: string;
    city?: string;
    totalSeats?: number;
    contact?: string;
    templatesJson?: string;
}): Promise<Library> {
    const { id, ...rest } = payload;
    const response = await api.put(`/library/${id}`, rest);
    return response.data as Library;
}
