// src/pages/Index.tsx
// Dashboard page – fetches KPI data from backend metrics API.

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/RevenueChart";
import { FeeEstimationPanel } from "@/components/FeeEstimationPanel";
import { CalendarWidget } from "@/components/CalendarWidget";
import { SeatMapGrid } from "@/components/SeatMapGrid";
import { Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import {
  fetchDashboardSummary,
  fetchEstimatedFees,
  type DashboardSummary,
  type EstimatedFees,
} from "@/lib/dashboard";

const Index = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [fees, setFees] = useState<EstimatedFees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend metrics API once component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [summaryData, feesData] = await Promise.all([
          fetchDashboardSummary(),
          fetchEstimatedFees(),
        ]);
        setSummary(summaryData);
        setFees(feesData);
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
    return <div className="flex items-center justify-center h-64">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            Promise.all([fetchDashboardSummary(), fetchEstimatedFees()])
              .then(([s, f]) => {
                setSummary(s);
                setFees(f);
              })
              .catch((e) =>
                setError(
                  e?.response?.data?.message ||
                  e?.message ||
                  "Failed to load dashboard data."
                )
              )
              .finally(() => setLoading(false));
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Retry
        </button>
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Student Enrolled" value={totalStudents} icon={Users} gradient="primary" />
        <StatCard title="Total Active Students" value={activeStudents} icon={Users} gradient="secondary" />
        <StatCard title="Total Revenue" value={inr(totalRevenue)} icon={DollarSign} gradient="accent" />
        <StatCard title="Pending Fees" value={inr(pendingAmount)} icon={AlertCircle} gradient="success" />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Expired Memberships" value={expiredCount} icon={AlertCircle} gradient="accent" />
        <StatCard title="Total Collections" value={inr(totalRevenue)} icon={TrendingUp} gradient="success" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="space-y-6">
          <FeeEstimationPanel estimated={estimatedFee} collected={collectedFee} />
          <CalendarWidget />
        </div>
      </div>

      {/* Seat Map */}
      <SeatMapGrid totalSeats={totalSeats} />
    </div>
  );
};

export default Index;
