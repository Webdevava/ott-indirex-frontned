import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Users } from "lucide-react";

interface DashboardStatsProps {
  totalActiveDevices: number;
  totalAnnotators: number;
}

export function DashboardStats({ totalActiveDevices, totalAnnotators }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Active Devices</CardTitle>
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActiveDevices}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Annotators</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAnnotators}</div>
        </CardContent>
      </Card>
    </div>
  );
}