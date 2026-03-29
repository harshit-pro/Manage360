import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: "primary" | "secondary" | "accent" | "success";
}

export function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  const accent = {
    primary: "bg-primary/10 text-primary ring-1 ring-primary/15",
    secondary: "bg-slate-500/10 text-slate-700 dark:text-slate-200 ring-1 ring-slate-500/15",
    accent: "bg-amber-500/10 text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/20",
    success: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500/20",
  }[gradient];

  const bar = {
    primary: "bg-primary",
    secondary: "bg-slate-500",
    accent: "bg-amber-500",
    success: "bg-emerald-500",
  }[gradient];

  return (
    <Card className="group relative overflow-hidden border-border/70 shadow-md transition-shadow hover:shadow-lg">
      <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-xl", bar)} aria-hidden />
      <CardContent className="p-4 md:p-5 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl">{value}</p>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 md:h-12 md:w-12",
              accent,
            )}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
