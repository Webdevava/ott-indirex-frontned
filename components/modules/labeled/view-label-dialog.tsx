/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label, LabelSong, LabelAd, LabelError, LabelProgram } from "@/services/labels.service";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Define type for details based on Label type
type LabelDetails = LabelSong | LabelAd | LabelError | LabelProgram | null;

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
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

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
            </div>
          )}

          {/* Program Details (if any) */}
          {label.details && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="text-lg font-medium capitalize">{label.label_type} Details</h3>
              <Separator/>
              <div className="grid grid-cols-1 gap-2 text-sm mt-2">
                {Object.entries(label.details).map(
                  ([key, value]) =>
                    key !== "label_id" &&
                    value && (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key.replace("_", " ")}:</span>
                        <span>{value}</span>
                      </div>
                    )
                )}
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