import { useId, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Leitura } from '@/types/estacao'
import { useElementSize } from '@/hooks/useElementSize'
import { formatHora, formatNumero, isValida, PLACEHOLDER } from '@/utils/format'

export interface PontoGrafico {
  hora: Date
  valor: Leitura
}

interface LineChartProps {
  pontos: PontoGrafico[]
  /** Ex.: "°C", "%", " hPa" */
  unidade: string
  /** Casas decimais do tooltip. */
  casas?: number
  /** Menor faixa do eixo Y (evita que ruído minúsculo pareça uma oscilação enorme). */
  amplitudeMinima?: number
  altura?: number
  /** Texto mostrado enquanto não há pontos suficientes. */
  vazio?: string
}

const MARGEM = { topo: 12, direita: 12, base: 26 }
const LINHAS_GRADE = 4
/** Largura aproximada de um caractere do rótulo (fonte de 11px). */
const LARGURA_CARACTERE = 6.8

/** Gráfico de linha de uma série, com área, grade e tooltip ao passar o mouse. */
export function LineChart({
  pontos,
  unidade,
  casas = 1,
  amplitudeMinima = 0,
  altura = 220,
  vazio = 'Aguardando dados do ESP32…',
}: LineChartProps) {
  const { ref, width } = useElementSize<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const gradId = `area-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  const validos = pontos.map((p) => p.valor).filter(isValida)
  const temDados = validos.length >= 2 && width > 0

  // Escalas
  let min = Math.min(...validos)
  let max = Math.max(...validos)
  const faltando = Math.max(amplitudeMinima - (max - min), 0)
  min -= faltando / 2
  max += faltando / 2
  if (min === max) {
    min -= 1
    max += 1
  }
  const folga = (max - min) * 0.15
  min -= folga
  max += folga

  // Rótulos do eixo Y: casas decimais suficientes para não repetir números
  const passo = (max - min) / (LINHAS_GRADE - 1)
  const casasEixo = passo >= 1 ? 0 : passo >= 0.1 ? 1 : 2
  const grade = Array.from({ length: LINHAS_GRADE }, (_, i) => min + passo * i)
  const rotulos = grade.map((v) => `${formatNumero(v, casasEixo)}${unidade}`)

  // Margem esquerda se ajusta ao tamanho do maior rótulo (não corta "921,5 hPa")
  const esquerda = Math.max(...rotulos.map((r) => r.length)) * LARGURA_CARACTERE + 14
  const formatarTooltip = (v: number) => `${formatNumero(v, casas)}${unidade}`

  const largPlot = Math.max(width - esquerda - MARGEM.direita, 1)
  const altPlot = altura - MARGEM.topo - MARGEM.base
  const x = (i: number) => esquerda + (pontos.length > 1 ? (i / (pontos.length - 1)) * largPlot : 0)
  const y = (v: number) => MARGEM.topo + (1 - (v - min) / (max - min)) * altPlot
  const baseY = MARGEM.topo + altPlot

  // Caminhos (quebram onde o valor é null)
  let linha = ''
  let area = ''
  let inicioSegmento: number | null = null
  pontos.forEach((p, i) => {
    if (!isValida(p.valor)) {
      if (inicioSegmento !== null) area += `L${x(i - 1)},${baseY}L${x(inicioSegmento)},${baseY}Z`
      inicioSegmento = null
      return
    }
    const cmd = inicioSegmento === null ? 'M' : 'L'
    linha += `${cmd}${x(i)},${y(p.valor)}`
    area += `${cmd}${x(i)},${y(p.valor)}`
    if (inicioSegmento === null) inicioSegmento = i
    if (i === pontos.length - 1) area += `L${x(i)},${baseY}L${x(inicioSegmento)},${baseY}Z`
  })

  const aoMoverPonteiro = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const fracao = (e.clientX - rect.left) / rect.width
    setHover(Math.round(fracao * (pontos.length - 1)))
  }

  const pontoHover = hover !== null ? pontos[hover] : null

  return (
    <div ref={ref} className="relative w-full" style={{ height: altura }}>
      {!temDados ? (
        <div className="grid h-full place-items-center rounded-2xl border border-dashed border-white/10 text-center">
          <div>
            <p className="text-3xl font-light text-white/40">{PLACEHOLDER}</p>
            <p className="mt-1 text-sm text-white/50">{vazio}</p>
          </div>
        </div>
      ) : (
        <>
          <svg width={width} height={altura} role="img" aria-label="Gráfico de histórico">
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-chart)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grade + rótulos do eixo Y */}
            {grade.map((v, i) => (
              <g key={i}>
                <line
                  x1={esquerda}
                  x2={width - MARGEM.direita}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="white"
                  strokeOpacity="0.07"
                />
                <text
                  x={esquerda - 8}
                  y={y(v)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-white/45 text-[11px]"
                >
                  {rotulos[i]}
                </text>
              </g>
            ))}

            {/* Rótulos do eixo X (primeiro e último horário) */}
            <text x={esquerda} y={altura - 6} className="fill-white/45 text-[11px]">
              {formatHora(pontos[0].hora)}
            </text>
            <text
              x={width - MARGEM.direita}
              y={altura - 6}
              textAnchor="end"
              className="fill-white/45 text-[11px]"
            >
              {formatHora(pontos[pontos.length - 1].hora)}
            </text>

            <path d={area} fill={`url(#${gradId})`} />
            <path
              d={linha}
              fill="none"
              stroke="var(--color-chart)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Cursor do hover */}
            {pontoHover && hover !== null && (
              <g pointerEvents="none">
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={MARGEM.topo}
                  y2={baseY}
                  stroke="white"
                  strokeOpacity="0.25"
                />
                {isValida(pontoHover.valor) && (
                  <circle
                    cx={x(hover)}
                    cy={y(pontoHover.valor)}
                    r="5"
                    fill="var(--color-chart)"
                    stroke="var(--color-panel)"
                    strokeWidth="2"
                  />
                )}
              </g>
            )}

            {/* Área invisível que captura o mouse */}
            <rect
              x={esquerda}
              y={0}
              width={largPlot}
              height={altura}
              fill="transparent"
              onPointerMove={aoMoverPonteiro}
              onPointerLeave={() => setHover(null)}
            />
          </svg>

          {pontoHover && hover !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 px-3 py-2 text-center text-xs shadow-lg"
              style={{
                left: Math.min(Math.max(x(hover), esquerda + 50), width - 50),
              }}
            >
              <p className="text-base font-medium whitespace-nowrap">
                {isValida(pontoHover.valor) ? formatarTooltip(pontoHover.valor) : PLACEHOLDER}
              </p>
              <p className="text-white/55">{formatHora(pontoHover.hora)}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}