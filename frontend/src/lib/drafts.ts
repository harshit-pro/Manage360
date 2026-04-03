// src/lib/drafts.ts
// Backend-linked draft student management for temporary registrations

import api from "./api";

export interface StudentDraft {
    id: string;           // UUID from backend
    name: string;
    mobileNo?: string;
    seatNo?: string;
    dateOfVisit?: string;  // When they first came to the library (LocalDate)
    notes?: string;        // Any internal notes about the student
    createdAt: string;     // ISO timestamp
    updatedAt: string;     // ISO timestamp
}

/** Get all saved drafts from backend */
export async function listDrafts(): Promise<StudentDraft[]> {
    const response = await api.get("/drafts");
    return response.data;
}

/** Get a single draft by ID from backend */
export async function getDraft(id: string): Promise<StudentDraft> {
    const response = await api.get(`/drafts/${id}`);
    return response.data;
}

/** Create a new draft on backend */
export async function createDraft(data: Omit<StudentDraft, "id" | "createdAt" | "updatedAt">): Promise<StudentDraft> {
    const response = await api.post("/drafts", data);
    return response.data;
}

/** Update an existing draft on backend */
export async function updateDraft(id: string, updates: Partial<Omit<StudentDraft, "id" | "createdAt">>): Promise<StudentDraft> {
    const response = await api.put(`/drafts/${id}`, updates);
    return response.data;
}

/** Delete a draft on backend */
export async function deleteDraft(id: string): Promise<void> {
    await api.delete(`/drafts/${id}`);
}

/** Get total draft count (optimistic local or separate query) */
export async function draftCount(): Promise<number> {
    const drafts = await listDrafts();
    return drafts.length;
}
