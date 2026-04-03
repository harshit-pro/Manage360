// src/lib/students.ts
// API service for student management (real backend integration)

import api from "./api";
import { addMonths } from "date-fns";

/** Metadata for a student used in demo data/persistence */
export interface StudentMeta {
    guardianName?: string;
    isEnrolled?: boolean;
    seasonalFees?: number;
    feesDeposited?: number;
    currentValidityMonths?: number; // Critical for enforcing user-requested validity logic
}

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
    meta?: StudentMeta;       // Client-side metadata
}

const STUDENT_META_KEY = "cl.studentMeta";

/** Ensure metadata exists for a given student and return it */
export function ensureMeta(studentId: string, index: number = 0): StudentMeta {
    const allMeta: Record<string, StudentMeta> = JSON.parse(localStorage.getItem(STUDENT_META_KEY) || "{}");
    if (!allMeta[studentId]) {
        allMeta[studentId] = {};
    }
    const meta = allMeta[studentId];
    if (index !== undefined && !meta.guardianName) {
        meta.guardianName = `Guardian-${index}`;
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

/** Normalize raw backend response: flatten membership fields for easy component access.
 *  Enforces consistent validity based on the 'current payment' span stored in metadata. */
function normalizeStudent(raw: any): Student {
    const m = raw.membership;
    let activeUntil: string | undefined = m?.activeUntil ?? raw.activeUntil;

    // Fetch client-side metadata to check for manual validity overrides and cumulative fees
    const meta = ensureMeta(raw.id);
    const doj: string | undefined = raw.dateOfJoining;

    // RULE: If we have an explicit validity span in metadata (from a fresh payment/re-admission),
    // we use it to calculate the expiry strictly from the Joining Date.
    if (doj && meta.currentValidityMonths && meta.currentValidityMonths > 0) {
        try {
            const [jy, jm, jd] = doj.slice(0, 10).split("-").map(Number);
            const joining = new Date(jy, jm - 1, jd);
            const derivedExpiry = addMonths(joining, meta.currentValidityMonths);
            const pad = (n: number) => String(n).padStart(2, "0");
            activeUntil = `${derivedExpiry.getFullYear()}-${pad(derivedExpiry.getMonth() + 1)}-${pad(derivedExpiry.getDate())}T00:00:00`;
        } catch { }
    }

    // AGGREGATE FEES: If metadata has a cumulative feesDeposited, it overrides the backend's (potentially static) value.
    // We treat the backend's value as a 'base' if metadata is empty.
    const feesDeposited = (meta.feesDeposited && meta.feesDeposited > 0) 
        ? meta.feesDeposited 
        : (raw.feesDeposited || 0);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateExpired = activeUntil ? new Date(activeUntil) < todayStart : true;
    const backendSaysExpired = m ? m.status === "EXPIRED" : raw.isExpired;

    return { ...raw, activeUntil, feesDeposited, isExpired: backendSaysExpired || dateExpired, membership: m, meta };
}

/** Fetch a single student by ID */
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

/** Update student details */
export async function updateStudent(studentId: string, payload: any): Promise<Student> {
    await api.put(`/students/${studentId}`, payload);
    return await getStudent(studentId);
}

/** Renew membership for a student */
export async function renewMembership(studentId: string, payload: any): Promise<Student> {
    await api.post(`/memberships/${studentId}/renew`, payload);
    return await getStudent(studentId);
}

/** Utility to derive months from deposit */
export function membershipMonthsFromDeposit(seasonal: number, deposit: number): number | null {
    if (seasonal < 1 || deposit < seasonal) return null;
    if (deposit % seasonal !== 0) return null;
    return deposit / seasonal;
}

/** Record payment for seasonal fees */
export async function paySeasonalFee(payload: {
    studentId: string;
    amount: number;
    paymentMethod: "CASH" | "UPI" | "CARD";
}): Promise<void> {
    await api.post(`/students/${payload.studentId}/pay-seasonal-fee`, payload);
}

/** View type combining student data with its metadata */
export type StudentView = Student & { meta?: StudentMeta };

/** Simple client‑side search over all students */
export async function searchStudents(query: string): Promise<Student[]> {
    const all = await listAllStudents();
    const lower = query.toLowerCase();
    return all.filter((s) => s.name.toLowerCase().includes(lower) || s.id.toLowerCase().includes(lower));
}

/** Generate next registration number */
export async function nextRegNo(): Promise<string> {
    const all = await listAllStudents();
    const max = all.reduce((m, s) => {
        const numMatch = (s.regNo || "").match(/(\d+)$/);
        return numMatch ? Math.max(m, parseInt(numMatch[1])) : m;
    }, 0);
    const lastWithPrefix = all.find(s => s.regNo && /^[A-Za-z]/.test(s.regNo));
    const prefix = lastWithPrefix?.regNo?.match(/^([A-Za-z]+)/)?.[1] || "NL";
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

/** Generate next student code (e.g., S001) */
export async function nextStudentCode(): Promise<string> {
    const all = await listAllStudents();
    const max = all.reduce((max, s) => {
        const match = s.id.match(/S(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `S${String(max + 1).padStart(3, "0")}`;
}

export const listStudents = listAllStudents;
