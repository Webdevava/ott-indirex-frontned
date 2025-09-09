/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetEventsOptions } from "@/services/events.service";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const filterSchema = z.object({
  deviceId: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  date: z.date().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  category: z.enum(["all", "ads", "channels", "content"]),
  eventType: z.enum(["all", "recognized", "unrecognized"]),
}).refine(
  (data) => {
    if (data.date) {
      if (!data.startTime || !data.endTime) {
        return false;
      }
      const start = new Date(`1970-01-01T${data.startTime}:00`);
      const end = new Date(`1970-01-01T${data.endTime}:00`);
      return start < end;
    }
    return true;
  },
  {
    message: "Start time must be before end time and both are required when date is selected",
    path: ["endTime"],
  }
);

type FilterFormValues = z.infer<typeof filterSchema>;

interface DeviceEventFiltersProps {
  onFilterChange: (filters: GetEventsOptions) => void;
  userRole?: string | null;
  initialFilters?: GetEventsOptions;
}

// Helper function to get URL parameters
function getUrlParams() {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const urlParams: { [key: string]: string } = {};
  
  for (const [key, value] of params.entries()) {
    urlParams[key] = value;
  }
  
  return urlParams;
}

// Helper function to get default date (today)
function getDefaultDate(): Date {
  return new Date();
}

// Helper function to format time to HH:MM
function formatTimeFromDate(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

// Helper function to extract date from Date object
function extractDate(date: Date | string): Date {
  if (typeof date === 'string') {
    return new Date(date);
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper function to extract time from Date object
function extractTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return formatTimeFromDate(date as Date);
}

// Helper function to parse date from URL parameter
function parseDateFromUrl(dateStr: string): Date | null {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// Helper function to validate time format (HH:MM)
function isValidTimeFormat(timeStr: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

export default function DeviceEventFilters({ 
  onFilterChange, 
  userRole,
  initialFilters = {}
}: DeviceEventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get URL parameters
  const urlParams = getUrlParams();

  // Get default values with URL priority
  const getInitialValues = () => {
    const defaultSort = "desc"; // Default to descending for live events
    const defaultCategory = "all";
    const defaultEventType = "all";

    // Priority 1: URL parameters
    let initialDate: Date | undefined = undefined;
    let initialStartTime = "";
    let initialEndTime = "";
// In device-event-filters.tsx
const initialSort = urlParams.sort && (urlParams.sort === "asc" || urlParams.sort === "desc") ? urlParams.sort : defaultSort;
const initialDeviceId = urlParams.deviceId || "";
const initialCategory = urlParams.category && ['all', 'ads', 'channels', 'content'].includes(urlParams.category) ? urlParams.category : defaultCategory;
const initialEventType = urlParams.eventType && ['all', 'recognized', 'unrecognized'].includes(urlParams.eventType) ? urlParams.eventType : defaultEventType;

    const startDateParam = urlParams.startDate;
    const startTimeParam = urlParams.startTime;
    const endTimeParam = urlParams.endTime;

    if (startDateParam && startTimeParam && endTimeParam && isValidTimeFormat(startTimeParam) && isValidTimeFormat(endTimeParam)) {
      const date = parseDateFromUrl(startDateParam);
      if (date) {
        initialDate = date;
        initialStartTime = startTimeParam;
        initialEndTime = endTimeParam;
      }
    }

    return {
      date: initialDate,
      startTime: initialStartTime,
      endTime: initialEndTime,
      sort: initialSort as "asc" | "desc",
      deviceId: initialDeviceId,
      category: initialCategory as "all" | "ads" | "channels" | "content",
      eventType: initialEventType as "all" | "recognized" | "unrecognized",
    };
  };

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      deviceId: "",
      sort: "desc",
      date: undefined,
      startTime: "",
      endTime: "",
      category: "all",
      eventType: "all",
    },
  });

  // Initialize form with URL parameters, initial filters, or defaults
  useEffect(() => {
    if (!isInitialized) {
      let formData: Partial<FilterFormValues> = {};

      // Get initial values (URL has priority, but only read once on mount)
      const initialValues = getInitialValues();

      // Set from initial values
      formData = { ...initialValues };

      // Override with initialFilters if not in URL
      if (Object.keys(initialFilters).length > 0) {
        if (initialFilters.deviceId && !urlParams.deviceId) {
          formData.deviceId = initialFilters.deviceId;
        }
        if (initialFilters.sort && !urlParams.sort) {
          formData.sort = initialFilters.sort;
        }
        if (initialFilters.category && !urlParams.category) {
          formData.category = initialFilters.category as "all" | "ads" | "channels" | "content";
        }
        if (initialFilters.types && !urlParams.eventType) {
          if (initialFilters.types[0] === 29) formData.eventType = "recognized";
          if (initialFilters.types[0] === 33) formData.eventType = "unrecognized";
        }
        if (initialFilters.startDate && !urlParams.startDate) {
          const startDate = typeof initialFilters.startDate === 'string' 
            ? new Date(initialFilters.startDate) 
            : initialFilters.startDate;
          
          formData.date = extractDate(startDate);
          formData.startTime = extractTime(startDate);
        }
        if (initialFilters.endDate && !urlParams.endTime) {
          const endDate = typeof initialFilters.endDate === 'string' 
            ? new Date(initialFilters.endDate) 
            : initialFilters.endDate;
          
          formData.endTime = extractTime(endDate);
        }
      }

      // Reset form with the calculated values
      form.reset(formData);
      setIsInitialized(true);

      // Apply filters immediately with the initial values
      const filters = buildFilters(formData as FilterFormValues);
      onFilterChange(filters);
    }
  }, [initialFilters, userRole, form, isInitialized, onFilterChange]);

  const buildFilters = (data: FilterFormValues): GetEventsOptions => {
    const filters: GetEventsOptions = {
      deviceId: data.deviceId || undefined,
      sort: data.sort,
    };

    if (data.date && data.startTime && data.endTime) {
      const startDateTime = new Date(data.date);
      const [startHours, startMinutes] = data.startTime.split(":");
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endDateTime = new Date(data.date);
      const [endHours, endMinutes] = data.endTime.split(":");
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 59, 999);

      filters.startDate = startDateTime;
      filters.endDate = endDateTime;
    }

    if (data.category !== 'all') {
      filters.category = data.category;
    }

    if (data.eventType !== 'all') {
      filters.types = data.eventType === 'recognized' ? [29] : [33];
    }

    return filters;
  };

  const onSubmit = (data: FilterFormValues) => {
    const filters = buildFilters(data);
    onFilterChange(filters);
    setIsOpen(false);
  };

  const onClear = () => {
    const defaultData = {
      deviceId: "",
      sort: "desc" as const,
      date: undefined,
      startTime: "",
      endTime: "",
      category: "all" as const,
      eventType: "all" as const,
    };
    
    form.reset(defaultData);
    const filters = buildFilters(defaultData);
    onFilterChange(filters);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-fit mr-2">
          Filter Events
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Search by device ID"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sort"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="ads">Ads</SelectItem>
                      <SelectItem value="channels">Channels</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="recognized">Recognized</SelectItem>
                      <SelectItem value="unrecognized">Unrecognized</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"  
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>All dates</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Select start time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Select end time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClear}>
                Clear
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}