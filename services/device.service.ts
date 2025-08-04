/* eslint-disable @typescript-eslint/no-explicit-any */
import api, { ApiResponse } from './api';
import { z } from 'zod';

// Define Device type
export const DeviceSchema = z.object({
  device_id: z.string().min(1),
  is_active: z.boolean(),
});

export type Device = z.infer<typeof DeviceSchema>;

// Define CreateDevice type
export const CreateDeviceSchema = z.object({
  device_id: z.string().min(1, 'Device ID is required'),
  is_active: z.boolean().optional(),
});

export type CreateDevice = z.infer<typeof CreateDeviceSchema>;

// Define UpdateDevice type
export const UpdateDeviceSchema = z.object({
  is_active: z.boolean().optional(),
});

export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;

// Define GetDevicesResult type
export interface GetDevicesResult {
  devices: Device[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Define response types
export type DeviceResponse = ApiResponse<{
  device: Device;
}>;

export type DevicesListResponse = ApiResponse<GetDevicesResult>;

export type DeleteDeviceResponse = ApiResponse<never>;

export class DeviceService {
  static async registerDevice(data: CreateDevice): Promise<DeviceResponse> {
    try {
      const response = await api.post('/devices/register', data);
      return response.data as DeviceResponse;
    } catch (error: any) {
      throw new Error(`Device registration failed: ${error.message}`);
    }
  }

  static async getAllDevices(params: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  } = {}): Promise<DevicesListResponse> {
    try {
      const response = await api.get('/devices/', { params });
      return response.data as DevicesListResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch devices: ${error.message}`);
    }
  }

  static async getDeviceById(device_id: string): Promise<DeviceResponse> {
    try {
      const response = await api.get(`/devices/${device_id}`);
      return response.data as DeviceResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch device: ${error.message}`);
    }
  }

  static async updateDevice(device_id: string, data: UpdateDevice): Promise<DeviceResponse> {
    try {
      const response = await api.put(`/devices/${device_id}`, data);
      return response.data as DeviceResponse;
    } catch (error: any) {
      throw new Error(`Device update failed: ${error.message}`);
    }
  }

  static async deleteDevice(device_id: string): Promise<DeleteDeviceResponse> {
    try {
      const response = await api.delete(`/devices/${device_id}`);
      return response.data as DeleteDeviceResponse;
    } catch (error: any) {
      throw new Error(`Device deletion failed: ${error.message}`);
    }
  }
}