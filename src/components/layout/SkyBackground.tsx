import { cn } from '@/utils/cn'
import { RainEffect } from './RainEffect'

interface SkyBackgroundProps {
  /** true quando o LDR indica ESCURO. */
  noite: boolean
  /** true quando a umidade indica chuva provável. */
  chuva?: boolean
}

// Posições fixas das estrelas (em %), para não mudarem a cada render
const ESTRELAS = Array.from({ length: 40 }, (_, i) => ({
  top: (i * 37) % 60,
  left: (i * 53) % 100,
  tamanho: i % 3 === 0 ? 2 : 1,
}))

const NUVENS = [
  'top-[12%] left-[5%] h-24 w-[28rem]',
  'top-[30%] left-[45%] h-20 w-[34rem]',
  'top-[5%] left-[60%] h-16 w-[22rem]',
  'top-[45%] left-[10%] h-16 w-[26rem]',
]

/** Fundo de céu: dia/noite pelo sensor de luz e chuva pela umidade. */
export function SkyBackground({ noite, chuva = false }: SkyBackgroundProps) {
  return (
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Dia */}
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-b from-[#2f6fd0] via-[#79a7e0] to-[#cfe0f3] transition-opacity duration-1000',
          noite && 'opacity-0',
        )}
      />
      {/* Noite */}
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-b from-[#060a1f] via-[#121a45] to-[#2a3670] transition-opacity duration-1000',
          !noite && 'opacity-0',
        )}
      />
      {/* Céu nublado de chuva (escurece por cima do dia/noite) */}
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-b from-[#2b3340] via-[#4a5566] to-[#6b7686] transition-opacity duration-1000',
          noite ? 'opacity-70' : 'opacity-85',
          !chuva && 'opacity-0',
        )}
      />

      {/* Sol / Lua (some quando chove) */}
      <div
        className={cn(
          'absolute -top-24 right-[8%] size-[26rem] rounded-full blur-2xl transition-all duration-1000',
          noite
            ? 'bg-[radial-gradient(circle,rgba(220,230,255,0.55)_0%,rgba(220,230,255,0)_45%)]'
            : 'bg-[radial-gradient(circle,rgba(255,250,225,1)_0%,rgba(255,240,190,0.6)_25%,rgba(255,240,190,0)_60%)]',
          chuva && 'opacity-0',
        )}
      />

      {/* Estrelas */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-1000',
          (!noite || chuva) && 'opacity-0',
        )}
      >
        {ESTRELAS.map((e, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/80"
            style={{ top: `${e.top}%`, left: `${e.left}%`, width: e.tamanho, height: e.tamanho }}
          />
        ))}
      </div>

      {/* Nuvens */}
      {NUVENS.map((posicao) => (
        <div
          key={posicao}
          className={cn(
            'absolute animate-drift rounded-full blur-3xl transition-colors duration-1000',
            chuva ? 'bg-slate-400/40' : noite ? 'bg-white/10' : 'bg-white/60',
            posicao,
          )}
        />
      ))}

      {chuva && <RainEffect />}
    </div>
  )
}