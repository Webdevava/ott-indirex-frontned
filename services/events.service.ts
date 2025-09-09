/* eslint-disable @typescript-eslint/no-explicit-any */
import api, { ApiResponse } from './api';
import { z } from 'zod';

// Placeholder LabelSchema (replace with actual LabelSchema from your backend)
export const LabelSchema = z.object({
  id: z.number(),
  event_ids: z.array(z.string()),
  label_type: z.string(),
  created_by: z.number().nullable(),
  created_at: z.date(),
  start_time: z.string(),
  end_time: z.string(),
  notes: z.string().nullable(),
  image_paths: z.array(z.string().nullable()),
  song: z
    .object({
      id: z.number(),
      title: z.string(),
      artist: z.string().nullable(),
      album: z.string().nullable(),
    })
    .nullable(),
  ad: z
    .object({
      id: z.number(),
      name: z.string(),
      brand: z.string().nullable(),
    })
    .nullable(),
  error: z
    .object({
      id: z.number(),
      description: z.string(),
    })
    .nullable(),
  program: z
    .object({
      id: z.number(),
      title: z.string(),
      channel: z.string().nullable(),
    })
    .nullable(),
});

// Define Event type
export const EventSchema = z.object({
  id: z.string(),
  device_id: z.string(),
  timestamp: z.string(),
  type: z.number(),
  image_path: z.string().nullable(),
  max_score: z.number().nullable(),
  created_at: z.date(),
  ads: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      score: z.number().nullable(),
    }),
  ),
  channels: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      score: z.number().nullable(),
    }),
  ),
  content: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      score: z.number().nullable(),
    }),
  ),
  labels: z.array(LabelSchema),
});

export type Event = z.infer<typeof EventSchema>;

// Define GetEventsOptions type
export interface GetEventsOptions {
  page?: number;
  limit?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  deviceId?: string;
  types?: number[];
  sort?: 'asc' | 'desc';
}

// Define GetEventsResult type
export interface GetEventsResult {
  events: Event[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Define response types
export type EventResponse = ApiResponse<{
  event: Event;
}>;

export type EventsListResponse = ApiResponse<GetEventsResult>;

export class EventService {
  static async getEvents(options: GetEventsOptions = {}): Promise<EventsListResponse> {
    try {
      // Convert Date objects to ISO strings for query params
      const params = {
        ...options,
        startDate: options.startDate instanceof Date ? options.startDate.toISOString() : options.startDate,
        endDate: options.endDate instanceof Date ? options.endDate.toISOString() : options.endDate,
        types: options.types?.join(','),
      };
      const response = await api.get('/events/', { params });
      return response.data as EventsListResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  static async getEventById(eventId: string): Promise<EventResponse> {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data as EventResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }
}