import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentsNew from "@/pages/StudentsNew";
import StudentsAll from "@/pages/StudentsAll";
import StudentsActive from "@/pages/StudentsActive";
import { UserPlus, Users, UserCheck } from "lucide-react";

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
    <div className="min-w-0 max-w-full overflow-x-hidden md:-mx-0">
      <header className="mb-4 space-y-1 border-b border-border/60 pb-4 md:mb-6 md:pb-5">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Students</h1>
        <p className="text-sm text-muted-foreground">
          Add members or browse everyone — optimized for touch.
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })}
        className="w-full min-w-0"
      >
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-muted/80 p-1.5 shadow-sm">
          <TabsTrigger
            value="add"
            className="touch-manipulation rounded-lg py-3 text-xs font-semibold data-[state=active]:shadow-sm sm:text-sm"
          >
            <UserPlus className="mr-1.5 hidden h-4 w-4 sm:inline" aria-hidden />
            Add new
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="touch-manipulation rounded-lg py-3 text-xs font-semibold data-[state=active]:shadow-sm sm:text-sm"
          >
            <Users className="mr-1.5 hidden h-4 w-4 sm:inline" aria-hidden />
            All
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="touch-manipulation rounded-lg py-3 text-xs font-semibold data-[state=active]:shadow-sm sm:text-sm"
          >
            <UserCheck className="mr-1.5 hidden h-4 w-4 sm:inline" aria-hidden />
            Active
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-4 min-w-0 outline-none md:mt-6">
          <StudentsNew embedded />
        </TabsContent>
        <TabsContent value="all" className="mt-4 min-w-0 outline-none md:mt-6">
          <StudentsAll embedded />
        </TabsContent>
        <TabsContent value="active" className="mt-4 min-w-0 outline-none md:mt-6">
          <StudentsActive embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
