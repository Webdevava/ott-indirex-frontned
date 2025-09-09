/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Pencil } from "lucide-react";
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
import { LabelService, UpdateLabelSchema, UpdateLabel, Label } from "@/services/labels.service";

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
  className = "w-full",
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
                  onSelect={(currentValue: string) => {
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

interface EditLabelDialogProps {
  label: Label;
  onSuccess?: () => void;
}

export function EditLabelDialog({ label, onSuccess }: EditLabelDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandsData, setBrandsData] = useState<BrandData[]>([]);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSport, setIsCustomSport] = useState(false);

  const form = useForm<UpdateLabel>({
    resolver: zodResolver(UpdateLabelSchema),
    defaultValues: {
      event_ids: label.event_ids,
      label_type: label.label_type,
      notes: label.notes || "",
      song: label.song || undefined,
      ad: label.ad || undefined,
      error: label.error || undefined,
      program: label.program || undefined,
      movie: label.movie || undefined,
      promo: label.promo || undefined,
      sports: label.sports || undefined,
    },
  });

  const labelType = form.watch("label_type");
  const selectedBrand = form.watch("ad.brand");
  const selectedProduct = form.watch("ad.product");
  const adType = form.watch("ad.type") as "COMMERCIAL_BREAK" | "SPOT_OUTSIDE_BREAK" | "PSA" | undefined;
  const selectedCategory = form.watch("ad.category");
  const selectedSportType = form.watch("sports.sport_type");

  // Load brands data
  useEffect(() => {
    const loadBrandsData = async () => {
      try {
        const response = await fetch("/data/brands.json");
        const data = await response.json();
        setBrandsData(data);
      } catch (error) {
        console.error("Failed to load brands data:", error);
        setBrandsData([]);
      }
    };

    loadBrandsData();
  }, []);

  // Initialize custom brand, category, and sport states based on initial label data
  useEffect(() => {
    if (label.label_type === "ad" && label.ad) {
      if (label.ad.type === "PSA") {
        setIsCustomBrand(true);
        if (
          label.ad.category &&
          ![
            "Health Awareness",
            "Education",
            "Environmental Protection",
            "Public Safety",
            "Social Welfare",
            "Civic Engagement",
            "Anti-Drug Campaigns",
            "Road Safety",
            "Child Welfare",
            "Women Empowerment",
            "Disaster Preparedness",
            "Consumer Rights",
            "Financial Literacy",
            "Agricultural Development",
            "Tourism Promotion",
          ].includes(label.ad.category)
        ) {
          setIsCustomCategory(true);
        }
      } else if (label.ad && label.ad.brand && !brandsData.some((b) => b.name === label.ad!.brand)) {
        setIsCustomBrand(true);
      }
    }
    if (label.label_type === "sports" && label.sports) {
      if (
        label.sports.sport_type &&
        ![
          "Football", "Basketball", "Cricket", "Tennis", "Baseball", "Soccer",
          "Hockey", "Rugby", "Volleyball", "Golf", "Swimming", "Athletics",
          "Boxing", "Cycling", "Wrestling"
        ].includes(label.sports.sport_type)
      ) {
        setIsCustomSport(true);
      }
    }
  }, [label, brandsData]);

  // Auto-select category and sector when product is selected for non-PSA ads
  useEffect(() => {
    if (selectedBrand && selectedBrand !== "other" && selectedProduct && adType !== "PSA") {
      const brand = brandsData.find((b) => b.name === selectedBrand);
      if (brand) {
        const product = brand.products.find((p) => p.name === selectedProduct);
        if (product) {
          form.setValue("ad.category", product.category);
          form.setValue("ad.sector", product.sector);
        }
      }
    }
    // For PSA, set sector to Public Interest
    if (adType === "PSA") {
      form.setValue("ad.sector", "Public Interest");
    }
  }, [selectedProduct, selectedBrand, brandsData, form, adType]);

  // Handle PSA brand logic
  useEffect(() => {
    if (adType === "PSA") {
      setIsCustomBrand(true);
      if (!selectedCategory || selectedCategory === "Other") {
        form.setValue("ad.category", "");
      }
      if (!selectedProduct) {
        form.setValue("ad.product", "");
      }
    } else if (adType === "COMMERCIAL_BREAK" || adType === "SPOT_OUTSIDE_BREAK") {
      if (!selectedBrand || selectedBrand === "other") {
        setIsCustomBrand(false);
        form.setValue("ad.category", "");
        form.setValue("ad.product", "");
        form.setValue("ad.sector", "");
      }
    }
    setIsCustomCategory(false);
  }, [adType, form, selectedBrand, selectedCategory, selectedProduct]);

  // Handle custom category toggle
  useEffect(() => {
    if (selectedCategory === "Other") {
      setIsCustomCategory(true);
      form.setValue("ad.category", "");
    } else {
      setIsCustomCategory(false);
    }
  }, [selectedCategory, form]);

  // Handle custom sport type toggle
  useEffect(() => {
    if (selectedSportType === "Other") {
      setIsCustomSport(true);
      form.setValue("sports.sport_type", "");
    } else {
      setIsCustomSport(false);
    }
  }, [selectedSportType, form]);

  // Sync promo.event_name with promo.program_name and promo.movie_name
  useEffect(() => {
    if (labelType === "promo") {
      const eventName = form.getValues("promo.event_name");
      if (eventName) {
        form.setValue("promo.program_name", eventName);
        form.setValue("promo.movie_name", eventName);
      }
    }
  }, [form.watch("promo.event_name"), labelType, form]);

  // Get unique brand options
  const brandOptions = [
    ...brandsData.map((brand) => ({
      value: brand.name,
      label: adType === "PSA" ? brand.name : brand.name,
    })),
    { value: "other", label: adType === "PSA" ? "Other (Custom Title)" : "Other (Custom Brand)" },
  ];

  // Get products for selected brand
  const getProductsForBrand = (brandName: string) => {
    const brand = brandsData.find((b) => b.name === brandName);
    return brand ? brand.products : [];
  };

  // Get product options for selected brand
  const productOptions =
    selectedBrand && selectedBrand !== "other" && adType !== "PSA"
      ? getProductsForBrand(selectedBrand).map((product) => ({
          value: product.name,
          label: product.name,
        }))
      : [];

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!labelType) return false;

    const watchedValues = form.watch();

    switch (labelType) {
      case "song":
        return !!(
          watchedValues.song?.song_name &&
          watchedValues.song?.artist &&
          watchedValues.song?.album &&
          watchedValues.song?.language &&
          watchedValues.song?.release_year
        );

      case "ad":
        const adValid = !!(
          watchedValues.ad?.type &&
          watchedValues.ad?.format
        );

        if (watchedValues.ad?.type === "PSA") {
          return (
            adValid &&
            !!(
              watchedValues.ad?.brand &&
              watchedValues.ad?.product &&
              watchedValues.ad?.category &&
              watchedValues.ad?.sector
            )
          );
        } else if (isCustomBrand) {
          return (
            adValid &&
            !!(
              watchedValues.ad?.brand &&
              watchedValues.ad?.product &&
              watchedValues.ad?.category &&
              watchedValues.ad?.sector
            )
          );
        } else if (watchedValues.ad?.brand && watchedValues.ad?.brand !== "other") {
          return (
            adValid &&
            !!(
              watchedValues.ad?.brand &&
              watchedValues.ad?.product &&
              watchedValues.ad?.category &&
              watchedValues.ad?.sector
            )
          );
        }
        return adValid;

      case "error":
        return !!(watchedValues.error?.error_type);

      case "program":
        return !!(
          watchedValues.program?.program_name &&
          watchedValues.program?.genre &&
          watchedValues.program?.language
        );

      case "movie":
        return !!(
          watchedValues.movie?.movie_name &&
          watchedValues.movie?.genre &&
          watchedValues.movie?.director &&
          watchedValues.movie?.language &&
          watchedValues.movie?.release_year &&
          watchedValues.movie?.duration &&
          watchedValues.movie?.rating
        );

      case "promo":
        return !!(watchedValues.promo?.promo_type && watchedValues.promo?.event_name);

      case "sports":
        return !!(
          watchedValues.sports?.program_title &&
          watchedValues.sports?.sport_type &&
          watchedValues.sports?.program_category
        );

      default:
        return false;
    }
  };

  const onSubmit = async (data: UpdateLabel) => {
    setIsSubmitting(true);
    try {
      const response = await LabelService.updateLabel(label.id, data);
      if (response.success) {
        toast.success(response.message || "Label updated successfully");
        setOpen(false);
        form.reset();
        setIsCustomBrand(false);
        setIsCustomCategory(false);
        setIsCustomSport(false);
        onSuccess?.();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update label");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle brand selection
  const handleBrandChange = (value: string) => {
    form.setValue("ad.brand", value);
    if (value === "other") {
      setIsCustomBrand(true);
      form.setValue("ad.product", "");
      form.setValue("ad.category", "");
      if (adType !== "PSA") {
        form.setValue("ad.sector", "");
      }
    } else {
      setIsCustomBrand(false);
      form.setValue("ad.product", "");
      form.setValue("ad.category", "");
      if (adType !== "PSA") {
        form.setValue("ad.sector", "");
      }
    }
    setIsCustomCategory(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Edit label">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Label</DialogTitle>
          <DialogDescription>
            Edit the label with ID {label.id}.
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
                      // Reset all label type fields when label type changes
                      form.setValue("song", undefined);
                      form.setValue("ad", undefined);
                      form.setValue("error", undefined);
                      form.setValue("program", undefined);
                      form.setValue("movie", undefined);
                      form.setValue("promo", undefined);
                      form.setValue("sports", undefined);
                      setIsCustomBrand(false);
                      setIsCustomCategory(false);
                      setIsCustomSport(false);
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
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="promo">Promo</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
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
                          <FormLabel>Song Name *</FormLabel>
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
                          <FormLabel>Artist *</FormLabel>
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
                          <FormLabel>Album *</FormLabel>
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
                          <FormLabel>Language *</FormLabel>
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
                          <FormLabel>Release Year *</FormLabel>
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
                          <FormLabel>Ad Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ad type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="COMMERCIAL_BREAK">Commercial Break</SelectItem>
                              <SelectItem value="SPOT_OUTSIDE_BREAK">Spot Outside Break</SelectItem>
                              <SelectItem value="PSA">Public Service Announcement</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {adType === "PSA" ? (
                      <>
                        <FormField
                          control={form.control}
                          name="ad.brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Enter title"
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ad.product"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Source *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Central Government">Central Government</SelectItem>
                                  <SelectItem value="State Government">State Government</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ad.category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  if (value !== "Other") {
                                    form.setValue("ad.category", value);
                                  }
                                }}
                                value={field.value || ""}
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Health Awareness">Health Awareness</SelectItem>
                                  <SelectItem value="Education">Education</SelectItem>
                                  <SelectItem value="Environmental Protection">Environmental Protection</SelectItem>
                                  <SelectItem value="Public Safety">Public Safety</SelectItem>
                                  <SelectItem value="Social Welfare">Social Welfare</SelectItem>
                                  <SelectItem value="Civic Engagement">Civic Engagement</SelectItem>
                                  <SelectItem value="Anti-Drug Campaigns">Anti-Drug Campaigns</SelectItem>
                                  <SelectItem value="Road Safety">Road Safety</SelectItem>
                                  <SelectItem value="Child Welfare">Child Welfare</SelectItem>
                                  <SelectItem value="Women Empowerment">Women Empowerment</SelectItem>
                                  <SelectItem value="Disaster Preparedness">Disaster Preparedness</SelectItem>
                                  <SelectItem value="Consumer Rights">Consumer Rights</SelectItem>
                                  <SelectItem value="Financial Literacy">Financial Literacy</SelectItem>
                                  <SelectItem value="Agricultural Development">Agricultural Development</SelectItem>
                                  <SelectItem value="Tourism Promotion">Tourism Promotion</SelectItem>
                                  <SelectItem value="Other">Other (Custom Category)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {isCustomCategory && (
                          <FormField
                            control={form.control}
                            name="ad.category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Category *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder="Enter custom category"
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name="ad.sector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sector</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value="Public Interest"
                                  disabled={true}
                                  className="bg-gray-50"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ad.language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Enter language"
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ad.format"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Format *</FormLabel>
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
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="ad.brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand *</FormLabel>
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
                                  <FormLabel>Product *</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ""}
                                      placeholder="Enter product"
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
                                  <FormLabel>Category *</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ""}
                                      placeholder="Enter category"
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
                                  <FormLabel>Sector *</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ""}
                                      placeholder="Enter sector"
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="ad.format"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Format *</FormLabel>
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
                            <FormField
                              control={form.control}
                              name="ad.language"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Language</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ""}
                                      placeholder="Enter language"
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        ) : (
                          selectedBrand &&
                          selectedBrand !== "other" && (
                            <>
                              <FormField
                                control={form.control}
                                name="ad.product"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Product *</FormLabel>
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
                                      <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="Auto-selected based on product"
                                        disabled={true}
                                        className="bg-gray-50"
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
                                      <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="Auto-selected based on product"
                                        disabled={true}
                                        className="bg-gray-50"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="ad.format"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Format *</FormLabel>
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
                              <FormField
                                control={form.control}
                                name="ad.language"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="Enter language"
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
                      </>
                    )}
                  </>
                )}

                {labelType === "error" && (
                  <FormField
                    control={form.control}
                    name="error.error_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Error Type *</FormLabel>
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
                          <FormLabel>Program Name *</FormLabel>
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
                          <FormLabel>Genre *</FormLabel>
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
                          <FormLabel>Language *</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter language" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {labelType === "movie" && (
                  <>
                    <FormField
                      control={form.control}
                      name="movie.movie_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Movie Name *</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter movie name" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="movie.genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre *</FormLabel>
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
                              <SelectItem value="Romance">Romance</SelectItem>
                              <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
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
                      name="movie.director"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Director *</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter director" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="movie.release_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Year *</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="movie.language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language *</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter language" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="movie.duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="Enter duration in minutes"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="movie.rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="G">G - All ages, suitable for everyone.</SelectItem>
                              <SelectItem value="PG">PG - Parental guidance, may not suit kids.</SelectItem>
                              <SelectItem value="PG-13">PG-13 - Caution for under 13, mature themes.</SelectItem>
                              <SelectItem value="R">R - Under 17 needs adult, adult content.</SelectItem>
                              <SelectItem value="NC-17">NC-17 - Adults only, explicit content.</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {labelType === "promo" && (
                  <>
                    <FormField
                      control={form.control}
                      name="promo.promo_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promo Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select promo type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TRAILER">Trailer</SelectItem>
                              <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                              <SelectItem value="TEASER">Teaser</SelectItem>
                              <SelectItem value="PROMO_SPOT">Promo Spot</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="promo.event_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Enter event name"
                              disabled={isSubmitting}
                              onChange={(e) => {
                                field.onChange(e);
                                form.setValue("promo.program_name", e.target.value);
                                form.setValue("promo.movie_name", e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {labelType === "sports" && (
                  <>
                    <FormField
                      control={form.control}
                      name="sports.program_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program Title *</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Enter program title" disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sports.sport_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sport Type *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value !== "Other") {
                                form.setValue("sports.sport_type", value);
                              }
                            }}
                            value={field.value || ""}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sport type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Football">Football</SelectItem>
                              <SelectItem value="Basketball">Basketball</SelectItem>
                              <SelectItem value="Cricket">Cricket</SelectItem>
                              <SelectItem value="Tennis">Tennis</SelectItem>
                              <SelectItem value="Baseball">Baseball</SelectItem>
                              <SelectItem value="Soccer">Soccer</SelectItem>
                              <SelectItem value="Hockey">Hockey</SelectItem>
                              <SelectItem value="Rugby">Rugby</SelectItem>
                              <SelectItem value="Volleyball">Volleyball</SelectItem>
                              <SelectItem value="Golf">Golf</SelectItem>
                              <SelectItem value="Swimming">Swimming</SelectItem>
                              <SelectItem value="Athletics">Athletics</SelectItem>
                              <SelectItem value="Boxing">Boxing</SelectItem>
                              <SelectItem value="Cycling">Cycling</SelectItem>
                              <SelectItem value="Wrestling">Wrestling</SelectItem>
                              <SelectItem value="Other">Other (Custom Sport)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isCustomSport && (
                      <FormField
                        control={form.control}
                        name="sports.sport_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Sport Type *</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} placeholder="Enter custom sport type" disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="sports.program_category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select program category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Live Match">Live Match</SelectItem>
                              <SelectItem value="Highlights">Highlights</SelectItem>
                              <SelectItem value="Analysis">Analysis</SelectItem>
                              <SelectItem value="Documentary">Documentary</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sports.language"
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
              <Button type="submit" disabled={isSubmitting || !isFormValid()}>
                {isSubmitting ? "Updating..." : "Update Label"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}