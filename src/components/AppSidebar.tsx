import { Gift, GitCompare, History, User, MoreHorizontal } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Gifts", url: "/gifts", icon: Gift },
  { title: "Compare", url: "/compare", icon: GitCompare },
  { title: "History", url: "/history", icon: History },
  { title: "Profile", url: "/profile", icon: User },
  { title: "More", url: "/more", icon: MoreHorizontal },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-display font-bold text-sm">M</span>
        </div>
        {!collapsed && (
          <span className="font-display text-xl font-semibold text-foreground tracking-tight">Muhtar</span>
        )}
      </div>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/gifts"}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-accent/50"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
