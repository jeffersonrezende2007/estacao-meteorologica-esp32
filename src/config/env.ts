export const config = {
  /** Vazio = usa o proxy do Vite. Em produção, coloque a URL do ESP32. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  pollingMs: Number(import.meta.env.VITE_POLLING_MS) || 3000,
  timeoutMs: 4000,
  /** Quantos pontos o gráfico de histórico guarda. */
  maxHistorico: 40,
} as const