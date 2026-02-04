import { isAuthenticated } from "@/lib/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
    const location = useLocation();
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
}
