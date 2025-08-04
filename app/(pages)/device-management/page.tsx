"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DeviceService,
  Device,
  DevicesListResponse,
} from "@/services/device.service";
import { DeviceTable } from "@/components/modules/device-management/device-table";
import { AddDeviceDialog } from "@/components/modules/device-management/add-device-dialog";
import { Separator } from "@/components/ui/separator";

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchDevices = async (
    page = 1,
    search = searchTerm,
    isActive = activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE"
  ) => {
    setLoading(true);
    try {
      const response: DevicesListResponse = await DeviceService.getAllDevices({
        page,
        limit: 10,
        isActive: isActive,
      });

      if (response.success && response.data) {
        setDevices(response.data.devices);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      } else {
        toast.error(response.message || "Failed to fetch devices");
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch devices"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps intentional: Initial fetch only, updates handled via handlers

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDevices(
      1,
      searchTerm,
      activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE"
    );
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value);
    setCurrentPage(1);
    fetchDevices(
      1,
      searchTerm,
      value === "ALL" ? undefined : value === "ACTIVE"
    );
  };

  const handlePageChange = (page: number) => {
    fetchDevices(
      page,
      searchTerm,
      activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE"
    );
  };

  const handleDeviceAdded = () => {
    fetchDevices(
      currentPage,
      searchTerm,
      activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE"
    );
  };

  const handleDeviceUpdated = () => {
    fetchDevices(
      currentPage,
      searchTerm,
      activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE"
    );
  };

  const handleDeviceDeleted = () => {
    fetchDevices(
      currentPage,
      searchTerm,
      activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE"
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Device Management</h1>
        <Separator />
      </div>
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-sm"
            />
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
          </div>
          <Select value={activeFilter} onValueChange={handleActiveFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowAddDialog(true)}>
            <Monitor className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No devices found matching your criteria.
          </div>
        ) : (
          <>
            <DeviceTable
              devices={devices}
              onDeviceUpdated={handleDeviceUpdated}
              onDeviceDeleted={handleDeviceDeleted}
            />

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AddDeviceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onDeviceAdded={handleDeviceAdded}
      />
    </div>
  );
}
