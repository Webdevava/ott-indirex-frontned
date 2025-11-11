/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useEffect,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon, RefreshCw, Settings2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EventService,
  GetEventsOptions,
  Event,
} from "@/services/events.service";
import DeviceEventFilters from "./device-event-filters";
import { TooltipList } from "@/components/ui/tooltip-list";

// Helper to generate random hash
const generateFingerprint = () => {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 12; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash.slice(0, 3) + "..." + hash.slice(-3);
};

const columns: ColumnDef<Event>[] = [
  {
    header: "Device ID",
    accessorKey: "device_id",
    size: 100,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => {
      const type = row.getValue("type") as number;
      const label =
        type === 29 ? "Recognized" : type === 33 ? "Unrecognized" : "Unknown";
      return <p className="text-left">{label}</p>;
    },
    size: 100,
    enableSorting: false,
  },
  {
    header: "Max Score",
    accessorKey: "max_score",
    cell: ({ row }) => {
      const score = row.getValue("max_score") as number | null;
      return (
        <div className="flex items-center">
          <span
            className={cn(
              "font-medium",
              score === null || score === 0
                ? "text-muted-foreground"
                : "text-foreground"
            )}
          >
            {score !== null ? score?.toFixed(2) : "N/A"}
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
    size: 160,
    enableSorting: false,
    cell: ({ row }) => {
      const channels = (row.getValue("channels") as Event["channels"]) ?? [];
      if (!channels.length) return <span className="text-muted-foreground text-sm">-</span>;

      const preview = channels
        .slice(0, 5)
        .map((c: any) => c.name)
        .join(", ");
      const hasMore = channels.length > 5;

      const items = channels.map((c: any) => ({
        id: c.id,
        name: c.name,
        score: c.score,
      }));

      return (
        <TooltipList items={items}>
          <span
            className={cn(
              "text-sm block truncate",
              hasMore && "pr-6 relative"
            )}
          >
            {preview}
            {hasMore && (
              <span className="absolute right-0 top-0 text-xs text-muted-foreground">
                +{channels.length - 5}
              </span>
            )}
          </span>
        </TooltipList>
      );
    },
  },
  {
    header: "Ads",
    accessorKey: "ads",
    size: 160,
    enableSorting: false,
    cell: ({ row }) => {
      const ads = (row.getValue("ads") as Event["ads"]) ?? [];
      if (!ads.length) return <span className="text-muted-foreground text-sm">-</span>;

      const preview = ads.slice(0, 5).map((a: any) => a.name).join(", ");
      const hasMore = ads.length > 5;

      const items = ads.map((a: any) => ({
        id: a.id,
        name: a.name,
      }));

      return (
        <TooltipList items={items}>
          <span
            className={cn(
              "text-sm block truncate",
              hasMore && "pr-6 relative"
            )}
          >
            {preview}
            {hasMore && (
              <span className="absolute right-0 top-0 text-xs text-muted-foreground">
                +{ads.length - 5}
              </span>
            )}
          </span>
        </TooltipList>
      );
    },
  },
  {
    header: "Content",
    accessorKey: "content",
    size: 160,
    enableSorting: false,
    cell: ({ row }) => {
      const content = (row.getValue("content") as Event["content"]) ?? [];
      if (!content.length) return <span className="text-muted-foreground text-sm">-</span>;

      const preview = content.slice(0, 5).map((i: any) => i.name).join(", ");
      const hasMore = content.length > 5;

      const items = content.map((i: any) => ({
        id: i.id,
        name: i.name,
        score: i.score,
      }));

      return (
        <TooltipList items={items}>
          <span
            className={cn(
              "text-sm block truncate",
              hasMore && "pr-6 relative"
            )}
          >
            {preview}
            {hasMore && (
              <span className="absolute right-0 top-0 text-xs text-muted-foreground">
                +{content.length - 5}
              </span>
            )}
          </span>
        </TooltipList>
      );
    },
  },
  {
    header: "OCR",
    accessorKey: "ocr",
    size: 320,
    enableSorting: false,
    cell: ({ row }) => {
      const ocr = (row.getValue("ocr") as { id: number; text: string }[] | null) ?? [];
      if (!ocr.length) return <span className="text-muted-foreground text-sm">-</span>;

      const preview = ocr
        .slice(0, 3)
        .map((o) => (o.text ? o.text.split("\n")[0] : "(empty)"))
        .join(" • ");
      const hasMore = ocr.length > 3;

      const items = ocr.map((o) => ({
        id: o.id,
        name: o.text || "(empty)",
      }));

      return (
        <TooltipList items={items}>
          <span
            className={cn(
              "text-sm block truncate",
              hasMore && "pr-6 relative"
            )}
          >
            {preview}
            {hasMore && (
              <span className="absolute right-0 top-0 text-xs text-muted-foreground">
                +{ocr.length - 3}
              </span>
            )}
          </span>
        </TooltipList>
      );
    },
  },
  {
    header: "Faces",
    accessorKey: "faces",
    size: 160,
    enableSorting: false,
    cell: ({ row }) => {
      const faces = (row.getValue("faces") as Event["faces"]) ?? [];
      if (!faces.length) return <span className="text-muted-foreground text-sm">-</span>;

      const preview = faces.slice(0, 5).map((f: any) => f.name).join(", ");
      const hasMore = faces.length > 5;

      const items = faces.map((f: any) => ({
        id: f.id,
        name: f.name,
        score: f.score,
      }));

      return (
        <TooltipList items={items}>
          <span
            className={cn(
              "text-sm block truncate",
              hasMore && "pr-6 relative"
            )}
          >
            {preview}
            {hasMore && (
              <span className="absolute right-0 top-0 text-xs text-muted-foreground">
                +{faces.length - 5}
              </span>
            )}
          </span>
        </TooltipList>
      );
    },
  },
  {
    header: "TimeStamp",
    accessorKey: "timestamp",
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp") as string;
      const unixTimestamp = parseInt(timestamp);
      const date = new Date(unixTimestamp * 1000);
      const humanReadable = date.toLocaleString("en-IN");
      return <div className="text-sm truncate">{humanReadable}</div>;
    },
    size: 160,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Image",
    accessorKey: "image_path",
    cell: ({ row }) => {
      const imagePath = row.getValue("image_path") as string | null;
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
              className="w-16 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<span class="text-muted-foreground text-sm">Image error</span>';
                }
              }}
            />
          </DialogTrigger>
          <DialogContent className="max-w-7xl w-full">
            <img
              src={imagePath}
              alt={`Event ${eventId}`}
              className="w-full h-full max-w-6xl object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<div class="text-center text-muted-foreground">Failed to load image</div>';
                }
              }}
            />
          </DialogContent>
        </Dialog>
      );
    },
    size: 80,
    enableSorting: false,
  },
  // New Fingerprint Column
  {
    id: "fingerprint",
    header: "Fingerprint",
    size: 100,
    enableSorting: false,
    cell: () => {
      const hash = generateFingerprint();
      return (
        <span className="text-xs font-mono text-muted-foreground">
          {hash}
        </span>
      );
    },
  },
];

