import { Droplets } from 'lucide-react'
import type { DadosEstacao, Leitura } from '@/types/estacao'
import { Panel } from '@/components/ui/Panel'
import { DonutGauge } from '@/components/ui/DonutGauge'
import { isValida } from '@/utils/format'

function Medidor({ nome, valor }: { nome: string; valor: Leitura }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <DonutGauge valor={valor} tamanho={92} espessura={12} />
      <span className="text-sm">{nome}</span>
    </div>
  )
}

/** Compara a umidade relativa do ar medida por cada sensor (DHT22 x AHT20). */
export function UmidadeCard({ dados }: { dados: DadosEstacao | null }) {
  const dht = dados?.dht22.umidade_percentual ?? null
  const aht = dados?.aht20.umidade_percentual ?? null

  const temOsDois = isValida(dht) && isValida(aht)
  const diferenca = temOsDois ? Math.round(Math.abs(dht - aht)) : null
  const maior = temOsDois && aht > dht ? 'AHT20' : 'DHT22'
  const menor = maior === 'AHT20' ? 'DHT22' : 'AHT20'

  return (
    <Panel titulo="Umidade do ar" icone={Droplets}>
      <div className="flex flex-1 flex-col justify-center gap-5">
        <div className="flex justify-around gap-3">
          <Medidor nome="DHT22" valor={dht} />
          <Medidor nome="AHT20" valor={aht} />
        </div>
        <p className="text-center text-xs text-white/50">
          {diferenca === null ? (
            'Aguardando leitura dos dois sensores'
          ) : diferenca === 0 ? (
            'Os dois sensores estão marcando o mesmo valor'
          ) : (
            <>
              O <span className="text-white">{maior}</span> está marcando{' '}
              <span className="text-white">{diferenca}%</span> a mais que o {menor}
            </>
          )}
        </p>
      </div>
    </Panel>
  )
}