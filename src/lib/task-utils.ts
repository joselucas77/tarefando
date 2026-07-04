import { format, parseISO, differenceInDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Priority, TaskStatus } from "./types";

export function getPriorityConfig(priority: Priority) {
  const configs = {
    baixa: {
      label: "Baixa",
      color:
        "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      dot: "bg-slate-400",
      ring: "ring-slate-300",
    },
    media: {
      label: "Media",
      color:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      dot: "bg-blue-400",
      ring: "ring-blue-300",
    },
    alta: {
      label: "Alta",
      color:
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
      dot: "bg-orange-400",
      ring: "ring-orange-300",
    },
    urgente: {
      label: "Urgente",
      color:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
      dot: "bg-red-500",
      ring: "ring-red-300",
    },
  };
  return configs[priority];
}

export function getStatusConfig(status: TaskStatus) {
  const configs = {
    pendente: {
      label: "Pendente",
      color:
        "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
      dot: "bg-yellow-400",
    },
    em_andamento: {
      label: "Em andamento",
      color:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      dot: "bg-blue-400",
    },
    concluida: {
      label: "Concluida",
      color:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
      dot: "bg-green-500",
    },
    atrasada: {
      label: "Atrasada",
      color:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
      dot: "bg-red-500",
    },
  };
  return configs[status];
}

export function getOverdueDays(date: string): number {
  const taskDate = startOfDay(parseISO(date));
  const today = startOfDay(new Date());
  return differenceInDays(today, taskDate);
}

export function formatTaskDate(date: string): string {
  try {
    return format(parseISO(date), "dd 'de' MMM", { locale: ptBR });
  } catch {
    return date;
  }
}

export function formatTaskDateTime(date: string, time: string): string {
  try {
    return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR }) + " " + time;
  } catch {
    return `${date} ${time}`;
  }
}

export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function applyTemplateVariables(
  content: string,
  variables: Record<string, string>,
): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
}

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluida" },
  { value: "atrasada", label: "Atrasada" },
];

export const TEMPLATE_VARIABLES = [
  { key: "titulo", description: "Titulo da tarefa" },
  { key: "descricao", description: "Descricao da tarefa" },
  { key: "data", description: "Data da tarefa" },
  { key: "hora", description: "Horario da tarefa" },
  { key: "prioridade", description: "Nivel de prioridade" },
  { key: "itens", description: "Lista de itens (para agrupamentos)" },
];
