"use client";

import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/use-app-data";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Search,
  X,
  ListFilter,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/types";
import { generateId } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#84cc16",
  "#14b8a6",
];

type SortOption = "az" | "za" | "newest" | "oldest";
type StatusFilter = "all" | "active" | "inactive";
type TasksFilter = "all" | "with-tasks" | "without-tasks";

interface CategoryFilters {
  sort: SortOption;
  status: StatusFilter;
  tasks: TasksFilter;
}

const DEFAULT_FILTERS: CategoryFilters = {
  sort: "newest",
  status: "all",
  tasks: "all",
};

interface CategoryFormProps {
  category?: Category;
  onSubmit: (cat: Category) => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || PRESET_COLORS[0]);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome e obrigatorio");
      return;
    }
    onSubmit({
      id: category?.id || generateId("cat"),
      name: name.trim(),
      color,
      createdAt: category?.createdAt || new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">
          Nome da categoria <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Ex: Trabalho"
          className={cn(error ? "border-destructive" : "")}
          autoFocus
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? c : "transparent",
                transform: color === c ? "scale(1.2)" : "scale(1)",
                boxShadow:
                  color === c
                    ? `0 0 0 2px var(--background), 0 0 0 4px ${c}`
                    : "none",
              }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <label className="text-xs text-muted-foreground">
            Personalizada:
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent"
          />
          <span className="text-xs font-mono text-muted-foreground">
            {color}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/40">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border"
          style={{
            backgroundColor: `${color}18`,
            borderColor: `${color}35`,
            color,
          }}
        >
          <Tag className="w-3 h-3" />
          {name || "Previsualizar"}
        </span>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{category ? "Salvar" : "Criar categoria"}</Button>
      </div>
    </form>
  );
}

export default function CategoriasPage() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useCategories();
  const { tasks } = useTasks();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilters, setCatFilters] =
    useState<CategoryFilters>(DEFAULT_FILTERS);

  function getTaskCount(catId: string) {
    return tasks.filter((t) => t.categoryId === catId).length;
  }

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Search by name or description
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    // Status filter (active = has tasks, inactive = no tasks)
    if (catFilters.status === "active") {
      result = result.filter((c) => getTaskCount(c.id) > 0);
    } else if (catFilters.status === "inactive") {
      result = result.filter((c) => getTaskCount(c.id) === 0);
    }

    // Tasks filter
    if (catFilters.tasks === "with-tasks") {
      result = result.filter((c) => getTaskCount(c.id) > 0);
    } else if (catFilters.tasks === "without-tasks") {
      result = result.filter((c) => getTaskCount(c.id) === 0);
    }

    // Sort
    result.sort((a, b) => {
      if (catFilters.sort === "az") return a.name.localeCompare(b.name);
      if (catFilters.sort === "za") return b.name.localeCompare(a.name);
      if (catFilters.sort === "oldest")
        return a.createdAt.localeCompare(b.createdAt);
      // newest (default)
      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }, [categories, tasks, search, catFilters]);

  function handleSubmit(cat: Category) {
    if (editing) {
      updateCategory(cat.id, cat);
      toast.success("Categoria atualizada!");
    } else {
      addCategory(cat);
      toast.success("Categoria criada!");
    }
    setFormOpen(false);
    setEditing(undefined);
  }

  function handleEdit(cat: Category) {
    setEditing(cat);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteId) return;
    deleteCategory(deleteId);
    toast.success("Categoria excluida.");
    setDeleteId(null);
  }

  const hasActiveFilters =
    search.trim() ||
    catFilters.sort !== DEFAULT_FILTERS.sort ||
    catFilters.status !== DEFAULT_FILTERS.status ||
    catFilters.tasks !== DEFAULT_FILTERS.tasks;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Page header — consistent pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar categorias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-muted/40 border-border/60 focus:border-primary/50 focus:bg-background transition-colors"
            />
            {search && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
                aria-label="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          size="sm"
          className="gap-2 shrink-0 neon-glow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova categoria</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Results count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filteredCategories.length} de {categories.length}{" "}
          {categories.length === 1 ? "categoria" : "categorias"}
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => {
              setSearch("");
              setCatFilters(DEFAULT_FILTERS);
            }}
          >
            <X className="w-3 h-3 mr-1" /> Limpar filtros
          </Button>
        )}
      </div>

      {/* Category grid */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Tag className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma categoria
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Crie categorias para organizar suas tarefas.
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Nenhuma categoria encontrada
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tente ajustar a pesquisa ou os filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCategories.map((cat) => {
            const count = getTaskCount(cat.id);
            return (
              <div
                key={cat.id}
                className="cyber-card rounded-lg p-4 group hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}18`,
                        boxShadow: `0 0 0 1px ${cat.color}25`,
                      }}
                    >
                      <Tag
                        className="w-4.5 h-4.5"
                        style={{
                          color: cat.color,
                          filter: `drop-shadow(0 0 3px ${cat.color}80)`,
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {cat.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {count} {count === 1 ? "tarefa" : "tarefas"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(cat)}
                      aria-label="Editar categoria"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(cat.id)}
                      aria-label="Excluir categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-0.5 rounded-full bg-muted">
                  <div
                    className="h-0.5 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: cat.color,
                      width: count > 0 ? "100%" : "0%",
                      boxShadow: count > 0 ? `0 0 4px ${cat.color}60` : "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(undefined);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar categoria" : "Nova categoria"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditing(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? As tarefas vinculadas nao serao excluidas, mas
              ficarao sem categoria.
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
    </div>
  );
}
