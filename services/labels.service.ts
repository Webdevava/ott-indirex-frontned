/* eslint-disable @typescript-eslint/no-explicit-any */
import api, { ApiResponse } from './api';
import { z } from 'zod';

// Define LabelSong schema
export const LabelSongSchema = z.object({
  label_id: z.number().optional(),
  song_name: z.string().min(1, 'Song name is required'),
  artist: z.string().nullable(),
  album: z.string().nullable(),
  language: z.string().nullable(),
  release_year: z.number().int().positive().nullable(),
});

export type LabelSong = z.infer<typeof LabelSongSchema>;

// Define LabelAd schema
export const LabelAdSchema = z.object({
  label_id: z.number().optional(),
  type: z.enum(['COMMERCIAL_BREAK', 'SPOT_OUTSIDE_BREAK', 'AUTO_PROMO']),
  brand: z.string().min(1, 'Brand is required'),
  product: z.string().nullable(),
  category: z.string().nullable(),
  sector: z.string().nullable(),
  format: z.string().nullable(),
});

export type LabelAd = z.infer<typeof LabelAdSchema>;

// Define LabelError schema
export const LabelErrorSchema = z.object({
  label_id: z.number().optional(),
  error_type: z.string().min(1, 'Error type is required'),
});

export type LabelError = z.infer<typeof LabelErrorSchema>;

// Define LabelProgram schema
export const LabelProgramSchema = z.object({
  label_id: z.number().optional(),
  program_name: z.string().min(1, 'Program name is required'),
  genre: z.string().nullable(),
  episode_number: z.number().int().positive().nullable(),
  season_number: z.number().int().positive().nullable(),
  language: z.string().nullable(),
});

export type LabelProgram = z.infer<typeof LabelProgramSchema>;

// Define LabelMovie schema
export const LabelMovieSchema = z.object({
  label_id: z.number().optional(),
  movie_name: z.string().min(1, 'Movie name is required'),
  director: z.string().nullable(),
  genre: z.string().nullable(),
  language: z.string().nullable(),
  release_year: z.number().int().positive().nullable(),
});

export type LabelMovie = z.infer<typeof LabelMovieSchema>;

// Define LabelStatic schema
export const LabelStaticSchema = z.object({
  label_id: z.number().optional(),
  static_type: z.enum(['STAND_BY', 'UI_NAVIGATION']),
});

export type LabelStatic = z.infer<typeof LabelStaticSchema>;

// Define Label schema
export const LabelSchema = z.object({
  id: z.number(),
  event_ids: z.array(z.string()),
  label_type: z.enum(['song', 'ad', 'error', 'program', 'movie', 'static']),
  created_by: z.string(),
  created_at: z.date(),
  start_time: z.string(),
  end_time: z.string(),
  notes: z.string().nullable(),
  image_paths: z.array(z.string().nullable()),
  song: LabelSongSchema.nullable(),
  ad: LabelAdSchema.nullable(),
  error: LabelErrorSchema.nullable(),
  program: LabelProgramSchema.nullable(),
  movie: LabelMovieSchema.nullable(),
  static: LabelStaticSchema.nullable(),
});

export type Label = z.infer<typeof LabelSchema>;

// Define CreateLabel schema
export const CreateLabelSchema = z.object({
  event_ids: z.array(z.string()).min(1, 'At least one event ID is required'),
  label_type: z.enum(['song', 'ad', 'error', 'program', 'movie', 'static']),
  notes: z.string().nullable(),
  song: LabelSongSchema.optional(),
  ad: LabelAdSchema.optional(),
  error: LabelErrorSchema.optional(),
  program: LabelProgramSchema.optional(),
  movie: LabelMovieSchema.optional(),
  static: LabelStaticSchema.optional(),
}).refine(
  (data) => {
    if (data.label_type === 'song' && !data.song) return false;
    if (data.label_type === 'ad' && !data.ad) return false;
    if (data.label_type === 'error' && !data.error) return false;
    if (data.label_type === 'program' && !data.program) return false;
    if (data.label_type === 'movie' && !data.movie) return false;
    if (data.label_type === 'static' && !data.static) return false;
    if (data.label_type === 'song' && (data.ad || data.error || data.program || data.movie || data.static)) return false;
    if (data.label_type === 'ad' && (data.song || data.error || data.program || data.movie || data.static)) return false;
    if (data.label_type === 'error' && (data.song || data.ad || data.program || data.movie || data.static)) return false;
    if (data.label_type === 'program' && (data.song || data.ad || data.error || data.movie || data.static)) return false;
    if (data.label_type === 'movie' && (data.song || data.ad || data.error || data.program || data.static)) return false;
    if (data.label_type === 'static' && (data.song || data.ad || data.error || data.program || data.movie)) return false;
    return true;
  },
  {
    message: 'Corresponding label details are required, and only one label type should be provided',
    path: ['label_type'],
  },
);

export type CreateLabel = z.infer<typeof CreateLabelSchema>;

