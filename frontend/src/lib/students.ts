// src/lib/students.ts
// API service for student management (real backend integration)

import api from "./api";
import { addMonths } from "date-fns";

export interface Student {
    id: string;
    regNo: string;
    name: string;
    seatNo: string;
    mobileNo: string;
    isEnrolled: boolean;
    isExpired: boolean;       // derived: membership.status === "EXPIRED"
    seasonalFees: number;
    feesDeposited: number;
    activeUntil?: string;     // flattened from membership.activeUntil
    address?: string;
    aadharNo?: string;
    guardianName?: string;
    guardianMobile?: string;
    gender?: string;
    dateOfJoining?: string;
    userId?: string;
    membershipMonths?: number;
    membership?: {
        activeUntil?: string;
        status?: string;         // "ACTIVE" | "EXPIRED" | "PENDING"
        lastPaymentMethod?: string;
    };
}

/** Normalize raw backend response: flatten membership fields for easy component access.
 *  Re-anchors activeUntil to dateOfJoining so the expiry always falls on the
 *  same day-of-month as the joining date (consistent monthly cycle). */
function normalizeStudent(raw: any): Student {
    const m = raw.membership;
    let activeUntil: string | undefined = m?.activeUntil ?? raw.activeUntil;

    // Re-anchor activeUntil to the student's dateOfJoining.
    // The backend may calculate the expiry from "now" instead of from the joining date,
    // resulting in a 1-day (or more) offset. We derive the intended whole-month duration
    // and recompute from dateOfJoining.
    const doj: string | undefined = raw.dateOfJoining;
    if (activeUntil && doj) {
        try {
            // Parse date-only parts as local dates to avoid timezone day-shifts
            const [jy, jm, jd] = doj.slice(0, 10).split("-").map(Number);
            const joining = new Date(jy, jm - 1, jd);

            const [ey, em, ed] = activeUntil.slice(0, 10).split("-").map(Number);
            const expiry = new Date(ey, em - 1, ed);

            // Derive whole-month count (mirroring ChronoUnit.MONTHS.between)
            let months = (ey - jy) * 12 + (em - jm);
            if (ed < jd) months = Math.max(months - 1, 0);
            if (months <= 0 && expiry > joining) months = 1;

            if (months > 0) {
                // addMonths handles end-of-month correctly (Jan 31 + 1 → Feb 28)
                const corrected = addMonths(joining, months);
                // Store as local ISO string (no "Z") so format() displays the right day
                const pad = (n: number) => String(n).padStart(2, "0");
                activeUntil = `${corrected.getFullYear()}-${pad(corrected.getMonth() + 1)}-${pad(corrected.getDate())}T00:00:00`;
            }
        } catch {
            // keep original on parse failure
        }
    }

    // Determine expiry: always cross-check activeUntil date against today,
    // because the backend's membership.status can be stale ("ACTIVE" even after the date passed).
    const now = new Date();
    // Strip time from "now" so a membership expiring today (midnight) is still considered active for the day
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateExpired = activeUntil ? new Date(activeUntil) < todayStart : true;
    const backendSaysExpired = m ? m.status === "EXPIRED" : raw.isExpired;

    // Expired if EITHER the backend says so OR the activeUntil date has passed
    const isExpired: boolean = backendSaysExpired || dateExpired;
    return { ...raw, activeUntil, isExpired, membership: m };
}

/** Fetch a single student by ID (with fresh membership state) */
export async function getStudent(studentId: string): Promise<Student> {
    const response = await api.get(`/students/${studentId}`);
    return normalizeStudent(response.data);
}

/** Fetch all students (paginated) */
export async function listAllStudents(params?: {
    q?: string;
    page?: number;
    size?: number;
}): Promise<Student[]> {
    const response = await api.get("/students", { params });
    const data = response.data.content ?? response.data;
    return Array.isArray(data) ? data.map(normalizeStudent) : [];
}

/** Fetch active (enrolled) students */
export async function listActiveStudents(params?: {
    q?: string;
    page?: number;
    size?: number;
}): Promise<Student[]> {
    const response = await api.get("/students", { params: { ...params, isEnrolled: true } });
    const data = response.data.content ?? response.data;
    return Array.isArray(data) ? data.map(normalizeStudent) : [];
}

/** Create a new student */
export async function createStudent(payload: {
    name: string;
    seatNo: string;
    mobileNo?: string;
    address?: string;
    aadharNo?: string;
    guardianName?: string;
    guardianMobile?: string;
    gender: string;
    seasonalFees: number;
    feesDeposited?: number;
    dateOfJoining: string;
}): Promise<Student> {
    const response = await api.post("/students", payload);
    return normalizeStudent(response.data);
}

/** Toggle enrollment status */
export async function toggleEnrollment(studentId: string, enroll: boolean): Promise<void> {
    await api.patch(`/students/${studentId}/enrollment?isEnrolled=${enroll}`);
}