/* ────────────────────────────────────── Helpers ────────────────────────────────────── */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts?.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

/* ────────────────────────────────────── Main Component ────────────────────────────────────── */
function DeviceEventTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = 10;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [rawData, setRawData] = useState<Event[]>([]);
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<GetEventsOptions>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    image_path: false,
    ocr: false,
    faces: false,
    ads: false,
    content: false,
    fingerprint: false, // Hidden by default
  });

  const userRole = getCookie("auth_user_role");

  /* ───── URL → filters ───── */
  useEffect(() => {
    const urlFilters: GetEventsOptions = {};

    const deviceIdParam = searchParams.get("deviceId");
    if (deviceIdParam) urlFilters.deviceId = deviceIdParam;

    const sortParam = searchParams.get("sort");
    urlFilters.sort = sortParam === "asc" || sortParam === "desc" ? sortParam : "desc";

    const startDateParam = searchParams.get("startDate");
    const startTimeParam = searchParams.get("startTime");
    const endTimeParam = searchParams.get("endTime");

    if (startDateParam && startTimeParam) {
      try {
        const [y, m, d] = startDateParam.split("-").map(Number);
        const [h, min] = startTimeParam.split(":").map(Number);
        urlFilters.startDate = new Date(y, m - 1, d, h, min);
      } catch { }
    }
    if (startDateParam && endTimeParam) {
      try {
        const [y, m, d] = startDateParam.split("-").map(Number);
        const [h, min] = endTimeParam.split(":").map(Number);
        urlFilters.endDate = new Date(y, m - 1, d, h, min, 59, 999);
      } catch { }
    }

    const categoryParam = searchParams.get("category");
    if (categoryParam && ["all", "ads", "channels", "content"].includes(categoryParam)) {
      urlFilters.category = categoryParam as any;
    }

    const eventTypeParam = searchParams.get("eventType");
    if (eventTypeParam && ["all", "recognized", "unrecognized"].includes(eventTypeParam)) {
      if (eventTypeParam === "recognized") urlFilters.types = [29];
      if (eventTypeParam === "unrecognized") urlFilters.types = [33];
    }

    setFilters(urlFilters);
  }, [searchParams]);

  /* ───── filters → URL ───── */
  const updateURLParams = (newFilters: GetEventsOptions) => {
    const p = new URLSearchParams();

    if (newFilters.deviceId) p.set("deviceId", newFilters.deviceId);
    if (newFilters.sort) p.set("sort", newFilters.sort);
    if (newFilters.startDate) {
      const d = newFilters.startDate instanceof Date ? newFilters.startDate : new Date(newFilters.startDate);
      p.set(
        "startDate",
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
      p.set("startTime", formatTime(d));
    }
    if (newFilters.endDate) {
      const d = newFilters.endDate instanceof Date ? newFilters.endDate : new Date(newFilters.endDate);
      p.set("endTime", formatTime(d));
    }
    if (newFilters.category && newFilters.category !== "all") p.set("category", newFilters.category);
    if (newFilters.types) {
      const ev = newFilters.types[0] === 29 ? "recognized" : newFilters.types[0] === 33 ? "unrecognized" : "all";
      if (ev !== "all") p.set("eventType", ev);
    }

    router.replace(p.toString() ? `?${p.toString()}` : window.location.pathname);
  };

  /* ───── fetch ───── */
  const fetchEvents = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await EventService.getEvents({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      });

      if (res.success && res.data) {
        setRawData(res.data.events || []);
        setTotalPages(res.data.totalPages || 0);
        setTotal(res.data.total || 0);
        setLastRefresh(new Date());
      } else {
        toast.error(res.message || "Failed");
        setRawData([]); setTotalPages(0); setTotal(0);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed");
      setRawData([]); setTotalPages(0); setTotal(0);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  /* ───── Apply 5-second gap filtering ───── */
  useEffect(() => {
    if (!rawData.length) {
      setData([]);
      return;
    }

    const filtered: Event[] = [];
    let lastShownTimestamp: number | null = null;

    const sorted = [...rawData].sort((a, b) => {
      const tsA = parseInt(a.timestamp);
      const tsB = parseInt(b.timestamp);
      return tsB - tsA;
    });

    for (const event of sorted) {
      const currentTs = parseInt(event.timestamp);
      if (lastShownTimestamp === null || (lastShownTimestamp - currentTs) >= 5) {
        filtered.push(event);
        lastShownTimestamp = currentTs;
      }
    }

    setData(filtered);
  }, [rawData]);

  /* ───── auto-refresh ───── */
  useEffect(() => {
    const id = setInterval(() => fetchEvents(true), 60_000);
    return () => clearInterval(id);
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  useEffect(() => {
    fetchEvents();
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  const handleFilterChange = (nf: GetEventsOptions) => {
    setFilters(nf);
    updateURLParams(nf);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleManualRefresh = () => fetchEvents(true);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    state: { 
      pagination,
      columnVisibility,
    },
  });

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages,
    paginationItemsToDisplay: 10,
  });

  const visibleColumnCount = table.getAllColumns().filter(col => col.getIsVisible()).length;
  const totalColumnCount = table.getAllColumns().length;

  return (
    <div className="space-y-4 relative max-w-7xl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 max-sm:flex-col">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Total Events: {total} (Showing {data.length} after 5s gap filter)
            </span>
            {(loading || isRefreshing) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                {loading ? "Loading..." : "Refreshing..."}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Columns
                <Badge variant="secondary" className="ml-1 text-xs">
                  {visibleColumnCount}/{totalColumnCount}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Toggle columns</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    const allHidden = table.getAllColumns()
                      .filter(col => col.getCanHide())
                      .every(col => !col.getIsVisible());
                    
                    table.getAllColumns()
                      .filter(col => col.getCanHide())
                      .forEach(col => col.toggleVisibility(!allHidden));
                  }}
                >
                  {table.getAllColumns().filter(col => col.getCanHide()).every(col => !col.getIsVisible()) 
                    ? "Show All" 
                    : "Hide All"}
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const isVisible = column.getIsVisible();
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize cursor-pointer"
                      checked={isVisible}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{column.id === "fingerprint" ? "Fingerprint" : column.id.replace(/_/g, " ")}</span>
                        {isVisible ? (
                          <Eye className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                        )}
                      </div>
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Pagination & Filters ── */}
      <div className="flex items-center justify-between gap-3 max-sm:flex-col">
        <p className="text-muted-foreground flex-1 text-sm whitespace-nowrap" aria-live="polite">
          Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
          <span className="text-foreground">{totalPages}</span>
        </p>

        <div className="flex items-center flex-wrap divide-x-2">
          <div className="">
            <DeviceEventFilters
              onFilterChange={handleFilterChange}
              userRole={userRole}
              initialFilters={filters}
            />
          </div>

          <div className="flex flex-1 justify-end">
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(v) => table.setPageSize(Number(v))}
              disabled={loading}
            >
              <SelectTrigger className="w-fit whitespace-nowrap mx-2">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((s) => (
                  <SelectItem key={s} value={s.toString()}>
                    {s} / page
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
                    className="size-7 disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage() || loading}
                  >
                    <ChevronLeftIcon size={16} />
                  </Button>
                </PaginationItem>

                {showLeftEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {pages.map((p) => {
                  const active = p === table.getState().pagination.pageIndex + 1;
                  return (
                    <PaginationItem key={p}>
                      <Button
                        size="icon"
                        variant={active ? "default" : "ghost"}
                        onClick={() => table.setPageIndex(p - 1)}
                        className="size-6"
                        disabled={loading}
                      >
                        {p}
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
                    className="size-7 disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage() || loading}
                  >
                    <ChevronRightIcon size={16} />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    style={{ width: `${h.getSize()}px` }}
                    className="h-11"
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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

/* ────────────────────────────────────── Skeleton ────────────────────────────────────── */
function DeviceEventTableSkeleton() {
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

/* ────────────────────────────────────── Export ────────────────────────────────────── */
export default function DeviceEventTable() {
  return (
    <Suspense fallback={<DeviceEventTableSkeleton />}>
      <DeviceEventTableContent />
    </Suspense>
  );
}