// Define UpdateLabel schema
export const UpdateLabelSchema = z.object({
  label_type: z.enum(['song', 'ad', 'error', 'program', 'movie', 'static']).optional(),
  notes: z.string().nullable().optional(),
  event_ids: z.array(z.string()).optional(),
  song: LabelSongSchema.optional(),
  ad: LabelAdSchema.optional(),
  error: LabelErrorSchema.optional(),
  program: LabelProgramSchema.optional(),
  movie: LabelMovieSchema.optional(),
  static: LabelStaticSchema.optional(),
}).refine(
  (data) => {
    if (data.label_type && data.label_type === 'song' && !data.song) return false;
    if (data.label_type && data.label_type === 'ad' && !data.ad) return false;
    if (data.label_type && data.label_type === 'error' && !data.error) return false;
    if (data.label_type && data.label_type === 'program' && !data.program) return false;
    if (data.label_type && data.label_type === 'movie' && !data.movie) return false;
    if (data.label_type && data.label_type === 'static' && !data.static) return false;
    if (data.label_type && data.label_type === 'song' && (data.ad || data.error || data.program || data.movie || data.static)) return false;
    if (data.label_type && data.label_type === 'ad' && (data.song || data.error || data.program || data.movie || data.static)) return false;
    if (data.label_type && data.label_type === 'error' && (data.song || data.ad || data.program || data.movie || data.static)) return false;
    if (data.label_type && data.label_type === 'program' && (data.song || data.ad || data.error || data.movie || data.static)) return false;
    if (data.label_type && data.label_type === 'movie' && (data.song || data.ad || data.error || data.program || data.static)) return false;
    if (data.label_type && data.label_type === 'static' && (data.song || data.ad || data.error || data.program || data.movie)) return false;
    return true;
  },
  {
    message: 'Corresponding label details are required, and only one label type should be provided',
    path: ['label_type'],
  },
);

export type UpdateLabel = z.infer<typeof UpdateLabelSchema>;

// Define GetUnlabeledEventsOptions type
export interface GetUnlabeledEventsOptions {
  page?: number;
  limit?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  deviceId?: string;
  types?: number[];
  sort?: 'asc' | 'desc';
}

// Define GetLabelsOptions type
export interface GetLabelsOptions {
  page?: number;
  limit?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  createdBy?: string;
  labelType?: string;
  deviceId?: string;
  sort?: 'asc' | 'desc';
}

// Define response types
export type LabelResponse = ApiResponse<{
  label: Label;
}>;

export type LabelsListResponse = ApiResponse<{
  events?: any[];
  labels?: Label[];
  total: number;
  totalPages: number;
  currentPage: number;
}>;

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Helper function to format date in local timezone
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  // Use local timezone offset
  const offset = -date.getTimezoneOffset();
  const offsetSign = offset >= 0 ? '+' : '-';
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

// Helper function to apply device ID logic based on user role
function applyDeviceIdLogic(options: GetUnlabeledEventsOptions | GetLabelsOptions): GetUnlabeledEventsOptions | GetLabelsOptions {
  const userRole = getCookie("auth_user_role");
  const userRecorderId = getCookie("auth_user_recorderId");

  // Create a copy of options to avoid mutation
  const processedOptions = { ...options };

  if (userRole === "ANNOTATOR" && userRecorderId) {
    // For ANNOTATOR, always use their recorder ID
    processedOptions.deviceId = userRecorderId;
  } else if (userRole === "ADMIN") {
    // For ADMIN, use provided deviceId or no restriction
    // processedOptions.deviceId remains as provided in options
  }

  return processedOptions;
}

export class LabelService {
  static async createLabel(data: CreateLabel): Promise<LabelResponse> {
    try {
      const response = await api.post('/labels/', data);
      return response.data as LabelResponse;
    } catch (error: any) {
      throw new Error(`Label creation failed: ${error.message}`);
    }
  }

  static async getUnlabeledEvents(options: GetUnlabeledEventsOptions = {}): Promise<LabelsListResponse> {
    try {
      // Apply device ID logic based on user role
      const processedOptions = applyDeviceIdLogic(options) as GetUnlabeledEventsOptions;

      // Convert Date objects to formatted strings without timezone conversion
      const params = {
        ...processedOptions,
        startDate: processedOptions.startDate instanceof Date 
          ? formatDateForAPI(processedOptions.startDate) 
          : processedOptions.startDate,
        endDate: processedOptions.endDate instanceof Date 
          ? formatDateForAPI(processedOptions.endDate) 
          : processedOptions.endDate,
        types: processedOptions.types?.join(','),
      };

      const response = await api.get('/labels/unlabeled', { params });
      return response.data as LabelsListResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch unlabeled events: ${error.message}`);
    }
  }

  static async getLabels(options: GetLabelsOptions = {}): Promise<LabelsListResponse> {
    try {
      // Apply device ID logic based on user role
      const processedOptions = applyDeviceIdLogic(options) as GetLabelsOptions;

      // Convert Date objects to formatted strings without timezone conversion
      const params = {
        ...processedOptions,
        startDate: processedOptions.startDate instanceof Date 
          ? formatDateForAPI(processedOptions.startDate) 
          : processedOptions.startDate,
        endDate: processedOptions.endDate instanceof Date 
          ? formatDateForAPI(processedOptions.endDate) 
          : processedOptions.endDate,
      };

      const response = await api.get('/labels/', { params });
      return response.data as LabelsListResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch labels: ${error.message}`);
    }
  }

  static async updateLabel(labelId: number, data: UpdateLabel): Promise<LabelResponse> {
    try {
      const response = await api.put(`/labels/${labelId}`, data);
      return response.data as LabelResponse;
    } catch (error: any) {
      throw new Error(`Label update failed: ${error.message}`);
    }
  }

  static async deleteLabel(labelId: number): Promise<LabelResponse> {
    try {
      const response = await api.delete(`/labels/${labelId}`);
      return response.data as LabelResponse;
    } catch (error: any) {
      throw new Error(`Label deletion failed: ${error.message}`);
    }
  }

  static async deleteLabelsBulk(labelIds: number[]): Promise<LabelResponse> {
    try {
      const response = await api.delete('/labels/bulk', { data: { labelIds } });
      return response.data as LabelResponse;
    } catch (error: any) {
      throw new Error(`Bulk label deletion failed: ${error.message}`);
    }
  }
}