import EventTable from "@/components/modules/labeling/unlabeled-table";
import { Separator } from "@/components/ui/separator";
import React from "react";

const LabelingPage = () => {
  return (
    <div className="container mx-auto p-4">
            <div className="mb-4">
        <h1 className="text-2xl font-bold">Data Labeling</h1>
        <Separator />
      </div>
      <EventTable />
    </div>
  );
};

export default LabelingPage;
