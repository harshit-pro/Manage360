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

const data = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 33000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 55000, expenses: 36000 },
  { month: "Jun", revenue: 67000, expenses: 40000 },
];

export function RevenueChart() {
  return (
    <Card className="shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle>Monthly Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
