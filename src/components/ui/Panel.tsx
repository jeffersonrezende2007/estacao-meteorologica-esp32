import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PanelProps {
  titulo?: string
  icone?: LucideIcon
  /** Conteúdo extra à direita do título (ex.: filtros). */
  acao?: ReactNode
  className?: string
  children: ReactNode
}

/** Painel escuro da parte de baixo do dashboard. */
export function Panel({ titulo, icone: Icone, acao, className, children }: PanelProps) {
  return (
    <section
      className={cn(
        'flex animate-fade-in flex-col rounded-3xl border border-panel-border bg-panel p-5',
        className,
      )}
    >
      {(titulo || acao) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {titulo && (
            <h2 className="flex items-center gap-2 text-lg font-medium">
              {Icone && <Icone className="size-5 text-accent-soft" aria-hidden />}
              {titulo}
            </h2>
          )}
          {acao}
        </header>
      )}
      {children}
    </section>
  )
}
