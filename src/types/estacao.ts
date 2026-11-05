export type Luminosidade = 'CLARO' | 'ESCURO'

/** O ESP32 envia null quando a leitura é inválida (NaN no C++). */
export type Leitura = number | null

export interface LeituraTempUmidade {
  temperatura_c: Leitura
  umidade_percentual: Leitura
}

export interface LeituraBMP280 {
  temperatura_c: Leitura
  pressao_pa: Leitura
}

/** GET /api/dados */
export interface DadosEstacao {
  dispositivo: string
  luminosidade: Luminosidade
  nivel_gas: number
  dht22: LeituraTempUmidade
  aht20: LeituraTempUmidade
  bmp280: LeituraBMP280
}

/** GET /api/status */
export interface StatusEstacao {
  wifi_conectado: boolean
  ip: string
  aht20_disponivel: boolean
  bmp280_disponivel: boolean
}

export type EstadoConexao = 'conectando' | 'online' | 'offline'

/** Um ponto do histórico guardado no front. */
export interface PontoHistorico {
  hora: Date
  temperatura: Leitura
  umidade: Leitura
  pressaoHpa: Leitura
}

/** Valores já processados que a tela exibe. */
export interface ResumoLeituras {
  temperatura: Leitura
  umidade: Leitura
  pressaoHpa: Leitura
  luminosidade: Luminosidade | null
  gas: Leitura
}