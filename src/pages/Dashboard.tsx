import { Gauge, Moon, Sun, Thermometer, Droplets, Wind } from 'lucide-react'
import { useEstacao } from '@/hooks/useEstacao'
import { config } from '@/config/env'
import { classificarGas, indicaChuva, resumirLeituras } from '@/utils/sensores'
import { formatDataExtenso, formatNumero, PLACEHOLDER } from '@/utils/format'
import { SkyBackground } from '@/components/layout/SkyBackground'
import { Header } from '@/components/layout/Header'
import { DraggableSheet } from '@/components/layout/DraggableSheet'
import { MetricCard } from '@/components/sensors/MetricCard'
import { SensoresCard } from '@/components/sensors/SensoresCard'
import { UmidadeCard } from '@/components/sensors/UmidadeCard'
import { HistoricoCard } from '@/components/sensors/HistoricoCard'
import { StatusCard } from '@/components/sensors/StatusCard'
import { StatusDot } from '@/components/ui/StatusDot'

export function Dashboard() {
  const { dados, status, conexao, historico, ultimaAtualizacao, erro, recarregar } = useEstacao()

  const resumo = resumirLeituras(dados)
  const noite = resumo.luminosidade === 'ESCURO'
  const gas = classificarGas(resumo.gas)
  const chuva = indicaChuva(resumo.umidade)

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
      {/* Céu ocupa a tela inteira (aparece ao puxar o painel para baixo) */}
      <SkyBackground noite={noite} chuva={chuva} />

      {/* ===== Parte de cima: cards de vidro ===== */}
      <section className="px-4 pt-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Header conexao={conexao} onRecarregar={recarregar} />

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <MetricCard
              icone={Thermometer}
              titulo="Temperatura"
              valor={formatNumero(resumo.temperatura)}
              unidade="°C"
              detalhe="Média DHT22 + AHT20"
            />
            <MetricCard
              icone={Droplets}
              titulo="Umidade"
              valor={formatNumero(resumo.umidade, 0)}
              unidade="%"
              detalhe={chuva ? 'Possível chuva' : 'Média DHT22 + AHT20'}
              corIcone="text-accent-soft"
            />
            <MetricCard
              icone={Gauge}
              titulo="Pressão"
              valor={formatNumero(resumo.pressaoHpa, 1)}
              unidade="hPa"
              detalhe="BMP280"
            />
            <MetricCard
              icone={noite ? Moon : Sun}
              titulo="Luminosidade"
              valor={resumo.luminosidade ? (noite ? 'Escuro' : 'Claro') : PLACEHOLDER}
              detalhe="Sensor LDR"
              corIcone={noite ? 'text-accent-soft' : 'text-yellow-300'}
            />
            <MetricCard
              icone={Wind}
              titulo="Qualidade do ar"
              valor={formatNumero(resumo.gas, 0)}
              detalhe={
                <span className="inline-flex items-center gap-1.5">
                  <StatusDot tom={gas.tom} />
                  {gas.rotulo} · MQ (ADC)
                </span>
              }
            />
          </div>
        </div>
      </section>

      {/* ===== Parte de baixo: painel escuro arrastável ===== */}
      <DraggableSheet className="-mt-8 flex-1 px-4 pb-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-medium">
              Leituras em tempo real — {formatDataExtenso(new Date())}
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Dados enviados pelo ESP32 a cada {config.pollingMs / 1000} segundos.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr_1.2fr]">
            <SensoresCard dados={dados} status={status} />
            <UmidadeCard dados={dados} />
            <div className="md:col-span-2 xl:col-span-1">
              <HistoricoCard historico={historico} />
            </div>
            <StatusCard
              conexao={conexao}
              dados={dados}
              status={status}
              ultimaAtualizacao={ultimaAtualizacao}
              erro={erro}
            />
          </div>
        </div>
      </DraggableSheet>
    </div>
  )
}