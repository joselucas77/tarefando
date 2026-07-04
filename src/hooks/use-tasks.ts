"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { DEFAULT_TASKS } from "@/lib/mock-data";
import type { Task, FilterState } from "@/lib/types";
import {
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  parseISO,
  startOfDay,
} from "date-fns";

export function useTasks() {
  const {
    value: tasks,
    setValue: setTasks,
    isLoaded,
  } = useLocalStorage<Task[]>("taskflow:tasks", DEFAULT_TASKS);

  const addTask = useCallback(
    (task: Task) => {
      setTasks((prev) => [task, ...prev]);
    },
    [setTasks],
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t,
        ),
      );
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks],
  );

  const deleteTasks = useCallback(
    (ids: string[]) => {
      setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    },
    [setTasks],
  );

  const completeTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "concluida", updatedAt: new Date().toISOString() }
            : t,
        ),
      );
    },
    [setTasks],
  );

  const reopenTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "pendente", updatedAt: new Date().toISOString() }
            : t,
        ),
      );
    },
    [setTasks],
  );

  // Check and update overdue tasks
  const getTasksWithOverdueCheck = useCallback((taskList: Task[]) => {
    const now = startOfDay(new Date());
    return taskList.map((task) => {
      if (task.status !== "concluida" && task.date) {
        const taskDate = startOfDay(parseISO(task.date));
        if (isBefore(taskDate, now)) {
          return { ...task, status: "atrasada" as const };
        }
      }
      return task;
    });
  }, []);

  const getFilteredTasks = useCallback(
    (filters: FilterState): Task[] => {
      const checkedTasks = getTasksWithOverdueCheck(tasks);
      let result = [...checkedTasks];
      const now = new Date();

      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.categoryId.toLowerCase().includes(q),
        );
      }

      // Status filter
      if (filters.statuses.length > 0) {
        result = result.filter((t) => filters.statuses.includes(t.status));
      }

      // Priority filter
      if (filters.priorities.length > 0) {
        result = result.filter((t) => filters.priorities.includes(t.priority));
      }

      // Category filter
      if (filters.categoryIds.length > 0) {
        result = result.filter((t) =>
          filters.categoryIds.includes(t.categoryId),
        );
      }

      // Date filter
      if (filters.dateRange !== "all") {
        result = result.filter((t) => {
          if (!t.date) return false;
          const taskDate = parseISO(t.date);
          switch (filters.dateRange) {
            case "today":
              return isToday(taskDate);
            case "tomorrow":
              return isTomorrow(taskDate);
            case "this_week":
              return (
                isAfter(taskDate, startOfWeek(now, { weekStartsOn: 0 })) &&
                isBefore(taskDate, endOfWeek(now, { weekStartsOn: 0 }))
              );
            case "next_week": {
              const nextWeekStart = startOfWeek(addWeeks(now, 1), {
                weekStartsOn: 0,
              });
              const nextWeekEnd = endOfWeek(addWeeks(now, 1), {
                weekStartsOn: 0,
              });
              return (
                isAfter(taskDate, nextWeekStart) &&
                isBefore(taskDate, nextWeekEnd)
              );
            }
            case "this_month":
              return (
                isAfter(taskDate, startOfMonth(now)) &&
                isBefore(taskDate, endOfMonth(now))
              );
            case "custom": {
              if (filters.dateFrom && filters.dateTo) {
                return (
                  isAfter(taskDate, parseISO(filters.dateFrom)) &&
                  isBefore(taskDate, parseISO(filters.dateTo))
                );
              }
              return true;
            }
            default:
              return true;
          }
        });
      }

      // Reminder filter
      if (filters.withReminder === true) {
        result = result.filter((t) => t.reminder);
      } else if (filters.withReminder === false) {
        result = result.filter((t) => !t.reminder);
      }

      // Template filter
      if (filters.withTemplate === true) {
        result = result.filter((t) => !!t.templateId);
      } else if (filters.withTemplate === false) {
        result = result.filter((t) => !t.templateId);
      }

      // Sort
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "deadline_asc":
            return (
              new Date(a.date + "T" + a.time).getTime() -
              new Date(b.date + "T" + b.time).getTime()
            );
          case "deadline_desc":
            return (
              new Date(b.date + "T" + b.time).getTime() -
              new Date(a.date + "T" + a.time).getTime()
            );
          case "alphabetical":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      return result;
    },
    [tasks, getTasksWithOverdueCheck],
  );

  const getStats = useCallback(() => {
    const checked = getTasksWithOverdueCheck(tasks);
    const total = checked.length;
    const pending = checked.filter((t) => t.status === "pendente").length;
    const inProgress = checked.filter(
      (t) => t.status === "em_andamento",
    ).length;
    const completed = checked.filter((t) => t.status === "concluida").length;
    const overdue = checked.filter((t) => t.status === "atrasada").length;
    const todayTasks = checked.filter(
      (t) => t.date && isToday(parseISO(t.date)),
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      todayTasks,
      completionRate,
    };
  }, [tasks, getTasksWithOverdueCheck]);

  const getTasksForDate = useCallback(
    (date: string) => {
      return tasks.filter((t) => t.date === date);
    },
    [tasks],
  );

  const getUpcomingTasks = useCallback(() => {
    const checked = getTasksWithOverdueCheck(tasks);
    return checked
      .filter(
        (t) =>
          t.status !== "concluida" &&
          t.date &&
          !isBefore(parseISO(t.date), startOfDay(new Date())),
      )
      .sort(
        (a, b) =>
          new Date(a.date + "T" + a.time).getTime() -
          new Date(b.date + "T" + b.time).getTime(),
      )
      .slice(0, 5);
  }, [tasks, getTasksWithOverdueCheck]);

  return {
    tasks: getTasksWithOverdueCheck(tasks),
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    completeTask,
    reopenTask,
    getFilteredTasks,
    getStats,
    getTasksForDate,
    getUpcomingTasks,
  };
}
