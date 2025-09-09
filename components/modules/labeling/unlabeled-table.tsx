/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { toast } from "sonner";

import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  LabelService,
  GetUnlabeledEventsOptions,
} from "@/services/labels.service";
import { LabelEventsDialog } from "./label-event-dialog";
import EventFilters from "./unlabeled-filters";

type Event = {
  id: string;
  device_id: string;
  timestamp: string;
  type: number;
  image_path: string;
  max_score: number;
  created_at: string;
  ads: any[];
  channels: Array<{
    id: number;
    event_id: string;
    name: string;
    score: number;
  }>;
  content: any[];
};

const columns: ColumnDef<Event>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
      className="border-primary"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
      className="border-primary"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
  },
  {
    header: "Event ID",
    accessorKey: "id",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    size: 120,
    enableSorting: false,
  },
  {
    header: "Device ID",
    accessorKey: "device_id",
    size: 140,
    enableSorting: false,
  },
  // {
  //   header: "Type",
  //   accessorKey: "type",
  //   cell: ({ row }) => {
  //     const type = row.getValue("type") as number;
  //     const label = type === 29 ? "Recognized" : type === 33 ? "Unrecognized" : "Unknown";

  //     return <Badge variant="outline">{label}</Badge>;
  //   },
  //   size: 80,
  //   enableSorting: false,
  // },
  {
    header: "Max Score",
    accessorKey: "max_score",
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("max_score"));
      return (
        <div className="flex items-center">
          <span
            className={cn(
              "font-medium",
              score === 0 ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {score.toFixed(2)}
          </span>
        </div>
      );
    },
    size: 100,
    enableSorting: false,
  },
  {
    header: "Channels",
    accessorKey: "channels",
    cell: ({ row }) => {
      const channels = row.getValue("channels") as Event["channels"];
      return (
        <div className="space-y-1">
          {channels.length > 0 ? (
            channels.map((channel) => (
              <div key={channel.id} className="text-sm">
                <span className="font-medium">{channel.name}</span>
                <span className="text-muted-foreground ml-2">
                  ({channel.score.toFixed(2)})
                </span>
              </div>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No channels</span>
          )}
        </div>
      );
    },
    size: 200,
    enableSorting: false,
  },

  {
    header: "Ads",
    accessorKey: "ads",
    cell: ({ row }) => {
      const ads = row.getValue("ads") as Event["ads"];
      return (
        <div className="space-y-1">
          {ads.length > 0 ? (
            ads.map((ad) => (
              <div key={ad.id} className="text-sm">
                <span className="font-medium">{ad.name}</span>
                <span className="text-muted-foreground ml-2">
                  ({ad.score.toFixed(2)})
                </span>
              </div>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No ads</span>
          )}
        </div>
      );
    },
    // size: 150,
    enableSorting: false,
  },
  //   {
  //     header: "Created At",
  //     accessorKey: "created_at",
  //     cell: ({ row }) => {
  //       const date = new Date(row.getValue("created_at"));
  //       return (
  //         <div className="text-sm">
  //           {date.toLocaleDateString()} {date.toLocaleTimeString()}
  //         </div>
  //       );
  //     },
  //     size: 160,
  //     enableSorting: false,
  //   },
  {
    header: "TimeStamp",
    accessorKey: "timestamp",
    cell: ({ row }) => {
      const unixTimestamp = row.getValue("timestamp") as number;
      const date = new Date(unixTimestamp * 1000);
      const humanReadable = date.toLocaleString("en-IN", {
        timeZone: "Asia/Kathmandu",
      });

      return <div className="text-sm">{humanReadable} NPT</div>;
    },
    size: 160,
    enableSorting: false,
  },
  {
    header: "Image",
    accessorKey: "image_path",
    cell: ({ row }) => {
      const imagePath = row.getValue("image_path") as string;
      //   const timestamp = row.getValue("timestamp") as number;
      const eventId = row.getValue("id") as string;

      if (!imagePath) {
        return <span className="text-muted-foreground text-sm">No image</span>;
      }

      return (
        <Dialog>
          <DialogTrigger asChild>
            <img
              src={imagePath}
              alt={`Event ${eventId}`}
              className="w-16 h-12 object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (
                  e.target as HTMLImageElement
                ).nextElementSibling!.classList.remove("hidden");
              }}
            />
          </DialogTrigger>
          <DialogContent className="max-w-7xl w-full">
            <img
              src={imagePath}
              alt={`Event ${eventId}`}
              className="w-full h-full wax-w-6xl object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (
                  e.target as HTMLImageElement
                ).nextElementSibling!.classList.remove("hidden");
              }}
            />
          </DialogContent>
        </Dialog>
      );
    },
    size: 80,
    enableSorting: false,
  },
];

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Helper function to get default date (today)
// function getDefaultDate(): Date {
//   return new Date();
// }

