// src/lib/students.ts
// API service for student management (real backend integration)

import api from "./api";

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

/** Normalize raw backend response: flatten membership fields for easy component access */
function normalizeStudent(raw: any): Student {
    const m = raw.membership;
    const activeUntil: string | undefined = m?.activeUntil ?? raw.activeUntil;
    const isExpired: boolean = m
        ? m.status === "EXPIRED"
        : raw.isExpired ?? (activeUntil ? new Date(activeUntil) < new Date() : true);
    return { ...raw, activeUntil, isExpired, membership: m };
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

/** Update student details (partial update) */
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
    const response = await api.put(`/students/${studentId}`, payload);
    return normalizeStudent(response.data);
}

/** Renew membership for a student */
export async function renewMembership(studentId: string, payload: {
    months: number;
    amount: number;
    method: "CASH" | "UPI" | "CARD";
    note?: string;
}): Promise<void> {
    await api.post(`/memberships/${studentId}/renew`, payload);
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

/** Generate next registration number (simple increment) */
export async function nextRegNo(): Promise<string> {
    const all = await listAllStudents();
    const safeAll = Array.isArray(all) ? all : [];
    const max = safeAll.reduce((max, s) => Math.max(max, parseInt(s.regNo) || 0), 0);
    return String(max + 1).padStart(4, " 0");
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
