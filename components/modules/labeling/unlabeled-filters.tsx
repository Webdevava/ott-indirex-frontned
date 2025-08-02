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

export default function EventFilters({ 
  onFilterChange, 
  userRole,
  initialFilters = {}
}: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get default values
  const defaultDate = getDefaultDate();
  const defaultStartTime = "00:00";
  const defaultEndTime = "23:59";

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      deviceId: "",
      sort: undefined,
      date: defaultDate,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    },
  });

  // Initialize form with initial filters or defaults
  useEffect(() => {
    if (!isInitialized) {
      let formData: Partial<FilterFormValues> = {};

      if (Object.keys(initialFilters).length > 0) {
        // Set device ID for ADMIN only (ANNOTATOR deviceId is handled in service layer)
        if (userRole === "ADMIN" && initialFilters.deviceId) {
          formData.deviceId = initialFilters.deviceId;
        }

        // Set sort
        if (initialFilters.sort) {
          formData.sort = initialFilters.sort;
        }

        // Set date and times from initial filters
        if (initialFilters.startDate) {
          const startDate = typeof initialFilters.startDate === 'string' 
            ? new Date(initialFilters.startDate) 
            : initialFilters.startDate;
          
          formData.date = extractDate(startDate);
          formData.startTime = extractTime(startDate);
        }

        if (initialFilters.endDate) {
          const endDate = typeof initialFilters.endDate === 'string' 
            ? new Date(initialFilters.endDate) 
            : initialFilters.endDate;
          
          formData.endTime = extractTime(endDate);
        }
      } else {
        // Set defaults
        formData = {
          deviceId: "",
          sort: undefined,
          date: defaultDate,
          startTime: defaultStartTime,
          endTime: defaultEndTime,
        };
      }

      // Reset form with the calculated values
      form.reset(formData);
      setIsInitialized(true);

      // If we have meaningful initial data, apply it immediately
      if (Object.keys(initialFilters).length === 0) {
        // Only auto-apply if no initial filters were provided
        const filters = buildFilters(formData as FilterFormValues);
        onFilterChange(filters);
      }
    }
  }, [initialFilters, userRole, form, isInitialized, onFilterChange, defaultDate]);

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
      sort: undefined,
      date: defaultDate,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
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