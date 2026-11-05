import type { ReactNode } from 'react'
import { Router } from 'lucide-react'
import type { DadosEstacao, EstadoConexao, StatusEstacao } from '@/types/estacao'
import type { TomStatus } from '@/utils/sensores'
import { Panel } from '@/components/ui/Panel'
import { StatusDot } from '@/components/ui/StatusDot'
import { formatDataHora, isValida, PLACEHOLDER } from '@/utils/format'

interface StatusCardProps {
  conexao: EstadoConexao
  dados: DadosEstacao | null
  status: StatusEstacao | null
  ultimaAtualizacao: Date | null
  erro: Error | null
}

interface EstadoSensor {
  texto: string
  tom: TomStatus
}

const CONEXAO: Record<EstadoConexao, EstadoSensor> = {
  conectando: { texto: 'Conectando', tom: 'warn' },
  online: { texto: 'Conectado', tom: 'ok' },
  offline: { texto: 'Desconectado', tom: 'off' },
}

const SEM_DADO: EstadoSensor = { texto: PLACEHOLDER, tom: 'neutro' }

/** AHT20 e BMP280: o próprio ESP32 informa se encontrou no I2C. */
function estadoI2C(disponivel: boolean | undefined): EstadoSensor {
  if (disponivel === undefined) return SEM_DADO
  return disponivel ? { texto: 'OK', tom: 'ok' } : { texto: 'Falhou', tom: 'off' }
}

/** DHT22: está OK se a leitura veio válida. */
function estadoDHT(dados: DadosEstacao | null): EstadoSensor {
  if (!dados) return SEM_DADO
  return isValida(dados.dht22.temperatura_c)
    ? { texto: 'OK', tom: 'ok' }
    : { texto: 'Falhou', tom: 'off' }
}

/** MQ: valor 0 no ADC indica que o sinal não está chegando no pino. */
function estadoMQ(dados: DadosEstacao | null): EstadoSensor {
  if (!dados) return SEM_DADO
  return dados.nivel_gas > 0 ? { texto: 'OK', tom: 'ok' } : { texto: 'Sem sinal', tom: 'warn' }
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-2 last:border-0">
      <dt className="text-sm text-white/55">{rotulo}</dt>
      <dd className="flex items-center gap-2 text-right text-sm">{children}</dd>
    </div>
  )
}

function LinhaSensor({ rotulo, estado }: { rotulo: string; estado: EstadoSensor }) {
  return (
    <Linha rotulo={rotulo}>
      <StatusDot tom={estado.tom} />
      {estado.texto}
    </Linha>
  )
}

export function StatusCard({ conexao, dados, status, ultimaAtualizacao, erro }: StatusCardProps) {
  const c = CONEXAO[conexao]

  return (
    <Panel titulo="ESP32" icone={Router}>
      <dl className="flex-1">
        <Linha rotulo="Conexão">
          <StatusDot tom={c.tom} pulsar={conexao === 'online'} />
          {c.texto}
        </Linha>
        <Linha rotulo="Última leitura">
          <span className="tabular-nums">{formatDataHora(ultimaAtualizacao)}</span>
        </Linha>
        <Linha rotulo="IP">{status?.ip || PLACEHOLDER}</Linha>
        <LinhaSensor rotulo="DHT22" estado={estadoDHT(dados)} />
        <LinhaSensor rotulo="AHT20" estado={estadoI2C(status?.aht20_disponivel)} />
        <LinhaSensor rotulo="BMP280" estado={estadoI2C(status?.bmp280_disponivel)} />
        <LinhaSensor rotulo="MQ (gás)" estado={estadoMQ(dados)} />
      </dl>

      {erro && conexao !== 'online' && (
        <p className="mt-3 rounded-xl bg-off/10 px-3 py-2 text-xs text-off">{erro.message}</p>
      )}
    </Panel>
  )
}