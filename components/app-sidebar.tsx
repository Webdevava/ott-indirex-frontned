/* eslint-disable @next/next/no-img-element */
'use client'

import * as React from "react"
import { SquareTerminal, Bot, Users, PieChart, Command, List, Cpu } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import Cookies from 'js-cookie'

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal,
  },
  {
    title: "Live Stream",
    url: "/live-stream",
    icon: List,
  },
  {
    title: "Annotations",
    url: "#",
    icon: Bot,
    items: [
      {
        title: "Labeling",
        url: "/annotations/labeling",
      },
      {
        title: "Labeled Data",
        url: "/annotations/labeled-data",
      },
    ],
  },
  {
    title: "User Management",
    url: "/user-management",
    icon: Users,
  },
  {
    title: "Device Management",
    url: "/device-management",
    icon: Cpu,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: PieChart,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Get user role from cookies
  const userRole = Cookies.get('auth_user_role')

  // Filter nav items based on role
  const filteredNavMain = userRole === 'ADMIN'
    ? navMain
    : navMain.filter(item => item.title === 'Annotations')

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="p-2">
              <a href="/dashboard">
             <img src='/rex.svg' alt="logo" className="w-full h-8"/>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}