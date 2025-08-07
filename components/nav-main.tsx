"use client";

import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
    disabled?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    // Set initial pathname
    setPathname(window.location.pathname);

    // Listen for route changes (for SPAs)
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    // Listen for popstate (back/forward buttons)
    window.addEventListener("popstate", handleLocationChange);

    // For SPAs that use pushState/replaceState, we need to override these methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      handleLocationChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const handleDisabledClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if current item or any sub-item is active
          const isCurrentActive = pathname === item.url && !item.disabled;
          const hasActiveSubItem = item.items?.some(
            (subItem) => pathname === subItem.url
          );
          const shouldHighlight =
            (isCurrentActive || hasActiveSubItem || item.isActive) && !item.disabled;

          // Debug logging - remove this after testing
          console.log(
            `Item: ${item.title}, Current pathname: "${pathname}", Item URL: "${item.url}", isCurrentActive: ${isCurrentActive}, disabled: ${item.disabled}`
          );

          return (
            <Collapsible key={item.title} asChild defaultOpen={shouldHighlight}>
              <SidebarMenuItem>
                {item.items?.length ? (
                  // Entire button acts as the toggle
                  <CollapsibleTrigger asChild disabled={item.disabled}>
                    <SidebarMenuButton
                      tooltip={item.disabled ? `${item.title} (Access Restricted)` : item.title}
                      className={`${
                        hasActiveSubItem && !item.disabled
                          ? "bg-sidebar-accent text-sidebar-accent-foreground border h-10 justify-between"
                          : "h-10 justify-between"
                      } ${
                        item.disabled 
                          ? "opacity-50 cursor-not-allowed text-muted-foreground hover:bg-transparent" 
                          : ""
                      }`}
                      onClick={item.disabled ? handleDisabledClick : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon  className="size-5"/>}
                        <span>{item.title}</span>
                      </div>
                      <ChevronRight className={`transition-transform duration-200 data-[state=open]:rotate-90 ${
                        item.disabled ? "opacity-50" : ""
                      }`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    tooltip={item.disabled ? `${item.title} (Access Restricted)` : item.title}
                    className={`${
                      isCurrentActive && !item.disabled
                        ? "bg-sidebar-accent text-sidebar-accent-foreground border h-10"
                        : "h-10"
                    } ${
                      item.disabled 
                        ? "opacity-50 cursor-not-allowed text-muted-foreground hover:bg-transparent" 
                        : ""
                    }`}
                    onClick={item.disabled ? handleDisabledClick : undefined}
                  >
                    {item.disabled ? (
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon className="size-5" />}
                        <span>{item.title}</span>
                      </div>
                    ) : (
                      <a href={item.url}>
                        {item.icon && <item.icon className="size-5"/>}
                        <span>{item.title}</span>
                      </a>
                    )}
                  </SidebarMenuButton>
                )}

                {item.items?.length && !item.disabled ? (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={
                              pathname === subItem.url
                                ? "bg-sidebar-accent text-sidebar-accent-foreground border h-8"
                                : "h-8"
                            }
                          >
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}