"use client";

import { useState, useEffect } from "react";
import { useSettings, useCategories, useTemplates } from "@/hooks/use-app-data";
import { useTasks } from "@/hooks/use-tasks";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  Palette,
  ListTodo,
  Tag,
  FileText,
  Trash2,
  RotateCcw,
  Info,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Send,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/task-utils";
import type { Theme } from "@/lib/types";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

// Telegram SVG icon
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
    </svg>
  );
}

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export default function configuracoesPage() {
  const { settings, updateSettings } = useSettings();
  const { categories } = useCategories();
  const { templates } = useTemplates();
  const { tasks, getStats } = useTasks();
  const { theme, setTheme } = useTheme();

  const { value: telegramConfig, setValue: setTelegramConfig } =
    useLocalStorage<TelegramConfig>("taskflow:telegram", {
      botToken: "",
      chatId: "",
    });

  const [clearDataOpen, setClearDataOpen] = useState(false);
  const [resetSettingsOpen, setResetSettingsOpen] = useState(false);

  // Telegram form state — synced from storage after mount via useEffect
  const [telegramForm, setTelegramForm] = useState<TelegramConfig>({
    botToken: "",
    chatId: "",
  });
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (telegramConfig.botToken || telegramConfig.chatId) {
      setTelegramForm({
        botToken: telegramConfig.botToken,
        chatId: telegramConfig.chatId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramConfig.botToken, telegramConfig.chatId]);
  const [removeTelegramOpen, setRemoveTelegramOpen] = useState(false);

  const stats = getStats();
  const isTelegramConfigured = !!(
    telegramConfig.botToken && telegramConfig.chatId
  );

  function handleSaveTelegram() {
    if (!telegramForm.botToken.trim() || !telegramForm.chatId.trim()) {
      toast.error("Preencha o Bot Token e o Chat ID.");
      return;
    }
    setTelegramConfig(telegramForm);
    toast.success("Configuracao do Telegram salva!");
  }

  function handleRemoveTelegram() {
    setTelegramConfig({ botToken: "", chatId: "" });
    setTelegramForm({ botToken: "", chatId: "" });
    setRemoveTelegramOpen(false);
    toast.success("Integracao com Telegram removida.");
  }

  function handleClearData() {
    const keysToRemove = [
      "taskflow:tasks",
      "taskflow:reminders",
      "taskflow:categories",
      "taskflow:templates",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    setClearDataOpen(false);
    toast.success("Dados limpos. Recarregue a pagina para ver as mudancas.", {
      action: { label: "Recarregar", onClick: () => window.location.reload() },
    });
  }

  function handleResetSettings() {
    updateSettings({
      theme: "system",
      defaultPriority: "media",
      defaultCategoryId: categories[0]?.id || "",
      defaultStatus: "pendente",
    });
    setTheme("system");
    setResetSettingsOpen(false);
    toast.success("configuracões resetadas para o padrão.");
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      {/* Appearance */}
      <Card className="cyber-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Aparencia
          </CardTitle>
          <CardDescription className="text-xs">
            Escolha o tema da interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value);
                  updateSettings({ theme: value });
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  theme === value
                    ? "border-primary bg-primary/8 neon-glow-sm"
                    : "border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border",
                )}
                aria-label={`Tema ${label}`}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    theme === value ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    theme === value ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Defaults */}
      <Card className="cyber-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary" />
            padrão para novas tarefas
          </CardTitle>
          <CardDescription className="text-xs">
            Valores pre-preenchidos ao criar uma nova tarefa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Prioridade padrão</Label>
              <Select
                value={settings.defaultPriority}
                onValueChange={(v) =>
                  updateSettings({
                    defaultPriority: v as typeof settings.defaultPriority,
                  })
                }
              >
                <SelectTrigger className="h-9">
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
              <Label className="text-xs">Status padrão</Label>
              <Select
                value={settings.defaultStatus}
                onValueChange={(v) =>
                  updateSettings({
                    defaultStatus: v as typeof settings.defaultStatus,
                  })
                }
              >
                <SelectTrigger className="h-9">
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
          <div className="space-y-1.5">
            <Label className="text-xs">Categoria padrão</Label>
            <Select
              value={settings.defaultCategoryId}
              onValueChange={(v) => updateSettings({ defaultCategoryId: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar categoria..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Integration */}
      <Card
        className={cn(
          "cyber-card border-0 relative overflow-hidden",
          isTelegramConfigured && "border border-[#29b6f6]/20",
        )}
      >
        {isTelegramConfigured && (
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#29b6f6]/50 to-transparent" />
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TelegramIcon className="w-4 h-4 text-[#29b6f6]" />
              Integracao com Telegram
            </CardTitle>
            {isTelegramConfigured ? (
              <Badge className="text-xs gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2">
                <CheckCircle2 className="w-3 h-3" />
                Configurado
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs gap-1 px-2">
                <XCircle className="w-3 h-3" />
                Nao configurado
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Receba notificacoes de lembretes diretamente no Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bot-token" className="text-xs">
              Bot Token
            </Label>
            <div className="relative">
              <Input
                id="bot-token"
                type={showToken ? "text" : "password"}
                placeholder="1234567890:ABCDefGhIJKlmNOpQRsTUVwxyZ"
                value={telegramForm.botToken}
                onChange={(e) =>
                  setTelegramForm((f) => ({ ...f, botToken: e.target.value }))
                }
                className="pr-10 h-9 font-mono text-xs bg-muted/40 border-border/60"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showToken ? "Ocultar token" : "Mostrar token"}
              >
                {showToken ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha o token conversando com o{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#29b6f6] hover:underline"
              >
                @BotFather
              </a>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chat-id" className="text-xs">
              Chat ID
            </Label>
            <Input
              id="chat-id"
              placeholder="-1001234567890"
              value={telegramForm.chatId}
              onChange={(e) =>
                setTelegramForm((f) => ({ ...f, chatId: e.target.value }))
              }
              className="h-9 font-mono text-xs bg-muted/40 border-border/60"
            />
            <p className="text-xs text-muted-foreground">
              Use o{" "}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#29b6f6] hover:underline"
              >
                @userinfobot
              </a>{" "}
              para obter seu Chat ID
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="gap-2 h-8"
              onClick={handleSaveTelegram}
            >
              <Send className="w-3.5 h-3.5" />
              Salvar configuracao
            </Button>
            {isTelegramConfigured && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-8 text-destructive hover:text-destructive hover:bg-destructive/8"
                onClick={() => setRemoveTelegramOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover
              </Button>
            )}
          </div>

          {isTelegramConfigured && (
            <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Integracao ativa. Lembretes serao enviados para o Telegram.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App stats */}
      <Card className="cyber-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Resumo dos dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Total de tarefas", value: stats.total, icon: ListTodo },
              { label: "Categorias", value: categories.length, icon: Tag },
              { label: "Templates", value: templates.length, icon: FileText },
              { label: "Concluidas", value: stats.completed, icon: Settings2 },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
              >
                <div className="p-2 rounded-lg bg-primary/8">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {label}
                  </p>
                  <p className="text-lg font-bold tabular-nums leading-tight">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage info */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium">Armazenamento local</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todos os dados sao salvos no{" "}
            <code className="font-mono bg-muted px-1 rounded text-[11px]">
              localStorage
            </code>{" "}
            do navegador e persistem entre sessoes neste dispositivo.
          </p>
        </div>
      </div>

      {/* Danger zone */}
      <Card className="cyber-card border-0 border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Zona de perigo
          </CardTitle>
          <CardDescription className="text-xs">
            Acoes irreversiveis — tome cuidado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50">
            <div>
              <p className="text-sm font-medium">Resetar configuracões</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Volta todas as configuracões para o padrão original
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0 h-8"
              onClick={() => setResetSettingsOpen(true)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar
            </Button>
          </div>

          <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-destructive/25 bg-destructive/5">
            <div>
              <p className="text-sm font-medium text-destructive">
                Limpar todos os dados
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remove todas as tarefas, categorias e templates. Esta acao e{" "}
                <strong>irreversivel</strong>.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2 shrink-0 h-8"
              onClick={() => setClearDataOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar dados</span>
              <span className="sm:hidden">Limpar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AlertDialog open={resetSettingsOpen} onOpenChange={setResetSettingsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar configuracões</AlertDialogTitle>
            <AlertDialogDescription>
              Isso ira redefinir o tema, prioridade padrão, status padrão e
              categoria padrão para os valores originais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings}>
              Resetar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearDataOpen} onOpenChange={setClearDataOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao ira remover permanentemente todas as suas tarefas (
              {stats.total}), categorias ({categories.length}) e templates (
              {templates.length}). Nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, limpar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={removeTelegramOpen}
        onOpenChange={setRemoveTelegramOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remover integracao com Telegram?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O Bot Token e o Chat ID serao removidos do armazenamento local.
              Voce podera reconfigurar a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveTelegram}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
