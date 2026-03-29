import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createExpense } from "@/lib/expenses";
import { toast } from "@/components/ui/use-toast";
import { DollarSign } from "lucide-react";

const todayIso = () => new Date().toISOString().slice(0, 10);

const Expenses = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [spentAt, setSpentAt] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);

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
        description: "Your expense has been saved and will reflect on the dashboard chart.",
      });
      setAmount("");
      setCategory("");
      setNote("");
      setSpentAt(todayIso());
    } catch (err: any) {
      console.error("Failed to create expense", err);
      toast({
        variant: "destructive",
        title: "Failed to save expense",
        description:
          err?.response?.data?.message || err?.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1 border-b border-border/60 pb-4 md:pb-6">
        <div className="flex items-center gap-2 text-primary">
          <DollarSign className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-widest">
            Finance
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Record Expense
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Add operational expenses here. They will be included in the revenue vs expenses chart on the dashboard.
        </p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Rent, Electricity, Internet"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={spentAt}
                onChange={(e) => setSpentAt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Short description, invoice reference, etc."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving..." : "Save Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;

