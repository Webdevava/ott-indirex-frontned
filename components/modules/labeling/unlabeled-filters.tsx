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
import { GetUnlabeledEventsOptions } from "@/services/labels.service";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const filterSchema = z.object({
  deviceId: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      const start = new Date(`1970-01-01T${data.startTime}:00`);
      const end = new Date(`1970-01-01T${data.endTime}:00`);
      return start < end;
    }
    return true;
  },
  {
    message: "Start time must be before end time",
    path: ["endTime"],
  }
);

type FilterFormValues = z.infer<typeof filterSchema>;

interface EventFiltersProps {
  onFilterChange: (filters: GetUnlabeledEventsOptions) => void;
  userRole?: string | null;
  initialFilters?: GetUnlabeledEventsOptions;
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

export default function EventFilters({ 
  onFilterChange, 
  userRole,
  initialFilters = {}
}: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get URL parameters
  const urlParams = getUrlParams();

  // Get default values with URL priority
  const getInitialValues = () => {
    const defaultDate = getDefaultDate();
    const defaultStartTime = "00:00";
    const defaultEndTime = "23:59";
    const defaultSort = "asc"; // Default to ascending

    // Priority 1: URL parameters
    let initialDate = defaultDate;
    let initialStartTime = defaultStartTime;
    let initialEndTime = defaultEndTime;
    let initialSort = defaultSort;
    let initialDeviceId = "";

    // Check URL for date
    if (urlParams.date) {
      const urlDate = parseDateFromUrl(urlParams.date);
      if (urlDate) {
        initialDate = urlDate;
      }
    }

    // Check URL for start time
    if (urlParams.startTime && isValidTimeFormat(urlParams.startTime)) {
      initialStartTime = urlParams.startTime;
    }

    // Check URL for end time
    if (urlParams.endTime && isValidTimeFormat(urlParams.endTime)) {
      initialEndTime = urlParams.endTime;
    }

    // Check URL for sort
    if (urlParams.sort && (urlParams.sort === "asc" || urlParams.sort === "desc")) {
      initialSort = urlParams.sort;
    }

    // Check URL for device ID
    if (urlParams.deviceId) {
      initialDeviceId = urlParams.deviceId;
    }

    return {
      date: initialDate,
      startTime: initialStartTime,
      endTime: initialEndTime,
      sort: initialSort as "asc" | "desc",
      deviceId: initialDeviceId,
    };
  };

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      deviceId: "",
      sort: "asc", // Default to ascending
      date: getDefaultDate(),
      startTime: "00:00",
      endTime: "23:59",
    },
  });

  // Initialize form with URL parameters, initial filters, or defaults
  useEffect(() => {
    if (!isInitialized) {
      let formData: Partial<FilterFormValues> = {};

      // Get initial values (URL has priority, but only read once on mount)
      const initialValues = getInitialValues();

      // Priority 1: URL parameters
      formData = {
        date: initialValues.date,
        startTime: initialValues.startTime,
        endTime: initialValues.endTime,
        sort: initialValues.sort,
        deviceId: initialValues.deviceId,
      };

      // Priority 2: Override with initial filters if provided and URL doesn't have them
      if (Object.keys(initialFilters).length > 0) {
        // Set device ID for ADMIN only (ANNOTATOR deviceId is handled in service layer)
        if (userRole === "ADMIN" && initialFilters.deviceId && !urlParams.deviceId) {
          formData.deviceId = initialFilters.deviceId;
        }

        // Set sort if not in URL
        if (initialFilters.sort && !urlParams.sort) {
          formData.sort = initialFilters.sort;
        }

        // Set date and times from initial filters if not in URL
        if (initialFilters.startDate && !urlParams.date && !urlParams.startTime) {
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

  const buildFilters = (data: FilterFormValues): GetUnlabeledEventsOptions => {
    const startDateTime = new Date(data.date);
    const [startHours, startMinutes] = data.startTime.split(":");
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(data.date);
    const [endHours, endMinutes] = data.endTime.split(":");
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 59, 999);

    return {
      deviceId: data.deviceId || undefined,
      sort: data.sort,
      startDate: startDateTime,
      endDate: endDateTime,
    };
  };

  const onSubmit = (data: FilterFormValues) => {
    const filters = buildFilters(data);
    onFilterChange(filters);
    setIsOpen(false);
  };

  const onClear = () => {
    const defaultData = {
      deviceId: "",
      sort: "asc" as const, // Default to ascending
      date: getDefaultDate(),
      startTime: "00:00",
      endTime: "23:59",
    };
    
    form.reset(defaultData);
    const filters = buildFilters(defaultData as FilterFormValues);
    onFilterChange(filters);
    setIsOpen(false);
  };

  const isAdmin = userRole === "ADMIN";
  const showDeviceIdField = isAdmin;

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
            {showDeviceIdField && (
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
                        placeholder="Enter device ID"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
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
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
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
                            <span>Pick a date</span>
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