"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Device } from "@/services/device.service";
import { EditDeviceDialog } from "@/components/modules/device-management/edit-device-dialog";
import { DeleteDeviceDialog } from "@/components/modules/device-management/delete-device-dialog";

interface DeviceTableProps {
  devices: Device[];
  onDeviceUpdated: () => void;
  onDeviceDeleted: () => void;
}

export function DeviceTable({ devices, onDeviceUpdated, onDeviceDeleted }: DeviceTableProps) {
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [deleteDevice, setDeleteDevice] = useState<Device | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.device_id}>
              <TableCell>{device.device_id}</TableCell>
              <TableCell>{device.is_active ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => setEditDevice(device)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDevice(device)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editDevice && (
        <EditDeviceDialog
          open={!!editDevice}
          onOpenChange={() => setEditDevice(null)}
          device={editDevice}
          onDeviceUpdated={onDeviceUpdated}
        />
      )}

      {deleteDevice && (
        <DeleteDeviceDialog
          open={!!deleteDevice}
          onOpenChange={() => setDeleteDevice(null)}
          device={deleteDevice}
          onDeviceDeleted={onDeviceDeleted}
        />
      )}
    </>
  );
}