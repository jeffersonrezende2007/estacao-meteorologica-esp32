import { useId } from 'react'
import type { Leitura } from '@/types/estacao'
import { formatNumero, isValida } from '@/utils/format'

interface DonutGaugeProps {
  valor: Leitura
  max?: number
  unidade?: string
  tamanho?: number
  espessura?: number
}

/** Anel de progresso (ex.: umidade em %). Mostra "NaN" sem dados. */
export function DonutGauge({
  valor,
  max = 100,
  unidade = '%',
  tamanho = 168,
  espessura = 24,
}: DonutGaugeProps) {
  const patternId = `pontos-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const raio = (tamanho - espessura) / 2
  const circunferencia = 2 * Math.PI * raio
  const fracao = isValida(valor) ? Math.min(Math.max(valor / max, 0), 1) : 0
  const centro = tamanho / 2

  return (
    <div className="relative" style={{ width: tamanho, height: tamanho }}>
      <svg
        width={tamanho}
        height={tamanho}
        viewBox={`0 0 ${tamanho} ${tamanho}`}
        className="-rotate-90"
        role="img"
        aria-label={`${formatNumero(valor, 0)}${unidade}`}
      >
        <defs>
          <pattern id={patternId} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="var(--color-accent-soft)" />
            <circle cx="2" cy="2" r="0.9" fill="var(--color-accent)" opacity="0.55" />
          </pattern>
        </defs>

        {/* Trilho (parte "vazia") */}
        <circle
          cx={centro}
          cy={centro}
          r={raio}
          fill="none"
          stroke={`url(#${patternId})`}
          strokeWidth={espessura}
          opacity={isValida(valor) ? 1 : 0.25}
        />

        {/* Parte preenchida */}
        <circle
          cx={centro}
          cy={centro}
          r={raio}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={espessura}
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - fracao)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

            <span
        className={`absolute inset-0 grid place-items-center font-light ${
          isValida(valor) ? 'text-white' : 'text-white/40'
        }`}
        style={{ fontSize: tamanho * 0.2 }}
      >
        {formatNumero(valor, 0)}
        {isValida(valor) && unidade}
      </span>
    </div>
  )
}
