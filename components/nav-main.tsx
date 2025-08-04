"use client"

import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ComponentType<{ className?: string }>
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const [pathname, setPathname] = useState("")

  useEffect(() => {
    // Set initial pathname
    setPathname(window.location.pathname)

    // Listen for route changes (for SPAs)
    const handleLocationChange = () => {
      setPathname(window.location.pathname)
    }

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange)
    
    // For SPAs that use pushState/replaceState, we need to override these methods
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      handleLocationChange()
    }

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      handleLocationChange()
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if current item or any sub-item is active
          const isCurrentActive = pathname === item.url
          const hasActiveSubItem = item.items?.some((subItem) => pathname === subItem.url)
          const shouldHighlight = isCurrentActive || hasActiveSubItem || item.isActive

          // Debug logging - remove this after testing
          console.log(`Item: ${item.title}, Current pathname: "${pathname}", Item URL: "${item.url}", isCurrentActive: ${isCurrentActive}`)

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={shouldHighlight}
            >
              <SidebarMenuItem>
                {item.items?.length ? (
                  // Non-clickable button for items with sub-items
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={
                      hasActiveSubItem
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  // Clickable link for items without sub-items
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={
                      isCurrentActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }
                  >
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle {item.title}</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={
                                pathname === subItem.url
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : ""
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
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}