import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

/** Card de vidro fosco usado sobre o fundo do céu. */
export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-white/15 bg-glass shadow-xl shadow-black/20 backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}
