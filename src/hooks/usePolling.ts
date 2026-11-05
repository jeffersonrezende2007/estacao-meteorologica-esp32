import { useCallback, useEffect, useRef, useState } from 'react'

export interface PollingState<T> {
  data: T | null
  error: Error | null
  carregando: boolean
  ultimaAtualizacao: Date | null
  falhasConsecutivas: number
}

interface PollingOptions<T> {
  ativo?: boolean
  /** Chamado a cada resposta bem-sucedida (ex.: guardar histórico). */
  onSucesso?: (data: T, hora: Date) => void
}

const estadoInicial = {
  data: null,
  error: null,
  carregando: true,
  ultimaAtualizacao: null,
  falhasConsecutivas: 0,
}

export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervaloMs: number,
  { ativo = true, onSucesso }: PollingOptions<T> = {},
) {
  const [state, setState] = useState<PollingState<T>>(estadoInicial)
  const [tentativa, setTentativa] = useState(0)
  const fetcherRef = useRef(fetcher)
  const onSucessoRef = useRef(onSucesso)

  useEffect(() => {
    fetcherRef.current = fetcher
    onSucessoRef.current = onSucesso
  }, [fetcher, onSucesso])

  useEffect(() => {
    if (!ativo) return

    const controller = new AbortController()
    let timer: number | undefined

    const executar = async () => {
      try {
        const data = await fetcherRef.current(controller.signal)
        const agora = new Date()
        setState({
          data,
          error: null,
          carregando: false,
          ultimaAtualizacao: agora,
          falhasConsecutivas: 0,
        })
        onSucessoRef.current?.(data, agora)
      } catch (err) {
        if (controller.signal.aborted) return
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error(String(err)),
          carregando: false,
          falhasConsecutivas: prev.falhasConsecutivas + 1,
        }))
      }

      if (!controller.signal.aborted) {
        timer = window.setTimeout(executar, intervaloMs)
      }
    }

    executar()

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [intervaloMs, ativo, tentativa])

  const recarregar = useCallback(() => setTentativa((t) => t + 1), [])

  return { ...state, recarregar }
}