// Helper function to format time to HH:MM in local timezone
function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function EventTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = 10;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<GetUnlabeledEventsOptions>({});

  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  // Get user role from cookies
  const userRole = getCookie("auth_user_role");

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: GetUnlabeledEventsOptions = {};

    // Get device ID param (only for ADMIN, ANNOTATOR logic is in service)
    const deviceIdParam = searchParams.get("deviceId");
    if (userRole === "ADMIN" && deviceIdParam) {
      urlFilters.deviceId = deviceIdParam;
    }

    // Get sort param
    const sortParam = searchParams.get("sort");
    if (sortParam === "asc" || sortParam === "desc") {
      urlFilters.sort = sortParam;
    }

    // Get date and time params
    const startDateParam = searchParams.get("startDate");
    const startTimeParam = searchParams.get("startTime");
    const endTimeParam = searchParams.get("endTime");

    if (startDateParam && startTimeParam) {
      try {
        const [year, month, day] = startDateParam.split("-").map(Number);
        const [hours, minutes] = startTimeParam.split(":").map(Number);
        const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        urlFilters.startDate = startDate;
      } catch (error) {
        console.error("Invalid start date/time:", error);
      }
    }

    if (startDateParam && endTimeParam) {
      try {
        const [year, month, day] = startDateParam.split("-").map(Number);
        const [hours, minutes] = endTimeParam.split(":").map(Number);
        const endDate = new Date(year, month - 1, day, hours, minutes, 59, 999);
        urlFilters.endDate = endDate;
      } catch (error) {
        console.error("Invalid end date/time:", error);
      }
    }

    // Set default filters if no URL params
    if (Object.keys(urlFilters).length === 0) {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );

      urlFilters.startDate = startOfDay;
      urlFilters.endDate = endOfDay;
    }

    setFilters(urlFilters);
  }, [searchParams, userRole]);

  // Update URL when filters change
  const updateURLParams = (newFilters: GetUnlabeledEventsOptions) => {
    const params = new URLSearchParams();

    if (newFilters.deviceId && userRole === "ADMIN") {
      params.set("deviceId", newFilters.deviceId);
    }
    if (newFilters.sort) {
      params.set("sort", newFilters.sort);
    }
    if (newFilters.startDate) {
      const date =
        newFilters.startDate instanceof Date
          ? newFilters.startDate
          : new Date(newFilters.startDate);
      params.set(
        "startDate",
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      );
      params.set("startTime", formatTime(date));
    }
    if (newFilters.endDate) {
      const date =
        newFilters.endDate instanceof Date
          ? newFilters.endDate
          : new Date(newFilters.endDate);
      params.set("endTime", formatTime(date));
    }

    const newURL = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.replace(newURL);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await LabelService.getUnlabeledEvents({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      });

      if (response.success && response.data) {
        setData(response.data.events || []);
        setTotalPages(response.data.totalPages || 0);
        setTotal(response.data.total || 0);
      } else {
        setData([]);
        setTotalPages(0);
        setTotal(0);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch events");
      setData([]);
      setTotalPages(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  const handleFilterChange = (newFilters: GetUnlabeledEventsOptions) => {
    setFilters(newFilters);
    updateURLParams(newFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: totalPages,
    paginationItemsToDisplay: 10,
  });

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  console.log(table.getState().rowSelection);

  useEffect(() => {
    const selected = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);
    setSelectedEventIds(selected);
  }, [table.getFilteredSelectedRowModel().rows]);

  return (
    <div className="space-y-4 relative">
      {/* Selection Bar */}
      {selectedRowsCount > 0 && (
        <div className="w-full fixed bottom-0 z-50 left-0 right-0 max-w-4xl mx-auto bg-muted shadow-lg border border-primary rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">{selectedRowsCount} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <LabelEventsDialog
              selectedEventIds={selectedEventIds}
              onSuccess={() => {
                table.toggleAllPageRowsSelected(false);
                fetchEvents();
              }}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.toggleAllPageRowsSelected(false)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Filters Status */}
      <div className="flex items-center justify-between gap-3 max-sm:flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Total Events: {total}
          </span>
          {loading && <Badge variant="secondary">Loading...</Badge>}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 max-sm:flex-col">
        <p
          className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
          aria-live="polite"
        >
          Page{" "}
          <span className="text-foreground">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of <span className="text-foreground">{totalPages}</span>
        </p>
        <div className="flex items-center flex-wrap divide-x-2">
          <div className="">
            <EventFilters
              onFilterChange={handleFilterChange}
              userRole={userRole}
              initialFilters={filters}
            />
          </div>
          <div className="flex flex-1 justify-end">
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              aria-label="Results per page"
              disabled={loading}
            >
              <SelectTrigger
                id="results-per-page"
                className="w-fit whitespace-nowrap mx-2"
              >
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grow ml-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50 size-7"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || loading}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {showLeftEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {pages.map((page) => {
                  const isActive =
                    page === table.getState().pagination.pageIndex + 1;
                  return (
                    <PaginationItem key={page}>
                      <Button
                        size="icon"
                        variant={`${isActive ? "default" : "ghost"}`}
                        onClick={() => table.setPageIndex(page - 1)}
                        aria-current={isActive ? "page" : undefined}
                        className="size-6 disabled:pointer-events-none disabled:opacity-50"
                        disabled={loading}
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  );
                })}
                {showRightEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50 size-7"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || loading}
                    aria-label="Go to next page"
                  >
                    <ChevronRightIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="h-11"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Loading component
function EventTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="h-12 bg-muted animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 border-t bg-muted/50 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function EventTable() {
  return (
    <Suspense fallback={<EventTableSkeleton />}>
      <EventTableContent />
    </Suspense>
  );
}
