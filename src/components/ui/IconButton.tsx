import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Texto para leitores de tela (o botão só tem ícone). */
  rotulo: string
}

export function IconButton({ rotulo, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className={cn(
        'grid size-11 place-items-center rounded-full border border-white/15 bg-glass text-white backdrop-blur-xl transition',
        'hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
