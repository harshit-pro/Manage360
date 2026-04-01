import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  Plus,
  History,
  TrendingDown,
  Calendar,
  Tag,
  FileText,
  Loader2,
  Trash2,
  ChevronRight,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createExpense, fetchExpenses, type Expense } from "@/lib/expenses";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const todayIso = () => new Date().toISOString().slice(0, 10);

const inr = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Expenses = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [spentAt, setSpentAt] = useState(todayIso());
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err: any) {
      console.error("Failed to load expenses", err);
      toast({
        variant: "destructive",
        title: "Failed to load history",
        description: "Could not retrieve your recent expenses.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid expense amount.",
      });
      return;
    }
    if (!category.trim()) {
      toast({
        variant: "destructive",
        title: "Category required",
        description: "Please enter a category for this expense.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createExpense({
        amount: numericAmount,
        category: category.trim(),
        note: note.trim() || undefined,
        spentAt,
      });
      toast({
        title: "Expense recorded",
        description: "Your expense has been saved successfully.",
      });
      setAmount("");
      setCategory("");
      setNote("");
      setSpentAt(todayIso());
      loadExpenses();
    } catch (err: any) {
      console.error("Failed to create expense", err);
      toast({
        variant: "destructive",
        title: "Failed to save expense",
        description: err?.response?.data?.message || err?.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* --- Derived Stats --- */
  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return expenses
      .filter((e) => {
        const d = new Date(e.spentAt);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const topCategory = useMemo(() => {
    if (expenses.length === 0) return "N/A";
    const counts: Record<string, number> = {};
    expenses.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + e.amount;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [expenses]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* --- HERO HEADER --- */}
      <header className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/10 via-background to-accent/30 p-6 md:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
        
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <div className="rounded-lg bg-primary/20 p-2">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Expense Management</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Finance Tracker
            </h1>
            <p className="max-w-md text-sm text-muted-foreground md:text-base">
              Monitor your operational costs and stay on top of your budget with ease.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">This Month</p>
              <p className="mt-1 text-xl font-bold text-primary">{inr(currentMonthTotal)}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Top Category</p>
              <p className="mt-1 truncate text-xl font-bold text-foreground">{topCategory}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* --- RECORD FORM COLUMN --- */}
        <div className="lg:col-span-5">
          <Card className="sticky top-6 overflow-hidden border-border/40 shadow-xl shadow-primary/5">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                New Expense
              </CardTitle>
              <CardDescription>Fill in the details to record a new payment.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Amount (₹)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        min={1}
                        step={1}
                        value={amount}
                        className="h-12 border-border/80 pl-10 text-lg font-semibold transition-all focus:ring-primary/20"
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Category
                      </Label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="category"
                          value={category}
                          className="h-11 border-border/80 pl-10"
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Rent, Bills..."
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Date
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          className="h-11 border-border/80 pl-10"
                          value={spentAt}
                          onChange={(e) => setSpentAt(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Note (Optional)
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="note"
                        value={note}
                        className="min-h-[100px] border-border/80 pl-10 pt-2.5 transition-all focus:ring-primary/20"
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add some details about this expense..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="group h-12 w-full rounded-xl bg-primary text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  )}
                  {submitting ? "Processing..." : "Save Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* --- RECENT HISTORY COLUMN --- */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between px-2">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <History className="h-5 w-5 text-muted-foreground" />
              Recent History
            </h2>
            <Badge variant="secondary" className="rounded-full px-3 py-1 font-semibold">
              {expenses.length} Records
            </Badge>
          </div>

          <div className="mt-4 space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i} className="border-border/40 bg-card/40 backdrop-blur-sm">
                  <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </CardContent>
                </Card>
              ))
            ) : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 py-20 text-center">
                <div className="mb-4 rounded-full bg-muted/40 p-6">
                  <TrendingDown className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No Expenses Yet</h3>
                <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                  When you record expenses, they will appear here as a chronological history.
                </p>
              </div>
            ) : (
              expenses.map((expense) => (
                <Card 
                  key={expense.id} 
                  className="group border-border/40 bg-card/60 transition-all duration-300 hover:border-primary/20 hover:bg-card hover:shadow-md md:hover:-translate-y-0.5"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <DollarSign className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {expense.category}
                          </h3>
                          <p className="text-base font-extrabold text-foreground">{inr(expense.amount)}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(expense.spentAt)}
                          </span>
                          {expense.note && (
                            <span className="flex items-center gap-1 italic">
                              <FileText className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[150px] sm:max-w-[250px]">{expense.note}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:block">
                         <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
