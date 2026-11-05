import type { DadosEstacao, Leitura, ResumoLeituras } from '@/types/estacao'
import { isValida, mediaValida, paParaHpa } from './format'

export type TomStatus = 'ok' | 'warn' | 'off' | 'neutro'

export interface NivelGas {
  rotulo: string
  tom: TomStatus
}

/**
 * Classificação do MQ pelo valor bruto do ADC (0–4095).
 * Os limites são aproximados: calibrem com o sensor real.
 */
export const LIMITES_GAS = { moderado: 1500, alto: 2500 } as const

export function classificarGas(adc: Leitura): NivelGas {
  if (!isValida(adc)) return { rotulo: 'Sem leitura', tom: 'neutro' }
  if (adc <= 0) return { rotulo: 'Sem sinal', tom: 'warn' }
  if (adc < LIMITES_GAS.moderado) return { rotulo: 'Ar limpo', tom: 'ok' }
  if (adc < LIMITES_GAS.alto) return { rotulo: 'Moderado', tom: 'warn' }
  return { rotulo: 'Alto', tom: 'off' }
}

/** Converte o JSON do ESP32 nos valores que a tela mostra. */
export function resumirLeituras(dados: DadosEstacao | null): ResumoLeituras {
  return {
    temperatura: mediaValida(dados?.dht22.temperatura_c, dados?.aht20.temperatura_c),
    umidade: mediaValida(dados?.dht22.umidade_percentual, dados?.aht20.umidade_percentual),
    pressaoHpa: paParaHpa(dados?.bmp280.pressao_pa),
    luminosidade: dados?.luminosidade ?? null,
    gas: dados?.nivel_gas ?? null,
  }
}

/** Acima desta umidade (%) o fundo mostra chuva. Ajustem se quiserem. */
export const UMIDADE_CHUVA = 85

export function indicaChuva(umidade: Leitura): boolean {
  return isValida(umidade) && umidade >= UMIDADE_CHUVA
}