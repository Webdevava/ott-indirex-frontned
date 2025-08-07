// app/not-found.tsx

"use client";

import Lightning from "@/components/custom/lightning";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>

  <Lightning
    hue={220}
    xOffset={0}
    speed={1}
    intensity={1}
    size={1}
  />
<div className="z-[9999999] absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/50">
     <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft/> Go Back
        </Button>
        <Button onClick={() => router.push("/")}>
          <Home/> Go Home
        </Button>
      </div>
</div>
    </div>
  );
}
