import type { EstadoConexao } from '@/types/estacao'
import type { TomStatus } from '@/utils/sensores'
import { StatusDot } from '@/components/ui/StatusDot'
import { GlassCard } from '@/components/ui/GlassCard'

const info: Record<EstadoConexao, { rotulo: string; tom: TomStatus }> = {
  conectando: { rotulo: 'Conectando…', tom: 'warn' },
  online: { rotulo: 'ESP32 online', tom: 'ok' },
  offline: { rotulo: 'ESP32 offline', tom: 'off' },
}

export function ConexaoBadge({ conexao }: { conexao: EstadoConexao }) {
  const { rotulo, tom } = info[conexao]
  return (
    <GlassCard className="flex h-11 items-center gap-2 rounded-full px-4 text-sm" role="status">
      <StatusDot tom={tom} pulsar={conexao !== 'offline'} />
      {rotulo}
    </GlassCard>
  )
}
