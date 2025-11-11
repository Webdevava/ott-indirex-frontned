/* eslint-disable @next/next/no-img-element */
'use client'

import * as React from "react"
import { SquareTerminal, Bot, Users, PieChart, List, Cpu, Folder, Briefcase, Archive, Settings, HelpCircle, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import Cookies from 'js-cookie'
import { Separator } from "./ui/separator"
// import { NavProjects } from "./nav-projects"
// import { NavSecondary } from "./nav-secondary"

// Main navigation items
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal,
    adminOnly: true,
  },
  {
    title: "Live Stream",
    url: "/live-stream",
    icon: List,
    adminOnly: true,
  },
    {
    title: "AFP Stream",
    url: "/afp-stream",
    icon: List,
    adminOnly: true,
  },
  {
    title: "Annotations",
    url: "#",
    icon: Bot,
    adminOnly: false,
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
    adminOnly: true,
  },
  {
    title: "Device Management",
    url: "/device-management",
    icon: Cpu,
    adminOnly: true,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: PieChart,
    adminOnly: true,
  },
]

// Projects data
// const projects = [
//   {
//     name: "Project Alpha",
//     url: "/projects/alpha",
//     icon: Folder,
//     adminOnly: true,
//   },
//   {
//     name: "Project Beta",
//     url: "/projects/beta",
//     icon: Briefcase,
//     adminOnly: true,
//   },
//   {
//     name: "Project Gamma",
//     url: "/projects/gamma",
//     icon: Archive,
//     adminOnly: true,
//   },
// ]

// Secondary navigation items
// const secondaryItems = [
//   {
//     title: "Settings",
//     url: "/settings",
//     icon: Settings,
//   },
//   {
//     title: "Help",
//     url: "/help",
//     icon: HelpCircle,
//   },
//   {
//     title: "Logout",
//     url: "/logout",
//     icon: LogOut,
//   },
// ]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Get user role from cookies
  const userRole = Cookies.get('auth_user_role')
  const isAdmin = userRole === 'ADMIN'

  // Add disabled status to nav items based on role
  const processedNavMain = navMain.map(item => ({
    ...item,
    disabled: !isAdmin && item.adminOnly,
    // If disabled, change URL to prevent navigation
    url: (!isAdmin && item.adminOnly) ? "#" : item.url,
  }))

  // Add disabled status to projects
  // const processedProjects = projects.map(project => ({
  //   ...project,
  //   disabled: !isAdmin && project.adminOnly,
  //   // If disabled, change URL to prevent navigation
  //   url: (!isAdmin && project.adminOnly) ? "#" : project.url,
  // }))

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
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

      <Separator/>
      <SidebarContent>
        <NavMain items={processedNavMain} />
        {/* <NavProjects projects={processedProjects} /> */}
        {/* <NavSecondary items={secondaryItems} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}