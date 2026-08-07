import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { LoadingOverlay, EmptyState, SectionHeader, StatusBadge } from '@/components/ui'

export default function SimulationsPage() {
  const { data: sims = [], isLoading } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => api.listSimulations(),
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader title="Simulations" subtitle="All simulation runs across all networks" />
      {isLoading ? (
        <LoadingOverlay />
      ) : sims.length === 0 ? (
        <EmptyState
          icon={<span className="text-2xl">play</span>}
          title="No simulations yet"
          description="Open a network and click Run CFD to start"
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-auto">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Solver</th>
                <th>Iterations</th>
                <th>Residual</th>
                <th>Head Loss</th>
                <th>Time</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {sims.map(sim => (
                <tr key={sim.id}>
                  <td className="font-medium">{sim.name}</td>
                  <td><StatusBadge status={sim.status} /></td>
                  <td className="text-xs text-slate-500 capitalize">{sim.solver_type}</td>
                  <td className="font-mono text-xs">{sim.iterations_used ?? '-'}</td>
                  <td className="font-mono text-xs">
                    {sim.max_residual != null ? sim.max_residual.toExponential(1) : '-'}
                  </td>
                  <td className="font-mono text-xs">
                    {sim.total_head_loss_m != null ? `${sim.total_head_loss_m.toFixed(2)} m` : '-'}
                  </td>
                  <td className="font-mono text-xs">
                    {sim.solve_time_s != null ? `${(sim.solve_time_s * 1000).toFixed(0)}ms` : '-'}
                  </td>
                  <td className="text-xs text-slate-400">
                    {new Date(sim.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
