"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, Monitor, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/tarefas": "Tarefas",
  "/categorias": "Categorias",
  "/templates": "Templates",
  "/configuracoes": "Configuracões",
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "TaskFlow";
  const { theme, setTheme, mounted } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-md">
      {/* Left: Logo (mobile) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile logo */}
        <Link
          href="/"
          className="md:hidden flex items-center gap-1.5 shrink-0"
          aria-label="Ir para o Dashboard"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary neon-glow-sm">
            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase">
            Task<span className="text-primary neon-text">Flow</span>
          </span>
        </Link>

        {/* Divider mobile */}
        <span className="md:hidden text-border text-lg leading-none select-none">
          /
        </span>

        <h1
          className={cn(
            "text-sm font-semibold text-foreground truncate",
            "md:text-base",
          )}
        >
          {title}
        </h1>
      </div>

      {/* Right: Theme toggle */}
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Alterar tema"
            >
              {!mounted ? (
                <Monitor className="w-4 h-4" />
              ) : theme === "light" ? (
                <Sun className="w-4 h-4" />
              ) : theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="w-4 h-4 mr-2" /> Claro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="w-4 h-4 mr-2" /> Escuro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="w-4 h-4 mr-2" /> Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
