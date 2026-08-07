import { formatNumber, formatPressure } from '@/components/ui'

interface Props {
  label: string
  unit: string
  min: number
  max: number
  colormap?: string
}

const GRADIENT_STOPS: Record<string, string> = {
  viridis:  'linear-gradient(to right, #440154, #31688e, #35b779, #fde725)',
  plasma:   'linear-gradient(to right, #0d0887, #7e03a8, #cc4778, #f89540, #f0f921)',
  RdYlBu:   'linear-gradient(to right, #d73027, #ffffbf, #4575b4)',
  coolwarm: 'linear-gradient(to right, #3b4cc0, #dddddd, #b40426)',
  jet:      'linear-gradient(to right, #000080, #0000ff, #00ffff, #ffff00, #ff0000)',
  hot:      'linear-gradient(to right, #000000, #ff0000, #ffff00, #ffffff)',
}

function formatVal(v: number, unit: string): string {
  if (unit === 'Pa') return formatPressure(v)
  if (unit === '−') return formatNumber(v, 0)
  return formatNumber(v, 2)
}

export default function ColormapLegend({ label, unit, min, max, colormap = 'viridis' }: Props) {
  const gradient = GRADIENT_STOPS[colormap] ?? GRADIENT_STOPS.viridis
  const mid = (min + max) / 2

  return (
    <div className="canvas-panel right-4 bottom-4 w-48">
      <div className="text-xs font-semibold text-slate-600 mb-2">
        {label} <span className="font-normal text-slate-400">[{unit}]</span>
      </div>
      <div
        className="h-3 rounded-full w-full mb-1.5 border border-slate-200"
        style={{ background: gradient }}
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{formatVal(min, unit)}</span>
        <span>{formatVal(mid, unit)}</span>
        <span>{formatVal(max, unit)}</span>
      </div>
    </div>
  )
}
