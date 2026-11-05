import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { PLACEHOLDER } from '@/utils/format'
import { cn } from '@/utils/cn'

interface MetricCardProps {
  icone: LucideIcon
  titulo: string
  /** Valor já formatado (ou "NaN"). */
  valor: string
  unidade?: string
  detalhe?: ReactNode
  /** Cor do ícone (classe Tailwind). */
  corIcone?: string
}

/** Card de vidro do topo: ícone, valor grande, nome e detalhe. */
export function MetricCard({
  icone: Icone,
  titulo,
  valor,
  unidade,
  detalhe,
  corIcone = 'text-white',
}: MetricCardProps) {
  const semDado = valor === PLACEHOLDER

  return (
    <GlassCard className="flex animate-fade-in flex-col items-center px-4 py-6 text-center">
      <Icone className={cn('size-12 drop-shadow', corIcone)} strokeWidth={1.5} aria-hidden />

      <p
        className={cn(
          'mt-3 text-4xl font-light tabular-nums transition-colors',
          semDado && 'text-white/40',
        )}
      >
        {valor}
        {!semDado && unidade && <span className="ml-0.5 text-2xl text-white/70">{unidade}</span>}
      </p>

      <h3 className="mt-1 text-lg">{titulo}</h3>
      {detalhe && <div className="mt-2 text-sm text-white/70">{detalhe}</div>}
    </GlassCard>
  )
}
