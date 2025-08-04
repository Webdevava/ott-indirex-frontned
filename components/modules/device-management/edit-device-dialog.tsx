"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DeviceService, Device, UpdateDevice } from "@/services/device.service";

interface EditDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
  onDeviceUpdated: () => void;
}

export function EditDeviceDialog({ open, onOpenChange, device, onDeviceUpdated }: EditDeviceDialogProps) {
  const [isActive, setIsActive] = useState(device.is_active);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: UpdateDevice = { is_active: isActive };
      const response = await DeviceService.updateDevice(device.device_id, data);
      if (response.success) {
        toast.success("Device updated successfully");
        onDeviceUpdated();
        onOpenChange(false);
      } else {
        toast.error(response.message || "Failed to update device");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update device"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device: {device.device_id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active Status</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}