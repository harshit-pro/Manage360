// src/lib/dashboard.ts
// API service for dashboard metrics (real backend integration)

import api from "./api";

/** Response from GET /api/metrics/summary */
export interface DashboardSummary {
    totalStudents: number;
    activeStudents: number;
    expiredMemberships: number;
    dueMemberships: number;
    pendingFeesAmount: number;
    totalRevenue: number;
    revenueByMethod: Record<string, number>;
    totalSeats: number;
}

/** Response from GET /api/metrics/estimated-fees */
export interface EstimatedFees {
    estimated: number;
    collected: number;
    remaining: number;
}

/** Single point from GET /api/metrics/revenue-expenses */
export interface RevenueExpensePoint {
    year: number;
    month: number;
    revenue: number;
    expenses: number;
    label: string;
}

/** Fetch dashboard summary KPIs */
export async function fetchDashboardSummary(dueInDays: number = 5): Promise<DashboardSummary> {
    const response = await api.get("/metrics/summary", {
        params: { dueInDays },
    });
    return response.data;
}

/** Fetch estimated vs collected fees */
export async function fetchEstimatedFees(): Promise<EstimatedFees> {
    const response = await api.get("/metrics/estimated-fees");
    return response.data;
}

/** Fetch monthly revenue vs expenses data for the chart */
export async function fetchRevenueExpenses(months: number = 6): Promise<RevenueExpensePoint[]> {
    const response = await api.get("/metrics/revenue-expenses", {
        params: { months },
    });
    return response.data;
}
