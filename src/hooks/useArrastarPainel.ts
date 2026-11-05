import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

/** Quanto do painel (em px) sempre fica visível embaixo ao puxar para baixo. */
const VISIVEL_MINIMO = 72
/** Até onde o painel pode subir (logo abaixo do header). */
const TOPO_MINIMO = 96
/** Quanto as setas do teclado movem o painel. */
const PASSO_TECLADO = 60

/**
 * Deixa um painel arrastável na vertical pela "alça".
 * offset = quantos px o painel está deslocado da posição original.
 */
export function useArrastarPainel<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [offset, setOffset] = useState(0)
  const [arrastando, setArrastando] = useState(false)
  const inicio = useRef({ y: 0, offset: 0 })

  /** Impede que o painel saia da tela ou cubra o header. */
  const limitar = useCallback((valor: number) => {
    const el = ref.current
    if (!el) return valor
    const topoNaTela = el.offsetTop - window.scrollY
    const max = Math.max(window.innerHeight - topoNaTela - VISIVEL_MINIMO, 0)
    const min = Math.min(-(el.offsetTop - TOPO_MINIMO), 0)
    return Math.min(Math.max(valor, min), max)
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    inicio.current = { y: e.clientY, offset }
    setArrastando(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!arrastando) return
    setOffset(limitar(inicio.current.offset + e.clientY - inicio.current.y))
  }

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setArrastando(false)
  }

  // Acessibilidade: setas movem, Esc/Home volta para a posição original
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown') setOffset((o) => limitar(o + PASSO_TECLADO))
    else if (e.key === 'ArrowUp') setOffset((o) => limitar(o - PASSO_TECLADO))
    else if (e.key === 'Escape' || e.key === 'Home') setOffset(0)
    else return
    e.preventDefault()
  }

  /** Clique duplo na alça volta o painel para o lugar. */
  const onDoubleClick = () => setOffset(0)

  return {
    ref,
    offset,
    arrastando,
    alcaProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onKeyDown,
      onDoubleClick,
    },
  }
}