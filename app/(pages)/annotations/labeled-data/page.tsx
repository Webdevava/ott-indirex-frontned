import LabeledEventsTable from "@/components/modules/labeled/labeled-table";
import { Separator } from "@/components/ui/separator";
import React from "react";

const LabelingPage = () => {
  return (
    <div className="container mx-auto p-4">
            <div className="mb-4">
        <h1 className="text-2xl font-bold">Labeled Data</h1>
        <Separator />
      </div>
      <LabeledEventsTable />
    </div>
  );
};

export default LabelingPage;
