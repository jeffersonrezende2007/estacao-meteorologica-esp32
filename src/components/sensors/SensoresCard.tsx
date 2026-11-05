import { Cpu, Thermometer } from 'lucide-react'
import type { DadosEstacao, Leitura, StatusEstacao } from '@/types/estacao'
import { Panel } from '@/components/ui/Panel'
import { formatNumero, isValida } from '@/utils/format'
import { cn } from '@/utils/cn'

interface SensoresCardProps {
  dados: DadosEstacao | null
  status: StatusEstacao | null
}

interface LinhaSensor {
  nome: string
  temperatura: Leitura
  extra: string
  /** null = ainda não sabemos (sem /api/status). */
  disponivel: boolean | null
}

/** Temperatura de cada sensor (para comparar as leituras). */
export function SensoresCard({ dados, status }: SensoresCardProps) {
  const linhas: LinhaSensor[] = [
    {
      nome: 'DHT22',
      temperatura: dados?.dht22.temperatura_c ?? null,
      extra: 'Digital · pino 4',
      disponivel: null,
    },
    {
      nome: 'AHT20',
      temperatura: dados?.aht20.temperatura_c ?? null,
      extra: 'I2C',
      disponivel: status?.aht20_disponivel ?? null,
    },
    {
      nome: 'BMP280',
      temperatura: dados?.bmp280.temperatura_c ?? null,
      extra: 'I2C',
      disponivel: status?.bmp280_disponivel ?? null,
    },
  ]

  return (
    <Panel titulo="Temperaturas" icone={Cpu}>
      <ul className="flex flex-1 flex-col justify-around gap-3">
        {linhas.map((s) => (
          <li key={s.nome} className="flex items-center gap-3">
            <Thermometer className="size-6 shrink-0 text-accent-soft" strokeWidth={1.5} aria-hidden />
            <span
              className={cn(
                'w-20 text-2xl font-light tabular-nums',
                !isValida(s.temperatura) && 'text-white/40',
              )}
            >
              {formatNumero(s.temperatura)}
              {isValida(s.temperatura) && '°'}
            </span>
            <span className="ml-auto text-right">
              <span className="block text-sm">{s.nome}</span>
              <span className="block text-xs whitespace-nowrap text-white/50">
                {s.disponivel === false ? 'indisponível' : s.extra}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}