import { useState, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";

interface SettingsSidebarProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export const SettingsSidebar = ({ children, defaultOpen = true }: SettingsSidebarProps) => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem("settings-sidebar-open");
    return saved !== null ? saved === "true" : defaultOpen;
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("settings-sidebar-open", String(isOpen));
  }, [isOpen]);

  // Keyboard shortcut: Ctrl+. or Cmd+.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-20 right-0 z-40 flex transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%-48px)]"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-4 px-2",
          "bg-synth-panel border-l border-y border-synth-border rounded-l-xl",
          "hover:bg-synth-deep transition-colors",
          "text-muted-foreground hover:text-foreground"
        )}
        title={isOpen ? "Collapse settings (Ctrl+.)" : "Expand settings (Ctrl+.)"}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
        
        {/* Vertical "Settings" text when collapsed */}
        {!isOpen && (
          <div className="flex flex-col items-center gap-1">
            <Settings className="w-4 h-4 text-primary" />
            <span
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              Settings
            </span>
          </div>
        )}
      </button>

      {/* Panel Content */}
      <div
        className={cn(
          "w-80 max-h-[calc(100vh-6rem)] overflow-y-auto",
          "bg-synth-panel/50 backdrop-blur-sm border-l border-synth-border",
          "p-4 space-y-4",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-synth-border">
          <Settings className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider text-foreground">
            Settings
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            Ctrl+.
          </span>
        </div>
        
        {children}
      </div>
    </div>
  );
};
