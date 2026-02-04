import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Props = { estimated?: number; collected?: number };

export function FeeEstimationPanel({ estimated, collected }: Props) {
  const est = Math.max(0, estimated ?? 125000);
  const col = Math.max(0, Math.min(est, collected ?? 89000));
  const remaining = Math.max(0, est - col);
  const percentage = est > 0 ? (col / est) * 100 : 0;

  return (
    <Card className="shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Estimated Fee This Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Estimated</span>
            <span className="font-semibold">₹{est.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collected</span>
            <span className="font-semibold text-success">₹{col.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-semibold text-destructive">₹{remaining.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {percentage.toFixed(1)}% collected
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
