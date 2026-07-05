"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import { useCategories, useTemplates } from "@/hooks/use-app-data";
import { useSettings } from "@/hooks/use-app-data";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, generateId } from "@/lib/task-utils";

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { categories } = useCategories();
  const { templates } = useTemplates();
  const { settings } = useSettings();

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [date, setDate] = useState<Date | undefined>(
    task?.date ? parseISO(task.date) : undefined,
  );
  const [time, setTime] = useState(task?.time || "09:00");
  const [priority, setPriority] = useState<Priority>(
    task?.priority || settings.defaultPriority,
  );
  const [categoryId, setCategoryId] = useState(
    task?.categoryId || settings.defaultCategoryId,
  );
  const [status, setStatus] = useState<TaskStatus>(
    task?.status || settings.defaultStatus,
  );
  const [notes, setNotes] = useState(task?.notes || "");
  const [reminder, setReminder] = useState(task?.reminder ?? false);
  const [templateId, setTemplateId] = useState(task?.templateId || "");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCategory = categories.find((c) => c.id === categoryId);

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Titulo e obrigatorio";
    if (!date) e.date = "Data e obrigatoria";
    if (!categoryId) e.categoryId = "Categoria e obrigatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const now = new Date().toISOString();
    onSubmit({
      id: task?.id || generateId("task"),
      title: title.trim(),
      description: description.trim(),
      date: date ? format(date, "yyyy-MM-dd") : "",
      time,
      priority,
      categoryId,
      status,
      notes: notes.trim(),
      reminder,
      templateId: templateId || undefined,
      createdAt: task?.createdAt || now,
      updatedAt: now,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Titulo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da tarefa..."
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descricao</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva a tarefa..."
          rows={3}
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>
            Data <span className="text-destructive">*</span>
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  errors.date && "border-destructive",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setCalendarOpen(false);
                }}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="time">Horario</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Priority & Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as Priority)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TaskStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>
          Categoria <span className="text-destructive">*</span>
        </Label>
        <Select
          value={categoryId}
          onValueChange={(v) => setCategoryId(v ?? "")}
        >
          <SelectTrigger
            className={errors.categoryId ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Selecionar categoria">
              {selectedCategory ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  {selectedCategory.name}
                </span>
              ) : (
                "Selecionar categoria"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId}</p>
        )}
      </div>

      {/* Template */}
      <div className="space-y-1.5">
        <Label>Template (opcional)</Label>
        <Select
          value={templateId || "none"}
          onValueChange={(v) => setTemplateId(v === "none" ? "" : (v ?? ""))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Nenhum template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observacoes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observacoes adicionais..."
          rows={2}
        />
      </div>

      {/* Reminder */}
      <div className="flex items-center justify-between py-2 border-t border-border">
        <div>
          <p className="text-sm font-medium">Lembrete</p>
          <p className="text-xs text-muted-foreground">
            Ativar simulacao de lembrete
          </p>
        </div>
        <Switch checked={reminder} onCheckedChange={setReminder} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {task ? "Salvar alteracoes" : "Criar tarefa"}
        </Button>
      </div>
    </form>
  );
}
