import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: "primary" | "secondary" | "accent" | "success";
}

export function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  // Tailwind cannot detect dynamically constructed class names like
  // `bg-gradient-${gradient}`, so map to explicit strings to ensure
  // the classes are included in the build.
  const gradientClass =
    {
      primary: "bg-gradient-primary",
      secondary: "bg-gradient-secondary",
      accent: "bg-gradient-accent",
      success: "bg-gradient-success",
    }[gradient] || "bg-gradient-primary";

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow animate-scale-in">
      {/* Gradient background layer */}
      <div className={`absolute inset-0 ${gradientClass} opacity-90`} />
      <CardContent className="relative p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
