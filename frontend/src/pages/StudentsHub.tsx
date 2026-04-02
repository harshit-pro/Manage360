import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsNew from "@/pages/StudentsNew";
import StudentsAll from "@/pages/StudentsAll";
import StudentsActive from "@/pages/StudentsActive";
import { UserPlus, Users, UserCheck, Settings2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TAB_VALUES = ["add", "all", "active"] as const;
type StudentTab = (typeof TAB_VALUES)[number];

function isStudentTab(v: string | null): v is StudentTab {
  return v !== null && (TAB_VALUES as readonly string[]).includes(v);
}

/**
 * Single mobile-friendly students area: Add new (default), All, Active.
 * URL: `/students?tab=add|all|active` — default tab is **add** (first-time focus on enrollment).
 */
export default function StudentsHub() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    const raw = searchParams.get("tab");
    return isStudentTab(raw) ? raw : "add";
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "add" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Premium Hub Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" />
            Registry Management
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Student Hub</h1>
          <p className="text-slate-500 font-medium max-w-lg">
            A unified interface for enrollment, monitoring, and lifetime student records.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-full px-4 py-1.5 border-slate-200 bg-white font-bold text-slate-500 shadow-sm">
            <Settings2 className="mr-2 h-3.5 w-3.5" />
            Hub Config
          </Badge>
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })}
        className="w-full space-y-8"
      >
        <div className="flex items-center justify-center lg:justify-start">
          <TabsList className="h-auto w-fit gap-2 rounded-[1.5rem] bg-slate-100/50 p-2 shadow-inner border border-slate-200/50 backdrop-blur-sm">
            {[
              { id: "add", label: "New Enrollment", icon: UserPlus },
              { id: "all", label: "Master List", icon: Users },
              { id: "active", label: "Active Roster", icon: UserCheck }
            ].map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="group relative h-12 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-2xl sm:text-xs"
              >
                <t.icon className="mr-2 h-4 w-4 shrink-0 transition-transform group-active:scale-90" aria-hidden />
                <span className="relative z-10">{t.label}</span>
                {tab === t.id && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="rounded-[3rem] border border-slate-100 bg-slate-50/20 p-2 sm:p-4 lg:p-6 transition-all min-h-[500px]">
          <TabsContent value="add" className="mt-0 outline-none animate-in fade-in slide-in-from-left-4 duration-500">
            <StudentsNew embedded />
          </TabsContent>
          <TabsContent value="all" className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            <StudentsAll embedded />
          </TabsContent>
          <TabsContent value="active" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StudentsActive embedded />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
