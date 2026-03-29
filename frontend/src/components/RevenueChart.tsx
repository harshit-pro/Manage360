import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type RevenueChartPoint = {
  month: string;
  revenue: number;
  expenses: number;
};

interface RevenueChartProps {
  data: RevenueChartPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data && data.length > 0;

  const chartData = hasData
    ? data
    : [{ month: "No data", revenue: 0, expenses: 0 }];

  return (
    <Card className="shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle>Monthly Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData && (
          <p className="mb-2 text-xs text-muted-foreground">
            No revenue/expense records yet. Add expenses and record payments to
            see this chart.
          </p>
        )}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--destructive))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
