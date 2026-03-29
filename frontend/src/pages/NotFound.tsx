import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-svh min-h-[100dvh] flex-col items-center justify-center bg-background px-4 safe-pb safe-pt">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <FileQuestion className="h-8 w-8 text-muted-foreground" aria-hidden />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">404</h1>
        <p className="mt-3 text-lg font-medium text-muted-foreground">This page does not exist.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check the URL or return to your dashboard.
        </p>
        <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
