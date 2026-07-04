export type Priority = "baixa" | "media" | "alta" | "urgente";
export type TaskStatus = "pendente" | "em_andamento" | "concluida" | "atrasada";
export type ReminderStatus = "agendado" | "enviado" | "cancelado";
export type Theme = "light" | "dark" | "system";

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM
  priority: Priority;
  categoryId: string;
  status: TaskStatus;
  notes: string;
  reminder: boolean;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderHistory {
  id: string;
  taskId: string;
  taskTitle: string;
  templateId?: string;
  templateName?: string;
  date: string;
  time: string;
  status: ReminderStatus;
  sentAt?: string;
  createdAt: string;
}

export interface AppSettings {
  theme: Theme;
  defaultPriority: Priority;
  defaultCategoryId: string;
  defaultStatus: TaskStatus;
}

export interface FilterState {
  search: string;
  statuses: TaskStatus[];
  priorities: Priority[];
  categoryIds: string[];
  dateRange:
    | "all"
    | "today"
    | "tomorrow"
    | "this_week"
    | "next_week"
    | "this_month"
    | "custom";
  dateFrom?: string;
  dateTo?: string;
  sortBy:
    | "newest"
    | "oldest"
    | "deadline_asc"
    | "deadline_desc"
    | "alphabetical";
  withReminder?: boolean;
  withTemplate?: boolean;
}
