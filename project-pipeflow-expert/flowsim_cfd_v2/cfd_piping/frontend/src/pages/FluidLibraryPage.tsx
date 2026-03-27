import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Droplets } from 'lucide-react'
import api from '@/api/client'
import { LoadingOverlay, EmptyState, SectionHeader, Badge } from '@/components/ui'

const PROP_DEFS = [
  { sym: 'ρ',  name: 'Density',                  unit: 'kg/m³' },
  { sym: 'μ',  name: 'Dynamic viscosity',         unit: 'Pa·s' },
  { sym: 'ν',  name: 'Kinematic viscosity ν=μ/ρ', unit: 'm²/s' },
  { sym: 'K',  name: 'Bulk modulus',              unit: 'Pa' },
  { sym: 'Pv', name: 'Vapor pressure',            unit: 'Pa' },
  { sym: 'σ',  name: 'Surface tension',           unit: 'N/m' },
  { sym: 'cp', name: 'Specific heat',             unit: 'J/(kg·K)' },
  { sym: 'k',  name: 'Thermal conductivity',      unit: 'W/(m·K)' },
  { sym: 'Pr', name: 'Prandtl number',            unit: '−' },
  { sym: 'c',  name: 'Speed of sound',            unit: 'm/s' },
]

export default function FluidLibraryPage() {
  const { data: fluids = [], isLoading } = useQuery({
    queryKey: ['fluids'],
    queryFn: () => api.listFluids(),
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Fluid Library"
        subtitle="Pre-defined fluids with thermodynamic and transport properties"
      />
      {isLoading ? (
        <LoadingOverlay />
      ) : fluids.length === 0 ? (
        <EmptyState icon={<Droplets size={24} />} title="No fluids" />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-auto">
            <thead>
              <tr>
                <th>Name</th>
                <th>rho (kg/m3)</th>
                <th>mu (Pa.s)</th>
                <th>nu (m2/s)</th>
                <th>K (Pa)</th>
                <th>Pr</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {fluids.map(f => (
                <tr key={f.id}>
                  <td>
                    <div className="font-medium text-slate-800">{f.name}</div>
                    {f.description && <div className="text-xs text-slate-400">{f.description}</div>}
                  </td>
                  <td className="font-mono">{f.density_kg_m3.toFixed(1)}</td>
                  <td className="font-mono">{f.dynamic_viscosity_pa_s.toExponential(2)}</td>
                  <td className="font-mono">{f.kinematic_viscosity_m2_s.toExponential(2)}</td>
                  <td className="font-mono">{f.bulk_modulus_pa.toExponential(2)}</td>
                  <td className="font-mono">{f.prandtl_number.toFixed(2)}</td>
                  <td>
                    <Badge variant={f.compressible ? 'amber' : 'blue'}>
                      {f.compressible ? 'Gas' : 'Liquid'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="card mt-6 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Property Definitions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {PROP_DEFS.map(p => (
            <div key={p.sym} className="bg-slate-50 rounded-lg p-2.5">
              <div className="font-mono font-bold text-slate-700">{p.sym}</div>
              <div className="text-slate-600">{p.name}</div>
              <div className="text-slate-400 mt-0.5">{p.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