/** Update student details (partial update).
 *  Re-fetches the student after saving to ensure the response includes
 *  the recalculated membership state (activeUntil / status). */
export async function updateStudent(studentId: string, payload: {
    name?: string;
    seatNo?: string;
    mobileNo?: string;
    address?: string;
    aadharNo?: string;
    guardianName?: string;
    guardianMobile?: string;
    gender?: string;
    dateOfJoining?: string;
    seasonalFees?: number;
}): Promise<Student> {
    await api.put(`/students/${studentId}`, payload);
    // Explicitly re-fetch to pick up the recalculated membership / activeUntil
    const fresh = await getStudent(studentId);
    return fresh;
}

/** Renew membership for a student.
 *  Passes dateOfJoining so the backend can anchor the new expiry to the
 *  student's joining-date cycle when the membership is expired. */
export async function renewMembership(studentId: string, payload: {
    months: number;
    amount: number;
    method: "CASH" | "UPI" | "CARD";
    note?: string;
    dateOfJoining?: string;
}): Promise<Student> {
    await api.post(`/memberships/${studentId}/renew`, payload);
    // Re-fetch to return the student with updated membership state
    const fresh = await getStudent(studentId);
    return fresh;
}

/** Pay seasonal fees */
export async function paySeasonalFee(payload: {
    studentId: string;
    amount: number;
    paymentMethod: "CASH" | "UPI" | "CARD";
    note?: string;
    referenceId?: string;
}): Promise<void> {
    const data = { ...payload, method: payload.paymentMethod };
    await api.post(`/payments/seasonal`, data);
}

// ====================
// Additional student helpers used by the UI
// ====================

/** Metadata for a student used in demo data */
export interface StudentMeta {
    guardianName?: string;
    isEnrolled?: boolean;
    seasonalFees?: number;
    feesDeposited?: number;
    // add other fields as needed
}

const STUDENT_META_KEY = "cl.studentMeta";

/** Ensure metadata exists for a given student and return it */
export function ensureMeta(studentId: string, index: number = 0): StudentMeta {
    const allMeta: Record<string, StudentMeta> = JSON.parse(localStorage.getItem(STUDENT_META_KEY) || "{}");
    if (!allMeta[studentId]) {
        allMeta[studentId] = {};
    }
    const meta = allMeta[studentId];
    // optionally pre‑populate some defaults based on index
    if (index !== undefined) {
        meta.guardianName = meta.guardianName ?? `Guardian-${index}`;
    }
    localStorage.setItem(STUDENT_META_KEY, JSON.stringify(allMeta));
    return meta;
}

/** Set or update metadata for a student */
export function setStudentMeta(studentId: string, updates: Partial<StudentMeta>) {
    const allMeta: Record<string, StudentMeta> = JSON.parse(localStorage.getItem(STUDENT_META_KEY) || "{}");
    const existing = allMeta[studentId] || {};
    allMeta[studentId] = { ...existing, ...updates };
    localStorage.setItem(STUDENT_META_KEY, JSON.stringify(allMeta));
}

/** Alias for listing all students (used by UI) */
export const listStudents = listAllStudents;

/** Simple client‑side search over all students */
export async function searchStudents(query: string): Promise<Student[]> {
    const all = await listAllStudents();
    if (!Array.isArray(all)) return [];
    const lower = query.toLowerCase();
    return all.filter((s) => s.name.toLowerCase().includes(lower) || s.id.toLowerCase().includes(lower));
}

/** View type combining student data with its metadata */
export type StudentView = Student & { meta?: StudentMeta };

/** Generate next registration number (simple increment, 3-digit numeric part) */
export async function nextRegNo(): Promise<string> {
    const all = await listAllStudents();
    const safeAll = Array.isArray(all) ? all : [];
    // Extract numeric suffix from regNo (e.g. "NL007" → 7, "0012" → 12)
    const max = safeAll.reduce((m, s) => {
        const numMatch = (s.regNo || "").match(/(\d+)$/);
        return numMatch ? Math.max(m, parseInt(numMatch[1], 10)) : m;
    }, 0);
    // Extract the alphabetic prefix from the last regNo (e.g. "NL" from "NL007")
    const lastWithPrefix = safeAll.find(s => s.regNo && /^[A-Za-z]/.test(s.regNo));
    const prefix = lastWithPrefix?.regNo?.match(/^([A-Za-z]+)/)?.[1] || "";
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

/** Generate next student code (e.g., S001) */
export async function nextStudentCode(): Promise<string> {
    const all = await listAllStudents();
    const safeAll = Array.isArray(all) ? all : [];
    const max = safeAll.reduce((max, s) => {
        const match = s.id.match(/S(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `S${String(max + 1).padStart(3, "0")}`;
}
