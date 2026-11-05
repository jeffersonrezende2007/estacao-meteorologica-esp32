import { CloudSun, RefreshCw } from 'lucide-react'
import type { EstadoConexao } from '@/types/estacao'
import { IconButton } from '@/components/ui/IconButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { ConexaoBadge } from './ConexaoBadge'

interface HeaderProps {
  conexao: EstadoConexao
  onRecarregar: () => void
}

export function Header({ conexao, onRecarregar }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <GlassCard className="flex h-11 items-center gap-2 rounded-full px-4">
          <CloudSun className="size-5" aria-hidden />
          <span className="font-medium">Estação Meteorológica</span>
        </GlassCard>
        <IconButton rotulo="Tentar conectar agora" onClick={onRecarregar}>
          <RefreshCw className="size-5" aria-hidden />
        </IconButton>
      </div>

      <ConexaoBadge conexao={conexao} />
    </header>
  )
}