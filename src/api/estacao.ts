import { httpGet } from './client'
import type { DadosEstacao, StatusEstacao } from '@/types/estacao'

/** Só busca dados reais do ESP32. Se ele estiver desligado, a requisição falha e a tela mostra NaN. */
export const estacaoApi = {
  getDados: (signal?: AbortSignal) => httpGet<DadosEstacao>('/api/dados', signal),
  getStatus: (signal?: AbortSignal) => httpGet<StatusEstacao>('/api/status', signal),
}