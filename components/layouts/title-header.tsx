"use client";

import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  List,
  Monitor,
  PieChart,
  SquareTerminal,
  Users,
} from "lucide-react";

const TitleHeader = () => {
  const pathname = usePathname();

  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: SquareTerminal },
    { title: "Live Stream", url: "/live-stream", icon: List },
    {
      title: "Annotations",
      url: "#",
      icon: Bot,
      items: [
        { title: "Labeling", url: "/annotations/labeling" },
        { title: "Labeled Data", url: "/annotations/labeled-data" },
      ],
    },
    { title: "User Management", url: "/user-management", icon: Users },
    { title: "Device Management", url: "/device-management", icon: Monitor },
    { title: "Reports", url: "/reports", icon: PieChart },
  ];

  
  const getBreadcrumbs = () => {
    const breadcrumbs: { title: string; url?: string }[] = [];

    // Find matching route in navMain
    for (const item of navMain) {
      if (item.url === pathname && item.url !== "#") {
        // Only include navigable top-level routes (exclude /annotations with url: "#")
        breadcrumbs.push({ title: item.title, url: item.url });
        break;
      } else if (item.items) {
        // Check sub-items for Annotations
        for (const subItem of item.items) {
          if (subItem.url === pathname) {
            // Include parent (Annotations) as non-clickable, then sub-item
            breadcrumbs.push({ title: item.title }); // No url for parent (plain text)
            breadcrumbs.push({ title: subItem.title, url: subItem.url });
            break;
          }
        }
      }
    }

    // Filter out any breadcrumbs with url "/" to exclude Home
    return breadcrumbs.filter((crumb) => crumb.url !== "/");
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.title}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 || !crumb.url ? (
                  <span className="font-medium">{crumb.title}</span>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.url}>{crumb.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};

export default TitleHeader;
