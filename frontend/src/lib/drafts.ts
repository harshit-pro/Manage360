// src/lib/drafts.ts
// Local-storage-based draft student management for temporary registrations

const DRAFTS_KEY = "cl.studentDrafts";

export interface StudentDraft {
    id: string;           // UUID-style local ID
    name: string;
    mobileNo?: string;
    seatNo?: string;
    dateOfVisit?: string;  // When they first came to the library
    notes?: string;        // Any internal notes about the student
    createdAt: string;     // ISO timestamp
    updatedAt: string;     // ISO timestamp
}

function generateId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadDrafts(): StudentDraft[] {
    try {
        const raw = localStorage.getItem(DRAFTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveDrafts(drafts: StudentDraft[]): void {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

/** Get all saved drafts, sorted by most recent first */
export function listDrafts(): StudentDraft[] {
    return loadDrafts().sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

/** Get a single draft by ID */
export function getDraft(id: string): StudentDraft | undefined {
    return loadDrafts().find((d) => d.id === id);
}

/** Create a new draft */
export function createDraft(data: Omit<StudentDraft, "id" | "createdAt" | "updatedAt">): StudentDraft {
    const now = new Date().toISOString();
    const draft: StudentDraft = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
    };
    const all = loadDrafts();
    all.push(draft);
    saveDrafts(all);
    return draft;
}

/** Update an existing draft */
export function updateDraft(id: string, updates: Partial<Omit<StudentDraft, "id" | "createdAt">>): StudentDraft | null {
    const all = loadDrafts();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDrafts(all);
    return all[idx];
}

/** Delete a draft (e.g. after completing registration) */
export function deleteDraft(id: string): boolean {
    const all = loadDrafts();
    const filtered = all.filter((d) => d.id !== id);
    if (filtered.length === all.length) return false;
    saveDrafts(filtered);
    return true;
}

/** Get total draft count */
export function draftCount(): number {
    return loadDrafts().length;
}
