import { config } from '@/config/env'

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** GET genérico com timeout; lança ApiError com mensagem amigável se falhar. */
export async function httpGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(config.timeoutMs)
  const finalSignal = signal ? AbortSignal.any([signal, timeout]) : timeout

  let res: Response
  try {
    res = await fetch(`${config.apiBaseUrl}${path}`, {
      signal: finalSignal,
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    if (signal?.aborted) throw err
    if (timeout.aborted) throw new ApiError('O ESP32 não respondeu (tempo esgotado)')
    throw new ApiError('Não foi possível conectar ao ESP32')
  }

  if (!res.ok) {
    throw new ApiError(`ESP32 inacessível (HTTP ${res.status})`, res.status)
  }

  return (await res.json()) as T
}
