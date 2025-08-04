"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DeviceService, Device } from "@/services/device.service";

interface DeleteDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
  onDeviceDeleted: () => void;
}

export function DeleteDeviceDialog({ open, onOpenChange, device, onDeviceDeleted }: DeleteDeviceDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await DeviceService.deleteDevice(device.device_id);
      if (response.success) {
        toast.success("Device deleted successfully");
        onDeviceDeleted();
        onOpenChange(false);
      } else {
        toast.error(response.message || "Failed to delete device");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete device"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Device</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the device with ID{" "}
            <strong>{device.device_id}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}