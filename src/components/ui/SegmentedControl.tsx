import { cn } from '@/utils/cn'

export interface Opcao<T extends string> {
  valor: T
  rotulo: string
}

interface SegmentedControlProps<T extends string> {
  opcoes: Opcao<T>[]
  valor: T
  onChange: (valor: T) => void
  rotulo: string
}

/** Grupo de botões em que só um fica selecionado (tipo abas). */
export function SegmentedControl<T extends string>({
  opcoes,
  valor,
  onChange,
  rotulo,
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="inline-flex rounded-full bg-white/5 p-1">
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(opcao.valor)}
            className={cn(
              'rounded-full px-3 py-1 text-sm transition',
              ativo ? 'bg-white text-black' : 'text-white/60 hover:text-white',
            )}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
