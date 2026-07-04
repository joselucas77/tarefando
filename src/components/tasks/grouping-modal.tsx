'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import type { Template } from '@/lib/types'
import { Layers, Plus, User } from 'lucide-react'

interface GroupingModalProps {
  open: boolean
  onClose: () => void
  existingTemplates: Template[]
  date: string
  onAddToTemplate: (templateId: string) => void
  onCreateNewTemplate: () => void
  onKeepIndividual: () => void
}

export function GroupingModal({
  open,
  onClose,
  existingTemplates,
  date,
  onAddToTemplate,
  onCreateNewTemplate,
  onKeepIndividual,
}: GroupingModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tarefas na mesma data</DialogTitle>
          <DialogDescription>
            Ja existem tarefas cadastradas para <span className="font-medium text-foreground">{date}</span>. Deseja agrupá-la em um template ou manter como tarefa individual?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Add to template */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Adicionar a um template existente</span>
            </div>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar template..." />
              </SelectTrigger>
              <SelectContent>
                {existingTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              disabled={!selectedTemplateId}
              onClick={() => onAddToTemplate(selectedTemplateId)}
            >
              Adicionar ao template
            </Button>
          </div>

          {/* Create new template */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Criar novo template</span>
            </div>
            <Button variant="outline" className="w-full" onClick={onCreateNewTemplate}>
              Criar template para esta data
            </Button>
          </div>

          {/* Keep individual */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Manter como tarefa individual</span>
            </div>
            <Button variant="ghost" className="w-full" onClick={onKeepIndividual}>
              Manter individual
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
