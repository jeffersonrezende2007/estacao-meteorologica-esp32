import type { Leitura } from '@/types/estacao'

/** Texto exibido quando não há dado (ESP32 desligado ou sensor falhou). */
export const PLACEHOLDER = 'NaN'

export function isValida(v: Leitura | undefined): v is number {
  return v != null && Number.isFinite(v)
}

export function formatNumero(v: Leitura | undefined, casas = 1): string {
  if (!isValida(v)) return PLACEHOLDER
  return v.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

/** Média só das leituras válidas (ex.: temperatura do DHT22 + AHT20). */
export function mediaValida(...valores: (Leitura | undefined)[]): Leitura {
  const validos = valores.filter(isValida)
  if (validos.length === 0) return null
  return validos.reduce((a, b) => a + b, 0) / validos.length
}

/** Pascal → hectopascal (unidade usual de pressão atmosférica). */
export function paParaHpa(pa: Leitura | undefined): Leitura {
  return isValida(pa) ? pa / 100 : null
}

export function formatDataHora(data: Date | null): string {
  if (!data) return PLACEHOLDER
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatHora(data: Date): string {
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/** Ex.: "quarta-feira, 4 de novembro" */
export function formatDataExtenso(data: Date): string {
  const texto = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
