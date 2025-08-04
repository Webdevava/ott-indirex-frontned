import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SquareTerminal, List, Bot, Users, PieChart, Monitor } from "lucide-react";

export const navMain = [
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
    icon: Monitor,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: PieChart,
  },
];

export function DashboardRoutesCard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {navMain.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            {item.url !== "#" ? (
              <Link href={item.url} className="text-blue-600 hover:underline">
                Go to {item.title}
              </Link>
            ) : (
              <div>
                {item.items?.map((subItem) => (
                  <Link
                    key={subItem.title}
                    href={subItem.url}
                    className="block text-blue-600 hover:underline py-1"
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}