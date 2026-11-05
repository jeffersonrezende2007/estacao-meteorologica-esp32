import type { ReactNode } from 'react'
import { useArrastarPainel } from '@/hooks/useArrastarPainel'
import { cn } from '@/utils/cn'

interface DraggableSheetProps {
  children: ReactNode
  className?: string
}

/** Painel escuro que pode ser puxado para baixo (mostra o céu) e para cima. */
export function DraggableSheet({ children, className }: DraggableSheetProps) {
  const { ref, offset, arrastando, alcaProps } = useArrastarPainel<HTMLElement>()

  return (
    <main
      ref={ref}
      className={cn(
        'relative z-10 rounded-t-[2.5rem] bg-black shadow-[0_-20px_60px_rgba(0,0,0,0.35)]',
        // Extensão preta abaixo do painel: ao puxar para cima não aparece "buraco" embaixo
        'after:absolute after:inset-x-0 after:top-full after:h-screen after:bg-black',
        !arrastando && 'transition-transform duration-500 ease-out',
        className,
      )}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {/* Alça para arrastar */}
      <div className="flex justify-center pt-3">
        <button
          type="button"
          aria-label="Arrastar painel (setas para mover, Esc para voltar)"
          title="Arraste para ver o céu · clique duplo para voltar"
          className={cn(
            'group flex h-8 w-28 touch-none items-center justify-center rounded-full',
            'focus-visible:outline-2 focus-visible:outline-white/60',
            arrastando ? 'cursor-grabbing' : 'cursor-grab',
          )}
          {...alcaProps}
        >
          <span
            className={cn(
              'h-1.5 w-14 rounded-full transition-colors',
              arrastando ? 'bg-white/70' : 'bg-white/25 group-hover:bg-white/50',
            )}
          />
        </button>
      </div>

      {children}
    </main>
  )
}