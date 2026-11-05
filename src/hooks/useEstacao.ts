import { useCallback, useState } from 'react'
import { estacaoApi } from '@/api/estacao'
import { config } from '@/config/env'
import { usePolling } from './usePolling'
import { resumirLeituras } from '@/utils/sensores'
import type {
  DadosEstacao,
  EstadoConexao,
  PontoHistorico,
  StatusEstacao,
} from '@/types/estacao'

/** Quantas falhas seguidas até considerar o ESP32 offline (evita "piscar" por 1 timeout). */
const FALHAS_PARA_OFFLINE = 2

export interface UseEstacaoResult {
  dados: DadosEstacao | null
  status: StatusEstacao | null
  conexao: EstadoConexao
  historico: PontoHistorico[]
  ultimaAtualizacao: Date | null
  erro: Error | null
  recarregar: () => void
}

export function useEstacao(): UseEstacaoResult {
  const [historico, setHistorico] = useState<PontoHistorico[]>([])

  const guardarNoHistorico = useCallback((data: DadosEstacao, hora: Date) => {
    const resumo = resumirLeituras(data)
    const ponto: PontoHistorico = {
      hora,
      temperatura: resumo.temperatura,
      umidade: resumo.umidade,
      pressaoHpa: resumo.pressaoHpa,
    }
    setHistorico((prev) => [...prev, ponto].slice(-config.maxHistorico))
  }, [])

  const dados = usePolling(estacaoApi.getDados, config.pollingMs, {
    onSucesso: guardarNoHistorico,
  })
  const status = usePolling(estacaoApi.getStatus, config.pollingMs * 5)

  let conexao: EstadoConexao = 'conectando'
  if (dados.falhasConsecutivas >= FALHAS_PARA_OFFLINE) conexao = 'offline'
  else if (dados.data) conexao = 'online'

  const recarregarDados = dados.recarregar
  const recarregarStatus = status.recarregar
  const recarregar = useCallback(() => {
    recarregarDados()
    recarregarStatus()
  }, [recarregarDados, recarregarStatus])

  return {
    dados: conexao === 'online' ? dados.data : null,
    status: conexao === 'online' ? status.data : null,
    conexao,
    historico,
    ultimaAtualizacao: dados.ultimaAtualizacao,
    erro: dados.error,
    recarregar,
  }
}
