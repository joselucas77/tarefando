"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  FileText,
  Tag,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tarefas", icon: CheckSquare, label: "Tarefas" },
  { href: "/categorias", icon: Tag, label: "Categorias" },
  { href: "/templates", icon: FileText, label: "Templates" },
  { href: "/configuracoes", icon: Settings, label: "Configuracoes" },
];

const BOTTOM_NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tarefas", icon: CheckSquare, label: "Tarefas" },
  { href: "/categorias", icon: Tag, label: "Categorias" },
  { href: "/configuracoes", icon: Settings, label: "Config." },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 cyber-scanline",
          "bg-sidebar border-sidebar-border",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-2 border-b border-sidebar-border relative",
            collapsed ? "justify-center px-2 py-5" : "px-4 py-5",
          )}
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary neon-glow-sm shrink-0">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sidebar-foreground text-base tracking-widest uppercase">
                Task
              </span>
              <span className="font-bold text-primary text-base tracking-widest uppercase -mt-0.5 neon-text">
                Flow
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav
          className="flex-1 px-2 py-4 space-y-0.5"
          aria-label="Navegacao principal"
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            const item = (
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md transition-all duration-150 text-sm font-medium group relative",
                  collapsed ? "justify-center w-full h-10 px-0" : "px-3 py-2.5",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 neon-glow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent hover:border-border/40",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                )}
                <Icon
                  className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")}
                />
                {!collapsed && <span>{label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger>{item}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return <div key={href}>{item}</div>;
          })}
        </nav>

        {/* Collapse button */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "justify-center px-0" : "justify-end",
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-border bg-background/95 backdrop-blur-md"
        aria-label="Navegacao mobile"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {BOTTOM_NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-150 relative min-w-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full neon-glow-sm" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-150",
                  isActive && "drop-shadow-[0_0_6px_var(--neon)]",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium truncate",
                  isActive && "font-semibold",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
