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
import {
  GetUnlabeledEventsOptions,
  GetLabelsOptions,
} from "@/services/labels.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { AuthService, User } from "@/services/auth.service";

const filterSchema = z
  .object({
    deviceId: z.string().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    date: z.date(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    createdBy: z.string().optional(),
    labelType: z.enum(["all", "song", "ad", "error", "program", "movie"]).optional(),
  })
  .refine(
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
  )
  .refine(
    (data) => {
      // Ensure only one of deviceId or createdBy is set
      if (data.deviceId && data.createdBy !== "all") {
        return false;
      }
      return true;
    },
    {
      message: "Cannot use both Device ID and Created By filters",
      path: ["createdBy"],
    }
  );

type FilterFormValues = z.infer<typeof filterSchema>;

interface EventFiltersProps {
  onFilterChange: (filters: GetLabelsOptions) => void;
  userRole?: string | null;
  initialFilters?: GetLabelsOptions;
}

// Helper function to get URL parameters
function getUrlParams() {
  if (typeof window === "undefined") return {};

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
  if (typeof date === "string") {
    return new Date(date);
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Helper function to extract time from Date object
function extractTime(date: Date | string): string {
  if (typeof date === "string") {
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

// Helper function to validate labelType from URL parameter
function isValidLabelType(type: string): type is "all" | "song" | "ad" | "error" | "program" | "movie" {
  return ["all", "song", "ad", "error", "program", "movie"].includes(type);
}

export default function EventFilters({
  onFilterChange,
  userRole,
  initialFilters = {},
}: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Get URL parameters
  const urlParams = getUrlParams();

  // Fetch users for createdBy filter (only for ADMIN)
  useEffect(() => {
    if (userRole === "ADMIN") {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const response = await AuthService.getAllUsers();
          if (response.success && response.data) {
            setUsers(response.data.users);
          }
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [userRole]);

  // Get initial values with URL priority
  const getInitialValues = () => {
    const defaultDate = getDefaultDate();
    const defaultStartTime = "00:00";
    const defaultEndTime = "23:59";
    const defaultSort = "desc";
    const defaultCreatedBy = "all";
    const defaultDeviceId = "";
    const defaultLabelType = "all";

    let initialDate = defaultDate;
    let initialStartTime = defaultStartTime;
    let initialEndTime = defaultEndTime;
    let initialSort = defaultSort;
    let initialDeviceId = defaultDeviceId;
    let initialCreatedBy = defaultCreatedBy;
    let initialLabelType: "all" | "song" | "ad" | "error" | "program" | "movie" = defaultLabelType;

    if (urlParams.date) {
      const urlDate = parseDateFromUrl(urlParams.date);
      if (urlDate) {
        initialDate = urlDate;
      }
    }

    if (urlParams.startTime && isValidTimeFormat(urlParams.startTime)) {
      initialStartTime = urlParams.startTime;
    }

    if (urlParams.endTime && isValidTimeFormat(urlParams.endTime)) {
      initialEndTime = urlParams.endTime;
    }

    if (
      urlParams.sort &&
      (urlParams.sort === "desc" || urlParams.sort === "asc")
    ) {
      initialSort = urlParams.sort;
    }

    if (urlParams.labelType && isValidLabelType(urlParams.labelType)) {
      initialLabelType = urlParams.labelType;
    }

    // Only one of deviceId or createdBy can be set
    if (urlParams.deviceId) {
      initialDeviceId = urlParams.deviceId;
      initialCreatedBy = "all"; // Reset createdBy
    } else if (urlParams.createdBy) {
      initialCreatedBy = urlParams.createdBy;
      initialDeviceId = ""; // Reset deviceId
    }

    return {
      date: initialDate,
      startTime: initialStartTime,
      endTime: initialEndTime,
      sort: initialSort as "desc" | "asc",
      deviceId: initialDeviceId,
      createdBy: initialCreatedBy,
      labelType: initialLabelType,
    };
  };

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      deviceId: "",
      sort: "desc",
      date: getDefaultDate(),
      startTime: "00:00",
      endTime: "23:59",
      createdBy: "all",
      labelType: "all",
    },
  });

  // Initialize form with URL parameters, initial filters, or defaults
  useEffect(() => {
    if (!isInitialized) {
      const initialValues = getInitialValues();

      const formData: Partial<FilterFormValues> = {
        date: initialValues.date,
        startTime: initialValues.startTime,
        endTime: initialValues.endTime,
        sort: initialValues.sort,
        deviceId: initialValues.deviceId,
        createdBy: initialValues.createdBy,
        labelType: initialValues.labelType,
      };

      if (Object.keys(initialFilters).length > 0) {
        if (
          userRole === "ADMIN" &&
          initialFilters.deviceId &&
          !urlParams.deviceId &&
          !initialFilters.createdBy // Only set deviceId if createdBy is not set
        ) {
          formData.deviceId = initialFilters.deviceId;
          formData.createdBy = "all";
        }

        if (initialFilters.sort && !urlParams.sort) {
          formData.sort = initialFilters.sort;
        }

        if (
          userRole === "ADMIN" &&
          initialFilters.createdBy &&
          !urlParams.createdBy &&
          !initialFilters.deviceId // Only set createdBy if deviceId is not set
        ) {
          formData.createdBy = initialFilters.createdBy;
          formData.deviceId = "";
        }

        if (
          initialFilters.labelType &&
          !urlParams.labelType &&
          isValidLabelType(initialFilters.labelType)
        ) {
          formData.labelType = initialFilters.labelType;
        }

        if (
          initialFilters.startDate &&
          !urlParams.date &&
          !urlParams.startTime
        ) {
          const startDate =
            typeof initialFilters.startDate === "string"
              ? new Date(initialFilters.startDate)
              : initialFilters.startDate;

          formData.date = extractDate(startDate);
          formData.startTime = extractTime(startDate);
        }

        if (initialFilters.endDate && !urlParams.endTime) {
          const endDate =
            typeof initialFilters.endDate === "string"
              ? new Date(initialFilters.endDate)
              : initialFilters.endDate;

          formData.endTime = extractTime(endDate);
        }
      }

      form.reset(formData);
      setIsInitialized(true);

      const filters = buildFilters(formData as FilterFormValues);
      onFilterChange(filters);
    }
  }, [initialFilters, userRole, form, isInitialized, onFilterChange]);

  const buildFilters = (data: FilterFormValues): GetLabelsOptions => {
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
      createdBy: data.createdBy === "all" ? undefined : data.createdBy,
      labelType: data.labelType === "all" ? undefined : data.labelType,
    };
  };

  const onClear = () => {
    const defaultData: FilterFormValues = {
      deviceId: "",
      sort: "desc",
      date: getDefaultDate(),
      startTime: "00:00",
      endTime: "23:59",
      createdBy: "all",
      labelType: "all",
    };

    form.reset(defaultData);
    const filters = buildFilters(defaultData);
    onFilterChange(filters);
    setIsOpen(false);
  };

  const onSubmit = (data: FilterFormValues) => {
    const filters = buildFilters(data);
    onFilterChange(filters);
    setIsOpen(false);
  };

  const isAdmin = userRole === "ADMIN";
  const deviceIdValue = form.watch("deviceId");
  const createdByValue = form.watch("createdBy");

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
            {isAdmin && (
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
                        disabled={createdByValue !== "all"} // Disable if createdBy is set
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) {
                            form.setValue("createdBy", "all"); // Clear createdBy when deviceId is set
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isAdmin && (
              <FormField
                control={form.control}
                name="createdBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Created By</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== "all") {
                          form.setValue("deviceId", ""); // Clear deviceId when createdBy is set
                        }
                      }}
                      value={field.value ?? "all"}
                      disabled={isLoadingUsers || !!deviceIdValue} // Disable if loading or deviceId is set
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              isLoadingUsers ? "Loading users..." : "All"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.email}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="labelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? "all"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select label type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="song">Song</SelectItem>
                      <SelectItem value="ad">Ad</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                      <SelectItem value="movie">Movie</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="asc">Oldest First</SelectItem>
                      <SelectItem value="desc">Newest First</SelectItem>
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