// src/pages/Index.tsx
// Dashboard page – fetches data from backend and displays KPI cards.

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/RevenueChart";
import { FeeEstimationPanel } from "@/components/FeeEstimationPanel";
import { CalendarWidget } from "@/components/CalendarWidget";
import { SeatMapGrid } from "@/components/SeatMapGrid";
import { Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { listAllStudents, listActiveStudents } from "@/lib/students";
import { seedDemoData } from "@/lib/demoData";
import { currentUser, getLibraryName } from '@/lib/auth';

const Index = () => {
  // KPI state
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [collectedFee, setCollectedFee] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ensure demo data exists (for the chart demo)
  useEffect(() => {
    seedDemoData();
  }, []);

  // Fetch data from backend once component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await listAllStudents();
        const active = await listActiveStudents();

        const total = Array.isArray(all) ? all.length : 0;
        const activeCnt = Array.isArray(active) ? active.length : 0;
        const expired = Array.isArray(all) ? all.filter((s) => s.isExpired).length : 0;

        // Revenue calculation – read from localStorage demo data
        const memberships = JSON.parse(localStorage.getItem("cl.memberships") || "[]") as Array<{
          lastPayment?: { amount?: number };
        }>;
        const revenue = memberships.reduce((sum, m) => sum + (m.lastPayment?.amount || 0), 0);
        const profit = Math.round(revenue * 0.25);

        // Fee estimation based on enrolled students
        const enrolled = Array.isArray(all) ? all.filter((s) => s.isEnrolled !== false) : [];
        const estFee = enrolled.reduce((sum, s) => sum + (s.seasonalFees ?? 0), 0);
        const collFee = enrolled.reduce((sum, s) => sum + (s.feesDeposited ?? 0), 0);
        const pending = Math.max(0, estFee - collFee);

        // Update state
        setTotalStudents(total);
        setActiveStudents(activeCnt);
        setExpiredCount(expired);
        setTotalRevenue(revenue);
        setTotalProfit(profit);
        setEstimatedFee(estFee);
        setCollectedFee(collFee);
        setPendingAmount(pending);

      } catch (e) {
        console.error("Dashboard data fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading dashboard…</div>
      </DashboardLayout>
    );
  }

  return (
    
    <DashboardLayout>
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
          <StatCard title="Total Profit (demo)" value={inr(totalProfit)} icon={TrendingUp} gradient="success" />
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
        <SeatMapGrid />
      </div>
    </DashboardLayout>
  );
};

export default Index;
