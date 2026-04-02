import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Outlet, useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/gifts": "Gift Discovery",
  "/compare": "Product Compare",
  "/history": "History",
  "/profile": "Profile",
  "/more": "More",
};

export function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Muhtar";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader title={title} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-5xl mx-auto animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
