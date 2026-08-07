import React from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { LoadingOverlay, SectionHeader, Badge, MetricCard, Spinner } from '@/components/ui'

export default function DiagnosticsPage() {
  const { data: results, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['diagnostics-all'],
    queryFn: () => api.runAllDiagnostics(),
    enabled: false,
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SectionHeader
        title="Solver Diagnostics"
        subtitle="Validate the CFD solver against known test cases"
        actions={
          <button
            className="btn-primary btn-md"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <span className="flex items-center gap-2">
                <Spinner size={13} /> Running...
              </span>
            ) : (
              'Run All Tests'
            )}
          </button>
        }
      />

      {!results && !isFetching && (
        <div className="card p-12 text-center text-slate-400">
          <div className="text-3xl mb-3">🔧</div>
          <div>Click "Run All Tests" to validate the solver</div>
        </div>
      )}

      {isFetching && <LoadingOverlay message="Running solver diagnostics..." />}

      {results && (
        <div className="space-y-4">
          <div className={`card p-4 flex items-center gap-3 ${
            results.all_passed ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'
          }`}>
            <span className="text-2xl">{results.all_passed ? 'PASS' : 'FAIL'}</span>
            <div>
              <div className="font-semibold text-sm">
                {results.all_passed ? 'All tests passed' : 'Some tests failed'}
              </div>
              <div className="text-xs text-slate-500">
                {results.results.filter((r: any) => r.passed).length} / {results.results.length} passed
              </div>
            </div>
          </div>

          {results.results.map((r: any) => (
            <div key={r.test_case} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>{r.passed ? 'OK' : 'FAIL'}</span>
                  <span className="font-semibold text-sm capitalize">
                    {r.test_case.replace(/_/g, ' ')}
                  </span>
                </div>
                <Badge variant={r.passed ? 'green' : 'red'}>
                  {r.passed ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Nodes"      value={r.n_nodes} />
                <MetricCard label="Pipes"      value={r.n_pipes} />
                <MetricCard label="Iterations" value={r.iterations} />
                <MetricCard label="Solve Time" value={`${r.solve_time_ms.toFixed(1)}ms`} />
                <MetricCard label="Loops"      value={r.n_loops} />
                <MetricCard
                  label="Converged"
                  value={r.converged ? 'Yes' : 'No'}
                  variant={r.converged ? 'green' : 'red'}
                />
                <MetricCard
                  label="Residual"
                  value={r.max_residual.toExponential(1)}
                  variant={r.max_residual < 1e-5 ? 'green' : 'amber'}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
