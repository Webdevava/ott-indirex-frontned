/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
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
import {
  LabelService,
  Label,
  LabelSong,
  LabelAd,
  LabelError,
  LabelProgram,
  GetLabelsOptions,
} from "@/services/labels.service";
import EventFilters from "./labeled-filters";
import { ViewLabelDialog } from "./view-label-dialog";

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

// Define type for details based on Label type
type LabelDetails = LabelSong | LabelAd | LabelError | LabelProgram | null;

type LabelWithDetails = Label & {
  details: LabelDetails;
};

const columns: ColumnDef<LabelWithDetails>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
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
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
  },
  {
    header: "Label ID",
    accessorKey: "id",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    size: 100,
    enableSorting: false,
  },
  {
    header: "Label Type",
    accessorKey: "label_type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("label_type")}
      </Badge>
    ),
    size: 100,
    enableSorting: false,
  },
  {
    header: "Details",
    accessorKey: "details",
    cell: ({ row }) => {
      const details = row.getValue("details") as LabelDetails;
      if (!details)
        return <span className="text-muted-foreground">No details</span>;
      switch (row.original.label_type) {
        case "song":
          return (
            <div className="text-sm truncate">
              <span className="font-medium">
                {(details as LabelSong).song_name}
              </span>
              <span className="text-muted-foreground ml-2">
                by {(details as LabelSong).artist || "Unknown"}
              </span>
            </div>
          );
        case "ad":
          return (
            <div className="text-sm truncate">
              <span className="font-medium">{(details as LabelAd).brand}</span>
              <span className="text-muted-foreground ml-2">
                ({(details as LabelAd).type})
              </span>
            </div>
          );
        case "error":
          return (
            <div className="text-sm truncate">
              <span className="font-medium">
                {(details as LabelError).error_type}
              </span>
            </div>
          );
        case "program":
          return (
            <div className="text-sm">
              <span className="font-medium">
                {(details as LabelProgram).program_name}
              </span>
              <span className="text-muted-foreground ml-2">
                (S{(details as LabelProgram).season_number || "N/A"}E
                {(details as LabelProgram).episode_number || "N/A"})
              </span>
            </div>
          );
        default:
          return <span className="text-muted-foreground">No details</span>;
      }
    },
    size: 200,
    enableSorting: false,
  },
  {
    header: "Created By",
    accessorKey: "created_by",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("created_by")}</div>
    ),
    size: 150,
    enableSorting: false,
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-sm">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      );
    },
    size: 160,
    enableSorting: false,
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => <ViewLabelDialog label={row.original} />,
    size: 100,
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

// Helper function to format time to HH:MM in local timezone
function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function LabeledEventsTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = 10;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const [data, setData] = useState<LabelWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<GetLabelsOptions>({});

  // Get user role from cookies
  const userRole = getCookie("auth_user_role");

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: GetLabelsOptions = {};

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

    // Get createdBy param
    const createdByParam = searchParams.get("createdBy");
    if (createdByParam) {
      urlFilters.createdBy = createdByParam;
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
  const updateURLParams = (newFilters: GetLabelsOptions) => {
    const params = new URLSearchParams();

    if (newFilters.deviceId && userRole === "ADMIN") {
      params.set("deviceId", newFilters.deviceId);
    }
    if (newFilters.sort) {
      params.set("sort", newFilters.sort);
    }
    if (newFilters.createdBy) {
      params.set("createdBy", newFilters.createdBy); // Add createdBy to URL
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

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await LabelService.getLabels({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      });
      if (response.success && response.data) {
        const labelsWithDetails = response.data.labels!.map((label: Label) => ({
          ...label,
          details: label.song || label.ad || label.error || label.program,
        }));
        setData(labelsWithDetails);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      } else {
        setData([]);
        setTotalPages(0);
        setTotal(0);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch labels");
      setData([]);
      setTotalPages(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  const handleFilterChange = (newFilters: GetLabelsOptions) => {
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

  const handleBulkDelete = async () => {
    const selectedLabelIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (
      !confirm(
        `Are you sure you want to delete ${selectedLabelIds.length} label(s)?`
      )
    )
      return;
    try {
      const response = await LabelService.deleteLabelsBulk(selectedLabelIds);
      if (response.success) {
        toast.success("Labels deleted successfully");
        fetchLabels();
        table.toggleAllPageRowsSelected(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete labels");
    }
  };

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      {selectedRowsCount > 0 && (
        <div className="w-full fixed bottom-0 z-50 left-0 right-0 max-w-4xl mx-auto bg-muted shadow-lg border border-primary rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">{selectedRowsCount} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Delete Labels
            </Button>
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
            Total Labels: {total}
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

// Main component with Suspense boundary
export default function LabeledEventsTable() {
  return (
    <Suspense fallback={<EventTableSkeleton />}>
      <LabeledEventsTableContent />
    </Suspense>
  );
}
