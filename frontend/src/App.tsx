import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RenewMembership from "./pages/RenewMembership";
import StudentsAll from "./pages/StudentsAll";
import StudentsActive from "./pages/StudentsActive";
import StudentsNew from "./pages/StudentsNew";
import PendingFees from "./pages/PendingFees";
import NotFound from "./pages/NotFound";

// Layout & auth
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes — no sidebar */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — all share the same DashboardLayout (sidebar + navbar) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/renew" element={<RenewMembership />} />
              <Route path="/students" element={<StudentsAll />} />
              <Route path="/students/active" element={<StudentsActive />} />
              <Route path="/students/new" element={<StudentsNew />} />
              <Route path="/revenue/pending" element={<PendingFees />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
