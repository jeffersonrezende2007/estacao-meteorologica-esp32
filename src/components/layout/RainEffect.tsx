// Posições fixas das gotas (calculadas uma vez, não mudam a cada render)
const GOTAS = Array.from({ length: 90 }, (_, i) => ({
  left: ((i * 37) % 100) + ((i * 13) % 10) / 10,
  atraso: ((i * 17) % 20) / 20,
  duracao: 0.6 + ((i * 7) % 5) / 10,
  altura: 14 + (i % 4) * 5,
}))

/** Chuva simples feita só com CSS (riscos caindo). */
export function RainEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
      {GOTAS.map((g, i) => (
        <span
          key={i}
          className="absolute -top-10 w-px rotate-[5deg] animate-rain rounded-full bg-linear-to-b from-transparent to-white/70"
          style={{
            left: `${g.left}%`,
            height: g.altura,
            animationDelay: `-${g.atraso}s`,
            animationDuration: `${g.duracao}s`,
          }}
        />
      ))}
    </div>
  )
}