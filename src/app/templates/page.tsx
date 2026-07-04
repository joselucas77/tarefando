"use client";

import { useState } from "react";
import { useTemplates } from "@/hooks/use-app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  FileText,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { Template } from "@/lib/types";
import { generateId, TEMPLATE_VARIABLES } from "@/lib/task-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TemplateFormProps {
  template?: Template;
  onSubmit: (tpl: Template) => void;
  onCancel: () => void;
}

function TemplateForm({ template, onSubmit, onCancel }: TemplateFormProps) {
  const [name, setName] = useState(template?.name || "");
  const [title, setTitle] = useState(template?.title || "");
  const [content, setContent] = useState(template?.content || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function insertVariable(variable: string) {
    const insertion = `{{${variable}}}`;
    setContent((prev) => prev + insertion);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nome e obrigatorio";
    if (!title.trim()) e.title = "Titulo e obrigatorio";
    if (!content.trim()) e.content = "Conteudo e obrigatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const now = new Date().toISOString();
    onSubmit({
      id: template?.id || generateId("tpl"),
      name: name.trim(),
      title: title.trim(),
      content: content.trim(),
      createdAt: template?.createdAt || now,
      updatedAt: now,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tpl-name">
          Nome do template <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tpl-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Lembrete de Reuniao"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tpl-title">
          Titulo da mensagem <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tpl-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Reuniao: {{titulo}}"
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="tpl-content">
            Conteudo da mensagem <span className="text-destructive">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="h-6 w-6"
                >
                  <Info className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">
                  Use variaveis dinamicas entre chaves duplas para personalizar
                  a mensagem.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="tpl-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Conteudo da mensagem..."
          rows={5}
          className={errors.content ? "border-destructive" : ""}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content}</p>
        )}
      </div>

      {/* Variables */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Variaveis disponiveis:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <TooltipProvider key={v.key}>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="px-2 py-1 rounded bg-muted text-xs font-mono text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-border"
                  >
                    {`{{${v.key}}}`}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{v.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {template ? "Salvar alteracoes" : "Criar template"}
        </Button>
      </div>
    </form>
  );
}

export default function TemplatesPage() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  } = useTemplates();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Template | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  function handleSubmit(tpl: Template) {
    if (editing) {
      updateTemplate(tpl.id, tpl);
      toast.success("Template atualizado!");
    } else {
      addTemplate(tpl);
      toast.success("Template criado!");
    }
    setFormOpen(false);
    setEditing(undefined);
  }

  function handleEdit(tpl: Template) {
    setEditing(tpl);
    setFormOpen(true);
  }

  function handleDuplicate(id: string) {
    duplicateTemplate(id);
    toast.success("Template duplicado!");
  }

  function confirmDelete() {
    if (!deleteId) return;
    deleteTemplate(deleteId);
    toast.success("Template excluido.");
    setDeleteId(null);
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Templates</h2>
          <p className="text-sm text-muted-foreground">
            {templates.length} templates cadastrados
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo template
        </Button>
      </div>

      {/* Variables info card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Variaveis dinamicas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use placeholders como{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  {"{{titulo}}"}
                </code>
                ,{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  {"{{data}}"}
                </code>
                ,{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  {"{{hora}}"}
                </code>
                ,{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  {"{{prioridade}}"}
                </code>{" "}
                e{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  {"{{itens}}"}
                </code>{" "}
                para personalizar mensagens automaticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <p className="text-base font-medium text-muted-foreground">
            Nenhum template
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Crie templates para padronizar mensagens de lembrete.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">
                        {tpl.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {tpl.title}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewTemplate(tpl)}>
                        <FileText className="w-4 h-4 mr-2" /> Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(tpl)}>
                        <Edit className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(tpl.id)}>
                        <Copy className="w-4 h-4 mr-2" /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(tpl.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                  {tpl.content}
                </p>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {TEMPLATE_VARIABLES.filter((v) =>
                      tpl.content.includes(`{{${v.key}}}`),
                    ).map((v) => (
                      <Badge
                        key={v.key}
                        variant="secondary"
                        className="text-xs font-mono py-0"
                      >{`{{${v.key}}}`}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tpl.updatedAt), "dd/MM/yy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(undefined);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar template" : "Novo template"}
            </DialogTitle>
          </DialogHeader>
          <TemplateForm
            template={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditing(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(v) => !v && setPreviewTemplate(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Previa: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-semibold mb-2">
                  {previewTemplate.title}
                </p>
                <Separator className="mb-3" />
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {previewTemplate.content}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Variaveis utilizadas:
                </p>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.filter((v) =>
                    previewTemplate.content.includes(`{{${v.key}}}`),
                  ).map((v) => (
                    <Badge
                      key={v.key}
                      variant="secondary"
                      className="text-xs font-mono"
                    >{`{{${v.key}}}`}</Badge>
                  ))}
                  {TEMPLATE_VARIABLES.filter((v) =>
                    previewTemplate.content.includes(`{{${v.key}}}`),
                  ).length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      Nenhuma variavel
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? As tarefas
              vinculadas nao serao afetadas.
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
