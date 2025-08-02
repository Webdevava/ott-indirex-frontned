/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LabelService, CreateLabelSchema, CreateLabel } from "@/services/labels.service";

interface LabelEventsDialogProps {
  selectedEventIds: string[];
  onSuccess?: () => void;
}

interface BrandData {
  name: string;
  products: {
    name: string;
    category: string;
    sector: string;
  }[];
}

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
  className?: string;
}

function Combobox({ 
  value, 
  onValueChange, 
  options, 
  placeholder, 
  searchPlaceholder, 
  disabled = false,
  className = "w-full"
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function LabelEventsDialog({ selectedEventIds, onSuccess }: LabelEventsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandsData, setBrandsData] = useState<BrandData[]>([]);
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  const form = useForm<CreateLabel>({
    resolver: zodResolver(CreateLabelSchema),
    defaultValues: {
      event_ids: selectedEventIds,
      label_type: undefined,
      notes: "Label created for selected events",
      song: undefined,
      ad: undefined,
      error: undefined,
      program: undefined,
    },
  });

  const labelType = form.watch("label_type");
  const selectedBrand = form.watch("ad.brand");

  // Load brands data
  useEffect(() => {
    const loadBrandsData = async () => {
      try {
        const response = await fetch('/data/brands.json');
        const data = await response.json();
        setBrandsData(data);
      } catch (error) {
        console.error('Failed to load brands data:', error);
        // Fallback data structure
        setBrandsData([]);
      }
    };

    loadBrandsData();
  }, []);

  // Get unique brand options
  const brandOptions = [
    ...brandsData.map(brand => ({
      value: brand.name,
      label: brand.name
    })),
    { value: "other", label: "Other (Custom Brand)" }
  ];

  // Get products for selected brand
  const getProductsForBrand = (brandName: string) => {
    const brand = brandsData.find(b => b.name === brandName);
    return brand ? brand.products : [];
  };

  // Get product options for selected brand
  const productOptions = selectedBrand && selectedBrand !== "other"
    ? getProductsForBrand(selectedBrand).map(product => ({
        value: product.name,
        label: product.name
      }))
    : [];

  // Get categories for selected brand
  const categoryOptions = selectedBrand && selectedBrand !== "other"
    ? [...new Set(getProductsForBrand(selectedBrand).map(p => p.category))].map(category => ({
        value: category,
        label: category
      }))
    : [];

  // Get sectors for selected brand
  const sectorOptions = selectedBrand && selectedBrand !== "other"
    ? [...new Set(getProductsForBrand(selectedBrand).map(p => p.sector))].map(sector => ({
        value: sector,
        label: sector
      }))
    : [];

  const onSubmit = async (data: CreateLabel) => {
    setIsSubmitting(true);
    try {
      const response = await LabelService.createLabel(data);
      if (response.success) {
        toast.success(response.message || "Label created successfully");
        setOpen(false);
        form.reset();
        setIsCustomBrand(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create label");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle brand selection
  const handleBrandChange = (value: string) => {
    form.setValue("ad.brand", value);
    if (value === "other") {
      setIsCustomBrand(true);
      // Clear other fields when switching to custom
      form.setValue("ad.product", "");
      form.setValue("ad.category", "");
      form.setValue("ad.sector", "");
    } else {
      setIsCustomBrand(false);
      // Clear other fields when switching brands
      form.setValue("ad.product", "");
      form.setValue("ad.category", "");
      form.setValue("ad.sector", "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={selectedEventIds.length === 0}>
          Label {selectedEventIds.length} Event{selectedEventIds.length === 1 ? "" : "s"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Label</DialogTitle>
          <DialogDescription>
            Create a new label for {selectedEventIds.length} selected event{selectedEventIds.length === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="label_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset other fields when label type changes
                      form.setValue("song", undefined);
                      form.setValue("ad", undefined);
                      form.setValue("error", undefined);
                      form.setValue("program", undefined);
                      setIsCustomBrand(false);
                    }}
                    value={field.value || ""}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select label type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="song">Song</SelectItem>
                      <SelectItem value="ad">Ad</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {labelType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labelType === "song" && (
                  <>
                    <FormField
                      control={form.control}
                      name="song.song_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Song Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter song name" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="song.artist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artist</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter artist" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="song.album"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Album</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter album" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="song.language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter language" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="song.release_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="Enter release year"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {labelType === "ad" && (
                  <>
                    <FormField
                      control={form.control}
                      name="ad.type"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Ad Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ad type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="COMMERCIAL_BREAK">Commercial Break</SelectItem>
                              <SelectItem value="SPOT_OUTSIDE_BREAK">Spot Outside Break</SelectItem>
                              <SelectItem value="AUTO_PROMO">Auto Promo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ad.brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Combobox
                              value={field.value ?? ""}
                              onValueChange={handleBrandChange}
                              options={brandOptions}
                              placeholder="Select brand..."
                              searchPlaceholder="Search brands..."
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isCustomBrand ? (
                      <>
                        <FormField
                          control={form.control}
                          name="ad.product"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} placeholder="Enter product" disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ad.category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} placeholder="Enter category" disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ad.sector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sector</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} placeholder="Enter sector" disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    ) : (
                      selectedBrand && selectedBrand !== "other" && (
                        <>
                          <FormField
                            control={form.control}
                            name="ad.product"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product</FormLabel>
                                <FormControl>
                                  <Combobox
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                    options={productOptions}
                                    placeholder="Select product..."
                                    searchPlaceholder="Search products..."
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ad.category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                  <Combobox
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                    options={categoryOptions}
                                    placeholder="Select category..."
                                    searchPlaceholder="Search categories..."
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ad.sector"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sector</FormLabel>
                                <FormControl>
                                  <Combobox
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}
                                    options={sectorOptions}
                                    placeholder="Select sector..."
                                    searchPlaceholder="Search sectors..."
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )
                    )}

                    <FormField
                      control={form.control}
                      name="ad.format"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Format</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ""} 
                            disabled={isSubmitting}
                            defaultValue="CAPB"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CAPB">In Program Adv</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {labelType === "error" && (
                  <FormField
                    control={form.control}
                    name="error.error_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Error Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select error type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO_SIGNAL">No Signal</SelectItem>
                            <SelectItem value="BLANK_IMAGE">Blank Image</SelectItem>
                            <SelectItem value="AUDIO_ISSUE">Audio Issue</SelectItem>
                            <SelectItem value="VIDEO_ISSUE">Video Issue</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {labelType === "program" && (
                  <>
                    <FormField
                      control={form.control}
                      name="program.program_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter program name" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="program.genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Action">Action</SelectItem>
                              <SelectItem value="Adventure">Adventure</SelectItem>
                              <SelectItem value="Animation">Animation</SelectItem>
                              <SelectItem value="Biography">Biography</SelectItem>
                              <SelectItem value="Comedy">Comedy</SelectItem>
                              <SelectItem value="Crime">Crime</SelectItem>
                              <SelectItem value="Documentary">Documentary</SelectItem>
                              <SelectItem value="Drama">Drama</SelectItem>
                              <SelectItem value="Family">Family</SelectItem>
                              <SelectItem value="Fantasy">Fantasy</SelectItem>
                              <SelectItem value="History">History</SelectItem>
                              <SelectItem value="Horror">Horror</SelectItem>
                              <SelectItem value="Music">Music</SelectItem>
                              <SelectItem value="Musical">Musical</SelectItem>
                              <SelectItem value="Mystery">Mystery</SelectItem>
                              <SelectItem value="News">News</SelectItem>
                              <SelectItem value="Reality TV">Reality TV</SelectItem>
                              <SelectItem value="Romance">Romance</SelectItem>
                              <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                              <SelectItem value="Sport">Sport</SelectItem>
                              <SelectItem value="Talk Show">Talk Show</SelectItem>
                              <SelectItem value="Thriller">Thriller</SelectItem>
                              <SelectItem value="War">War</SelectItem>
                              <SelectItem value="Western">Western</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="program.episode_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Episode Number</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="Enter episode number"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="program.season_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season Number</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="Enter season number"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="program.language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter language" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} placeholder="Enter notes" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Label"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}