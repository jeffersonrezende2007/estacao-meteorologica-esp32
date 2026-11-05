import { useState } from 'react'
import { ChartLine } from 'lucide-react'
import type { PontoHistorico } from '@/types/estacao'
import { Panel } from '@/components/ui/Panel'
import { LineChart } from '@/components/ui/LineChart'
import { SegmentedControl, type Opcao } from '@/components/ui/SegmentedControl'

type Metrica = 'temperatura' | 'umidade' | 'pressaoHpa'

const OPCOES: Opcao<Metrica>[] = [
  { valor: 'temperatura', rotulo: 'Temperatura' },
  { valor: 'umidade', rotulo: 'Umidade' },
  { valor: 'pressaoHpa', rotulo: 'Pressão' },
]

/** Unidade, casas decimais e menor faixa do eixo Y de cada métrica. */
const CONFIG: Record<Metrica, { unidade: string; casas: number; amplitudeMinima: number }> = {
  temperatura: { unidade: '°C', casas: 1, amplitudeMinima: 1 },
  umidade: { unidade: '%', casas: 0, amplitudeMinima: 4 },
  pressaoHpa: { unidade: ' hPa', casas: 1, amplitudeMinima: 1 },
}

export function HistoricoCard({ historico }: { historico: PontoHistorico[] }) {
  const [metrica, setMetrica] = useState<Metrica>('temperatura')

  const pontos = historico.map((p) => ({ hora: p.hora, valor: p[metrica] }))

  return (
    <Panel
      titulo="Histórico"
      icone={ChartLine}
      acao={
        <SegmentedControl
          rotulo="Métrica do gráfico"
          opcoes={OPCOES}
          valor={metrica}
          onChange={setMetrica}
        />
      }
    >
      <LineChart pontos={pontos} {...CONFIG[metrica]} />
    </Panel>
  )
}