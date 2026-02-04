import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function CalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border pointer-events-auto"
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Fee Renewals</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Seat Availability</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
