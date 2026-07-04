"use client";

import { useTasks } from "@/hooks/use-tasks";
import { useCategories } from "@/hooks/use-app-data";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  Activity,
  ListTodo,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusBadge } from "@/components/tasks/status-badge";
import { formatTaskDate, getOverdueDays } from "@/lib/task-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
  accentClass,
  description,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  accentClass: string;
  description?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="cyber-card rounded-lg p-4">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-7 w-12 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  return (
    <div className="cyber-card rounded-lg p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg shrink-0", accentClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, isLoaded, getStats, getUpcomingTasks } = useTasks();
  const { categories } = useCategories();

  const stats = getStats();
  const upcomingTasks = getUpcomingTasks();

  // Dates must be derived client-side only to avoid SSR/client hydration mismatch
  const [todayStr, setTodayStr] = useState("");
  const [todayDateKey, setTodayDateKey] = useState("");
  useEffect(() => {
    setTodayStr(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }));
    setTodayDateKey(format(new Date(), "yyyy-MM-dd"));
  }, []);

  const overdueTasks = tasks.filter((t) => t.status === "atrasada");
  const todayTasks = tasks.filter((t) => t.date === todayDateKey);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "Sem categoria";
  const getCategoryColor = (id: string) =>
    categories.find((c) => c.id === id)?.color || "#888";

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Bom dia!
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5 capitalize">
          {todayStr}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          loading={!isLoaded}
          title="Total"
          value={stats.total}
          icon={ListTodo}
          accentClass="bg-primary/10 text-primary"
        />
        <StatCard
          loading={!isLoaded}
          title="Pendentes"
          value={stats.pending}
          icon={Clock}
          accentClass="bg-yellow-500/10 text-yellow-500"
        />
        <StatCard
          loading={!isLoaded}
          title="Em andamento"
          value={stats.inProgress}
          icon={Activity}
          accentClass="bg-sky-500/10 text-sky-500"
        />
        <StatCard
          loading={!isLoaded}
          title="Concluidas"
          value={stats.completed}
          icon={CheckCircle2}
          accentClass="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          loading={!isLoaded}
          title="Atrasadas"
          value={stats.overdue}
          icon={AlertTriangle}
          accentClass="bg-destructive/10 text-destructive"
        />
        <StatCard
          loading={!isLoaded}
          title="Hoje"
          value={stats.todayTasks}
          icon={CalendarDays}
          accentClass="bg-violet-500/10 text-violet-500"
        />
      </div>

      {/* Productivity bar */}
      <div className="cyber-card rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Taxa de conclusao</span>
          </div>
          <span className="text-xl font-bold text-primary tabular-nums">
            {stats.completionRate}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-700"
            style={{
              width: `${stats.completionRate}%`,
              boxShadow:
                stats.completionRate > 0 ? "0 0 6px var(--neon)" : "none",
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stats.completed} de {stats.total} tarefas concluidas
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's Tasks */}
        <Card className="cyber-card border-0">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Tarefas de hoje
              </CardTitle>
              <Link href="/tarefas">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  Ver todas <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            {!isLoaded ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : todayTasks.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma tarefa para hoje
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className="w-1 h-9 rounded-full shrink-0"
                      style={{
                        backgroundColor: getCategoryColor(task.categoryId),
                        boxShadow: `0 0 4px ${getCategoryColor(task.categoryId)}60`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.time}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="cyber-card border-0">
          <CardHeader className="pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Proximas tarefas
              </CardTitle>
              <Link href="/tarefas">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  Ver todas <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            {!isLoaded ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Sem proximas tarefas
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {formatTaskDate(task.date)}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${getCategoryColor(task.categoryId)}15`,
                            color: getCategoryColor(task.categoryId),
                          }}
                        >
                          {getCategoryName(task.categoryId)}
                        </span>
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div className="cyber-card rounded-lg border-destructive/30 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <h3 className="text-sm font-semibold text-destructive">
              Tarefas atrasadas ({overdueTasks.length})
            </h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {overdueTasks.map((task) => {
              const days = getOverdueDays(task.date);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div
                    className="w-1 h-9 rounded-full bg-destructive shrink-0"
                    style={{ boxShadow: "0 0 4px var(--destructive)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-destructive/80">
                      {days} {days === 1 ? "dia" : "dias"} em atraso
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <Badge
                      variant="destructive"
                      className="text-xs hidden sm:inline-flex"
                    >
                      Atrasada
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
