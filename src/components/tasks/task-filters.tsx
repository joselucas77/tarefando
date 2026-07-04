'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { FilterState, TaskStatus, Priority } from '@/lib/types'
import { useCategories } from '@/hooks/use-app-data'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluidas' },
  { value: 'atrasada', label: 'Atrasadas' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

const DATE_OPTIONS: { value: FilterState['dateRange']; label: string }[] = [
  { value: 'all', label: 'Qualquer data' },
  { value: 'today', label: 'Hoje' },
  { value: 'tomorrow', label: 'Amanha' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'next_week', label: 'Proxima semana' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'custom', label: 'Intervalo personalizado' },
]

const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'deadline_asc', label: 'Prazo mais proximo' },
  { value: 'deadline_desc', label: 'Prazo mais distante' },
  { value: 'alphabetical', label: 'Ordem alfabetica' },
]

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:bg-accent'
      )}
    >
      {children}
    </button>
  )
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const { categories } = useCategories()
  const [open, setOpen] = useState(false)
  const [filterSearch, setFilterSearch] = useState('')

  const activeCount = [
    filters.statuses.length > 0,
    filters.priorities.length > 0,
    filters.categoryIds.length > 0,
    filters.dateRange !== 'all',
    filters.withReminder !== undefined,
    filters.withTemplate !== undefined,
    filters.sortBy !== 'newest',
  ].filter(Boolean).length

  function toggleStatus(s: TaskStatus) {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter(x => x !== s)
      : [...filters.statuses, s]
    onChange({ ...filters, statuses: next })
  }

  function togglePriority(p: Priority) {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter(x => x !== p)
      : [...filters.priorities, p]
    onChange({ ...filters, priorities: next })
  }

  function toggleCategory(id: string) {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter(x => x !== id)
      : [...filters.categoryIds, id]
    onChange({ ...filters, categoryIds: next })
  }

  function clearAll() {
    onChange({
      ...filters,
      statuses: [],
      priorities: [],
      categoryIds: [],
      dateRange: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'newest',
      withReminder: undefined,
      withTemplate: undefined,
    })
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(filterSearch.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Filter className="w-4 h-4" />
          Filtros
          {activeCount > 0 && (
            <Badge className="h-4 w-4 p-0 text-xs flex items-center justify-center absolute -top-1.5 -right-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Filtros</span>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 text-xs">
              <X className="w-3 h-3 mr-1" /> Limpar
            </Button>
          )}
        </div>

        {/* Search filters */}
        <div className="px-4 pt-3 pb-2">
          <Input
            placeholder="Buscar filtros..."
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <ScrollArea className="h-[420px]">
          <div className="px-4 pb-4 space-y-4">
            {/* Status */}
            {!filterSearch || 'status'.includes(filterSearch.toLowerCase()) || STATUS_OPTIONS.some(s => s.label.toLowerCase().includes(filterSearch.toLowerCase())) ? (
              <FilterSection title="Status">
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <ToggleChip
                      key={s.value}
                      active={filters.statuses.includes(s.value)}
                      onClick={() => toggleStatus(s.value)}
                    >
                      {s.label}
                    </ToggleChip>
                  ))}
                </div>
              </FilterSection>
            ) : null}

            {/* Priority */}
            {!filterSearch || 'prioridade'.includes(filterSearch.toLowerCase()) || PRIORITY_OPTIONS.some(p => p.label.toLowerCase().includes(filterSearch.toLowerCase())) ? (
              <>
                <Separator />
                <FilterSection title="Prioridade">
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITY_OPTIONS.map(p => (
                      <ToggleChip
                        key={p.value}
                        active={filters.priorities.includes(p.value)}
                        onClick={() => togglePriority(p.value)}
                      >
                        {p.label}
                      </ToggleChip>
                    ))}
                  </div>
                </FilterSection>
              </>
            ) : null}

            {/* Categories */}
            {filteredCategories.length > 0 && (
              <>
                <Separator />
                <FilterSection title="Categorias">
                  <div className="flex flex-wrap gap-1.5">
                    {filteredCategories.map(c => (
                      <ToggleChip
                        key={c.id}
                        active={filters.categoryIds.includes(c.id)}
                        onClick={() => toggleCategory(c.id)}
                      >
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </span>
                      </ToggleChip>
                    ))}
                  </div>
                </FilterSection>
              </>
            )}

            {/* Date */}
            <>
              <Separator />
              <FilterSection title="Periodo">
                <div className="flex flex-wrap gap-1.5">
                  {DATE_OPTIONS.filter(d => !filterSearch || d.label.toLowerCase().includes(filterSearch.toLowerCase())).map(d => (
                    <ToggleChip
                      key={d.value}
                      active={filters.dateRange === d.value}
                      onClick={() => onChange({ ...filters, dateRange: d.value })}
                    >
                      {d.label}
                    </ToggleChip>
                  ))}
                </div>
                {filters.dateRange === 'custom' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">De</p>
                      <Input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ate</p>
                      <Input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={e => onChange({ ...filters, dateTo: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </FilterSection>
            </>

            {/* Sort */}
            <>
              <Separator />
              <FilterSection title="Ordenacao">
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.filter(s => !filterSearch || s.label.toLowerCase().includes(filterSearch.toLowerCase())).map(s => (
                    <ToggleChip
                      key={s.value}
                      active={filters.sortBy === s.value}
                      onClick={() => onChange({ ...filters, sortBy: s.value })}
                    >
                      {s.label}
                    </ToggleChip>
                  ))}
                </div>
              </FilterSection>
            </>

            {/* Others */}
            <>
              <Separator />
              <FilterSection title="Outros">
                <div className="flex flex-wrap gap-1.5">
                  <ToggleChip
                    active={filters.withReminder === true}
                    onClick={() => onChange({ ...filters, withReminder: filters.withReminder === true ? undefined : true })}
                  >
                    Com lembrete
                  </ToggleChip>
                  <ToggleChip
                    active={filters.withReminder === false}
                    onClick={() => onChange({ ...filters, withReminder: filters.withReminder === false ? undefined : false })}
                  >
                    Sem lembrete
                  </ToggleChip>
                  <ToggleChip
                    active={filters.withTemplate === true}
                    onClick={() => onChange({ ...filters, withTemplate: filters.withTemplate === true ? undefined : true })}
                  >
                    Com template
                  </ToggleChip>
                  <ToggleChip
                    active={filters.withTemplate === false}
                    onClick={() => onChange({ ...filters, withTemplate: filters.withTemplate === false ? undefined : false })}
                  >
                    Sem template
                  </ToggleChip>
                </div>
              </FilterSection>
            </>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
