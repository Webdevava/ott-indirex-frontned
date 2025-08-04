"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
import { DeviceService } from "@/services/device.service";
import { DashboardStats } from "@/components/modules/dashboard/dashboard-stats";
import { DashboardRoutesCard } from "@/components/modules/dashboard/dashboard-routes-card";
import { Separator } from "@/components/ui/separator";

interface DashboardStatsData {
  totalActiveDevices: number;
  totalAnnotators: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalActiveDevices: 0,
    totalAnnotators: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [devicesResponse, usersResponse] = await Promise.all([
          DeviceService.getAllDevices({ isActive: true, limit: 1000 }),
          AuthService.getAllUsers({ role: "ANNOTATOR", limit: 1000 }),
        ]);

        let totalActiveDevices = 0;
        let totalAnnotators = 0;

        if (devicesResponse.success && devicesResponse.data) {
          totalActiveDevices = devicesResponse.data.total || 0;
        } else {
          toast.error(devicesResponse.message || "Failed to fetch devices");
        }

        if (usersResponse.success && usersResponse.data) {
          totalAnnotators = usersResponse.data.total || 0;
        } else {
          toast.error(usersResponse.message || "Failed to fetch annotators");
        }

        setStats({ totalActiveDevices, totalAnnotators });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Separator />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <DashboardStats
            totalActiveDevices={stats.totalActiveDevices}
            totalAnnotators={stats.totalAnnotators}
          />
          <DashboardRoutesCard />
        </div>
      )}
    </div>
  );
}
