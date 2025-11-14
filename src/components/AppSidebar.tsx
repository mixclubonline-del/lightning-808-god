import { Zap, Library, Music, Settings, ArrowRightLeft } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Synth", url: "synth", icon: Zap, color: "text-primary" },
  { title: "Signal Flow", url: "flow", icon: ArrowRightLeft, color: "text-cyan-400" },
  { title: "Studio", url: "studio", icon: Music, color: "text-accent" },
  { title: "Library", url: "library", icon: Library, color: "text-purple-400" },
];

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: "synth" | "library" | "studio" | "flow") => void;
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-synth-panel border-r-2 border-synth-border">
        {/* Logo/Title */}
        {!collapsed && (
          <div className="p-6 border-b border-synth-border">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <div>
                <h1 className="text-primary text-xl font-bold uppercase tracking-wider"
                  style={{ textShadow: "0 0 10px rgba(239, 68, 68, 0.6)" }}>
                  Zeus
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Divine Synth
                </p>
              </div>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="p-4 border-b border-synth-border text-center">
            <div className="text-2xl">⚡</div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive = activeView === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.url as "synth" | "library" | "studio" | "flow")}
                      className={`
                        transition-all duration-200 hover:bg-synth-deep
                        ${isActive 
                          ? `${item.color} bg-synth-deep/50 font-medium shadow-[0_0_15px_currentColor]` 
                          : "text-muted-foreground hover:text-foreground"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Effects Chain Indicator */}
        {!collapsed && (
          <div className="px-4 py-6 mt-auto border-t border-synth-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Signal Chain
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-primary">Thor Engine</span>
              </div>
              <div className="ml-1 border-l-2 border-synth-border h-3" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-yellow-400">Apollo ADSR</span>
              </div>
              <div className="ml-1 border-l-2 border-synth-border h-3" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-xs text-orange-400">Vulcan Forge</span>
              </div>
              <div className="ml-1 border-l-2 border-synth-border h-3" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-xs text-cyan-400">Effects Chain</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}