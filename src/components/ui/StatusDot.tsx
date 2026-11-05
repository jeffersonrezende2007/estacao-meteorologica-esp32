import { cn } from '@/utils/cn'
import type { TomStatus } from '@/utils/sensores'

const cores: Record<TomStatus, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  off: 'bg-off',
  neutro: 'bg-white/40',
}

interface StatusDotProps {
  tom: TomStatus
  /** Anel pulsando em volta (indica "ao vivo"). */
  pulsar?: boolean
  className?: string
}

export function StatusDot({ tom, pulsar = false, className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex size-2.5 shrink-0', className)} aria-hidden>
      {pulsar && (
        <span className={cn('absolute inset-0 animate-ping rounded-full opacity-75', cores[tom])} />
      )}
      <span className={cn('relative inline-flex size-full rounded-full', cores[tom])} />
    </span>
  )
}
