"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import {
  useCategories,
  useTemplates,
  useReminderHistory,
} from "@/hooks/use-app-data";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskFilters } from "@/components/tasks/task-filters";
import { GroupingModal } from "@/components/tasks/grouping-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, CheckSquare, X } from "lucide-react";
import { toast } from "sonner";
import type { Task, FilterState, ReminderHistory } from "@/lib/types";
import { generateId, formatTaskDate } from "@/lib/task-utils";
import { format } from "date-fns";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  statuses: [],
  priorities: [],
  categoryIds: [],
  dateRange: "all",
  sortBy: "newest",
};

export default function TarefasPage() {
  const {
    tasks,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    completeTask,
    reopenTask,
    getFilteredTasks,
  } = useTasks();
  const { categories } = useCategories();
  const { templates } = useTemplates();
  const { addReminder } = useReminderHistory();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [groupingModalOpen, setGroupingModalOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  const filteredTasks = getFilteredTasks(filters);
  const getCategoryForTask = (id: string) =>
    categories.find((c) => c.id === id);

  function handleOpenCreate() {
    setEditingTask(undefined);
    setFormOpen(true);
  }

  function handleOpenEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleFormSubmit(task: Task) {
    if (editingTask) {
      updateTask(task.id, task);
      toast.success("Tarefa atualizada!");
      setFormOpen(false);
      setEditingTask(undefined);
      return;
    }
    const sameDateTasks = tasks.filter(
      (t) => t.date === task.date && t.id !== task.id,
    );
    if (sameDateTasks.length > 0) {
      setPendingTask(task);
      setFormOpen(false);
      setGroupingModalOpen(true);
    } else {
      finalizeAddTask(task);
    }
  }

  function finalizeAddTask(task: Task, templateId?: string) {
    const finalTask = templateId ? { ...task, templateId } : task;
    addTask(finalTask);
    if (finalTask.reminder) {
      const reminder: ReminderHistory = {
        id: generateId("rem"),
        taskId: finalTask.id,
        taskTitle: finalTask.title,
        templateId: finalTask.templateId,
        templateName: finalTask.templateId
          ? templates.find((t) => t.id === finalTask.templateId)?.name
          : undefined,
        date: finalTask.date,
        time: finalTask.time,
        status: "agendado",
        createdAt: new Date().toISOString(),
      };
      addReminder(reminder);
    }
    toast.success("Tarefa criada!");
    setFormOpen(false);
  }

  function handleGroupingAddToTemplate(templateId: string) {
    if (!pendingTask) return;
    finalizeAddTask(pendingTask, templateId);
    setPendingTask(null);
    setGroupingModalOpen(false);
  }

  function handleGroupingCreateTemplate() {
    if (!pendingTask) return;
    finalizeAddTask(pendingTask);
    setPendingTask(null);
    setGroupingModalOpen(false);
    toast.info(
      "Tarefa criada! Acesse Templates para configurar o agrupamento.",
    );
  }

  function handleGroupingKeepIndividual() {
    if (!pendingTask) return;
    finalizeAddTask(pendingTask);
    setPendingTask(null);
    setGroupingModalOpen(false);
  }

  function confirmDelete() {
    if (deleteId) {
      deleteTask(deleteId);
      toast.success("Tarefa excluida.");
      setDeleteId(null);
    }
  }

  function handleSelect(id: string, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSelectAll() {
    if (selectedIds.size === filteredTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
    }
  }

  function handleBulkDelete() {
    deleteTasks(Array.from(selectedIds));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    toast.success(`${selectedIds.size} tarefas excluidas.`);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const hasActiveFilters =
    filters.search ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.categoryIds.length > 0 ||
    filters.dateRange !== "all";

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Page header — consistent pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar tarefas..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              className="pl-9 h-9 bg-muted/40 border-border/60 focus:border-primary/50 focus:bg-background transition-colors"
            />
            {filters.search && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                aria-label="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <TaskFilters filters={filters} onChange={setFilters} />
        </div>
        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="gap-2 shrink-0 neon-glow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova tarefa</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Filtros:</span>
          {filters.search && (
            <Badge
              variant="secondary"
              className="text-xs gap-1 cursor-pointer"
              onClick={() => setFilters((f) => ({ ...f, search: "" }))}
            >
              {filters.search} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
          {filters.statuses.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="text-xs gap-1 cursor-pointer"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  statuses: f.statuses.filter((x) => x !== s),
                }))
              }
            >
              {s} <X className="w-2.5 h-2.5" />
            </Badge>
          ))}
          {filters.priorities.map((p) => (
            <Badge
              key={p}
              variant="secondary"
              className="text-xs gap-1 cursor-pointer"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  priorities: f.priorities.filter((x) => x !== p),
                }))
              }
            >
              {p} <X className="w-2.5 h-2.5" />
            </Badge>
          ))}
          {filters.dateRange !== "all" && (
            <Badge
              variant="secondary"
              className="text-xs gap-1 cursor-pointer"
              onClick={() => setFilters((f) => ({ ...f, dateRange: "all" }))}
            >
              {filters.dateRange} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-xs px-1.5"
            onClick={clearFilters}
          >
            Limpar
          </Button>
        </div>
      )}

      {/* Bulk selection bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/10 border border-primary/25">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "selecionada" : "selecionadas"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-7 text-xs"
            >
              <X className="w-3 h-3 mr-1" /> Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="h-7 text-xs gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Excluir selecionadas</span>
              <span className="sm:hidden">Excluir</span>
            </Button>
          </div>
        </div>
      )}

      {/* Count + select-all row */}
      {filteredTasks.length > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleSelectAll}
          >
            {selectedIds.size === filteredTasks.length
              ? "Desmarcar todos"
              : "Selecionar todos"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "tarefa" : "tarefas"}
          </span>
        </div>
      )}

      {/* Task list */}
      {!isLoaded ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckSquare className="w-12 h-12 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma tarefa encontrada
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasActiveFilters
              ? "Tente ajustar os filtros."
              : 'Clique em "Nova tarefa" para comecar.'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={getCategoryForTask(task.categoryId)}
              selected={selectedIds.has(task.id)}
              onSelect={handleSelect}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteId(id)}
              onComplete={(id) => {
                completeTask(id);
                toast.success("Tarefa concluida!");
              }}
              onReopen={(id) => {
                reopenTask(id);
                toast.info("Tarefa reaberta.");
              }}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditingTask(undefined);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Editar tarefa" : "Nova tarefa"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditingTask(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefas selecionadas</AlertDialogTitle>
            <AlertDialogDescription>
              Voce esta prestes a excluir {selectedIds.size} tarefas. Esta acao
              nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir {selectedIds.size} tarefas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GroupingModal
        open={groupingModalOpen}
        onClose={() => {
          setGroupingModalOpen(false);
          setPendingTask(null);
        }}
        existingTemplates={templates}
        date={pendingTask ? formatTaskDate(pendingTask.date) : ""}
        onAddToTemplate={handleGroupingAddToTemplate}
        onCreateNewTemplate={handleGroupingCreateTemplate}
        onKeepIndividual={handleGroupingKeepIndividual}
      />
    </div>
  );
}
