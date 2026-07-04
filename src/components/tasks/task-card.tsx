"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  RotateCcw,
  Clock,
  Bell,
  BellOff,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import type { Task, Category } from "@/lib/types";
import { formatTaskDate, getOverdueDays } from "@/lib/task-utils";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: Task;
  category?: Category;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
}

export function TaskCard({
  task,
  category,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
}: TaskCardProps) {
  const isOverdue = task.status === "atrasada";
  const isCompleted = task.status === "concluida";
  const overdueDays = isOverdue ? getOverdueDays(task.date) : 0;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-4 rounded-xl border bg-card transition-all duration-200 hover:shadow-md",
        isOverdue &&
          "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20",
        isCompleted && "opacity-70",
        selected && "ring-2 ring-primary",
      )}
    >
      {/* Checkbox */}
      {onSelect && (
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(task.id, !!v)}
          className="mt-0.5 shrink-0"
          aria-label={`Selecionar tarefa ${task.title}`}
        />
      )}

      {/* Overdue left bar */}
      {isOverdue && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  "text-sm font-medium text-card-foreground leading-snug",
                  isCompleted && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs gap-1 shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  {overdueDays}d atrasada
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                aria-label="Acoes da tarefa"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              {isCompleted ? (
                <DropdownMenuItem onClick={() => onReopen(task.id)}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reabrir
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onComplete(task.id)}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Concluir
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {formatTaskDate(task.date)} {task.time && `· ${task.time}`}
            </span>
          </div>

          {category && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border"
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: `${category.color}40`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}

          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />

          {task.reminder && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Bell className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
