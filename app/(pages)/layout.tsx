import { AppSidebar } from "@/components/app-sidebar";
import TitleHeader from "@/components/layouts/title-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
<TitleHeader/>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
