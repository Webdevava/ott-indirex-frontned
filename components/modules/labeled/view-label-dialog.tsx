/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label, LabelSong, LabelAd, LabelError, LabelProgram, LabelMovie } from "@/services/labels.service";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define type for details based on Label type - now includes LabelMovie
type LabelDetails = LabelSong | LabelAd | LabelError | LabelProgram | LabelMovie | null;

type LabelWithDetails = Label & {
  details: LabelDetails;
};

interface ViewLabelDialogProps {
  label: LabelWithDetails;
}

export function ViewLabelDialog({ label }: ViewLabelDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGeneralInfoOpen, setIsGeneralInfoOpen] = useState(false);

  useEffect(() => {
    if (open && label.image_paths?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % label.image_paths.length);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [open, label.image_paths]);

  function convertUnixToNPT(unixTimestamp: string | number = label.end_time) {
    const timestampInSeconds = typeof unixTimestamp === "string" ? parseInt(unixTimestamp, 10) : unixTimestamp;
    const date = new Date(timestampInSeconds * 1000);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kathmandu",
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // Helper function to get formatted details based on label type
  const getFormattedDetails = () => {
    if (!label.details) return null;

    const details: { [key: string]: any } = {};
    
    switch (label.label_type) {
      case "song":
        const songDetails = label.details as LabelSong;
        details["Song Name"] = songDetails.song_name;
        if (songDetails.artist) details["Artist"] = songDetails.artist;
        if (songDetails.album) details["Album"] = songDetails.album;
        if (songDetails.language) details["Language"] = songDetails.language;
        if (songDetails.release_year) details["Release Year"] = songDetails.release_year;
        break;
      
      case "ad":
        const adDetails = label.details as LabelAd;
        details["Type"] = adDetails.type.replace("_", " ");
        details["Brand"] = adDetails.brand;
        if (adDetails.product) details["Product"] = adDetails.product;
        if (adDetails.category) details["Category"] = adDetails.category;
        if (adDetails.sector) details["Sector"] = adDetails.sector;
        if (adDetails.format) details["Format"] = adDetails.format;
        break;
      
      case "error":
        const errorDetails = label.details as LabelError;
        details["Error Type"] = errorDetails.error_type;
        break;
      
      case "program":
        const programDetails = label.details as LabelProgram;
        details["Program Name"] = programDetails.program_name;
        if (programDetails.genre) details["Genre"] = programDetails.genre;
        if (programDetails.episode_number) details["Episode Number"] = programDetails.episode_number;
        if (programDetails.season_number) details["Season Number"] = programDetails.season_number;
        if (programDetails.language) details["Language"] = programDetails.language;
        break;
      
      case "movie":
        const movieDetails = label.details as LabelMovie;
        details["Movie Name"] = movieDetails.movie_name;
        if (movieDetails.genre) details["Genre"] = movieDetails.genre;
        if (movieDetails.director) details["Director"] = movieDetails.director;
        if (movieDetails.release_year) details["Release Year"] = movieDetails.release_year;
        if (movieDetails.language) details["Language"] = movieDetails.language;
        if (movieDetails.duration) details["Duration"] = `${movieDetails.duration} minutes`;
        if (movieDetails.rating) details["Rating"] = movieDetails.rating;
        break;
      
      default:
        return null;
    }

    return details;
  };

  const formattedDetails = getFormattedDetails();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm font-medium">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[84vh] overflow-y-auto bg-background rounded-lg shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold">Label Details (ID: {label.id})</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {/* Image Carousel */}
          {label.image_paths?.length > 0 && (
            <div className="relative border rounded-lg bg-muted overflow-hidden">
              <img
                src={label.image_paths[currentImageIndex] ?? ""}
                alt={`Label image ${currentImageIndex + 1}`}
                className="w-full h-64 object-contain rounded-md"
              />
              {label.image_paths.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {label.image_paths.length}
                </div>
              )}
            </div>
          )}

          {/* Label Type Specific Details */}
          {formattedDetails && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="text-lg font-medium capitalize">{label.label_type} Details</h3>
              <Separator className="my-2"/>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(formattedDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible General Information */}
          <div className="border rounded-lg p-4">
            <button
              className="flex items-center justify-between w-full text-lg font-medium hover:text-primary hover:underline cursor-pointer"
              onClick={() => setIsGeneralInfoOpen(!isGeneralInfoOpen)}
            >
              General Information
              {isGeneralInfoOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {isGeneralInfoOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t pt-2">
                <div>
                  <p className="font-medium">Label Type</p>
                  <p className="capitalize text-muted-foreground">{label.label_type}</p>
                </div>
                <div>
                  <p className="font-medium">Created By</p>
                  <p className="text-muted-foreground">{label.created_by}</p>
                </div>
                <div>
                  <p className="font-medium">Created At</p>
                  <p className="text-muted-foreground">{new Date(label.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}</p>
                </div>
                <div>
                  <p className="font-medium">From</p>
                  <p className="text-muted-foreground">{convertUnixToNPT(label.start_time)}</p>
                </div>
                <div>
                  <p className="font-medium">To</p>
                  <p className="text-muted-foreground">{convertUnixToNPT(label.end_time)}</p>
                </div>
                <div>
                  <p className="font-medium">Event IDs</p>
                  <p className="text-muted-foreground">{label.event_ids.join(", ")}</p>
                </div>
                {label.notes && (
                  <div className="sm:col-span-2">
                    <p className="font-medium">Notes</p>
                    <p className="text-muted-foreground">{label.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}