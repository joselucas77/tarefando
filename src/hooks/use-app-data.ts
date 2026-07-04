"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TEMPLATES,
  DEFAULT_REMINDER_HISTORY,
  DEFAULT_SETTINGS,
} from "@/lib/mock-data";
import type {
  Category,
  Template,
  ReminderHistory,
  AppSettings,
} from "@/lib/types";

export function useCategories() {
  const {
    value: categories,
    setValue: setCategories,
    isLoaded,
  } = useLocalStorage<Category[]>("taskflow:categories", DEFAULT_CATEGORIES);

  const addCategory = useCallback(
    (cat: Category) => {
      setCategories((prev) => [...prev, cat]);
    },
    [setCategories],
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    },
    [setCategories],
  );

  return { categories, isLoaded, addCategory, updateCategory, deleteCategory };
}

export function useTemplates() {
  const {
    value: templates,
    setValue: setTemplates,
    isLoaded,
  } = useLocalStorage<Template[]>("taskflow:templates", DEFAULT_TEMPLATES);

  const addTemplate = useCallback(
    (tpl: Template) => {
      setTemplates((prev) => [...prev, tpl]);
    },
    [setTemplates],
  );

  const updateTemplate = useCallback(
    (id: string, updates: Partial<Template>) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t,
        ),
      );
    },
    [setTemplates],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    },
    [setTemplates],
  );

  const duplicateTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => {
        const original = prev.find((t) => t.id === id);
        if (!original) return prev;
        const copy: Template = {
          ...original,
          id: `tpl-${Date.now()}`,
          name: `${original.name} (copia)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...prev, copy];
      });
    },
    [setTemplates],
  );

  return {
    templates,
    isLoaded,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  };
}

export function useReminderHistory() {
  const {
    value: history,
    setValue: setHistory,
    isLoaded,
  } = useLocalStorage<ReminderHistory[]>(
    "taskflow:reminders",
    DEFAULT_REMINDER_HISTORY,
  );

  const addReminder = useCallback(
    (reminder: ReminderHistory) => {
      setHistory((prev) => [reminder, ...prev]);
    },
    [setHistory],
  );

  const updateReminderStatus = useCallback(
    (id: string, status: ReminderHistory["status"]) => {
      setHistory((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                sentAt:
                  status === "enviado" ? new Date().toISOString() : r.sentAt,
              }
            : r,
        ),
      );
    },
    [setHistory],
  );

  const resendReminder = useCallback(
    (id: string) => {
      setHistory((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "enviado", sentAt: new Date().toISOString() }
            : r,
        ),
      );
    },
    [setHistory],
  );

  return {
    history,
    isLoaded,
    addReminder,
    updateReminderStatus,
    resendReminder,
  };
}

export function useSettings() {
  const {
    value: settings,
    setValue: setSettings,
    isLoaded,
  } = useLocalStorage<AppSettings>("taskflow:settings", DEFAULT_SETTINGS);

  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [setSettings],
  );

  return { settings, isLoaded, updateSettings };
}
