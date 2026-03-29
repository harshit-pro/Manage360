// src/pages/Index.tsx
// Dashboard page – fetches KPI data from backend metrics API.

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/RevenueChart";
import { FeeEstimationPanel } from "@/components/FeeEstimationPanel";
import { SeatMapGrid } from "@/components/SeatMapGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, AlertCircle, LayoutDashboard } from "lucide-react";
import {
  fetchDashboardSummary,
  fetchEstimatedFees,
  fetchRevenueExpenses,
  type DashboardSummary,
  type EstimatedFees,
} from "@/lib/dashboard";

type RevenueChartPoint = {
  month: string;
  revenue: number;
  expenses: number;
};

const Index = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [fees, setFees] = useState<EstimatedFees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueExpenses, setRevenueExpenses] = useState<RevenueChartPoint[]>([]);

  // Fetch data from backend metrics API once component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [summaryData, feesData, revenueExpensesData] = await Promise.all([
          fetchDashboardSummary(),
          fetchEstimatedFees(),
          fetchRevenueExpenses(6),
        ]);
        setSummary(summaryData);
        setFees(feesData);
        setRevenueExpenses(
          revenueExpensesData.map((p) => ({
            month: p.label,
            revenue: p.revenue,
            expenses: p.expenses,
          })),
        );
      } catch (e: any) {
        console.error("Dashboard data fetch error:", e);
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load dashboard data. Please check your connection.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 max-w-full rounded-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl md:h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <p className="max-w-md text-sm font-medium text-destructive">{error}</p>
        <Button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            Promise.all([fetchDashboardSummary(), fetchEstimatedFees(), fetchRevenueExpenses(6)])
              .then(([s, f, re]) => {
                setSummary(s);
                setFees(f);
                setRevenueExpenses(
                  re.map((p) => ({
                    month: p.label,
                    revenue: p.revenue,
                    expenses: p.expenses,
                  })),
                );
              })
              .catch((e) =>
                setError(
                  e?.response?.data?.message || e?.message || "Failed to load dashboard data.",
                ),
              )
              .finally(() => setLoading(false));
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const totalStudents = summary?.totalStudents ?? 0;
  const activeStudents = summary?.activeStudents ?? 0;
  const expiredCount = summary?.expiredMemberships ?? 0;
  const totalRevenue = summary?.totalRevenue ?? 0;
  const pendingAmount = summary?.pendingFeesAmount ?? 0;
  const totalSeats = summary?.totalSeats ?? 0;

  const estimatedFee = fees?.estimated ?? 0;
  const collectedFee = fees?.collected ?? 0;

  return (
    <div className="space-y-8">
      <header className="space-y-1 border-b border-border/60 pb-4 md:pb-6">
        <div className="flex items-center gap-2 text-primary">
          <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-widest">Overview</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Dashboard</h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Enrollment, revenue, and seat status at a glance — optimized for quick checks on mobile.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Student Enrolled" value={totalStudents} icon={Users} gradient="primary" />
        <StatCard title="Total Active Students" value={activeStudents} icon={Users} gradient="secondary" />
        <StatCard title="Total Revenue" value={inr(totalRevenue)} icon={DollarSign} gradient="accent" />
        <StatCard title="Pending Fees" value={inr(pendingAmount)} icon={AlertCircle} gradient="success" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Expired Memberships" value={expiredCount} icon={AlertCircle} gradient="accent" />
        <StatCard title="Total Collections" value={inr(totalRevenue)} icon={TrendingUp} gradient="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueExpenses} />
        </div>
        <div className="space-y-6">
          <FeeEstimationPanel estimated={estimatedFee} collected={collectedFee} />
        </div>
      </div>

      <SeatMapGrid totalSeats={totalSeats} />
    </div>
  );
};

export default Index;
