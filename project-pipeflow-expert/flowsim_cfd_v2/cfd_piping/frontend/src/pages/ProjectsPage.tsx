/**
 * Projects Page
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Trash2, Network, Play, ChevronRight } from 'lucide-react'
import api from '@/api/client'
import {
  LoadingOverlay, EmptyState, SectionHeader, Badge,
  StatusBadge, Alert,
} from '@/components/ui'

export function ProjectsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showNewProject, setShowNewProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [error, setError] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.listProjects(),
  })

  const { data: fluids = [] } = useQuery({
    queryKey: ['fluids'],
    queryFn: () => api.listFluids(),
  })

  const createProject = useMutation({
    mutationFn: () => api.createProject({ name: projectName }),
    onSuccess: async (proj) => {
      setShowNewProject(false)
      setProjectName('')
      // Create a default network in this project
      if (fluids.length > 0) {
        const net = await api.createNetwork({
          project_id: proj.id,
          fluid_id: fluids[0].id,
          name: 'Network 1',
        })
        qc.invalidateQueries({ queryKey: ['projects'] })
        navigate(`/projects/${proj.id}/networks/${net.id}`)
      } else {
        qc.invalidateQueries({ queryKey: ['projects'] })
      }
    },
    onError: (e: Error) => setError(e.message),
  })

  const deleteProject = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SectionHeader
        title="Projects"
        subtitle="Manage your pipe network projects"
        actions={
          <button className="btn-primary btn-md" onClick={() => setShowNewProject(true)}>
            <Plus size={15} /> New Project
          </button>
        }
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {showNewProject && (
        <div className="card mb-6 p-4 flex items-center gap-3">
          <input
            autoFocus
            className="input flex-1"
            placeholder="Project name…"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && projectName && createProject.mutate()}
          />
          <button
            className="btn-primary btn-md"
            disabled={!projectName || createProject.isPending}
            onClick={() => createProject.mutate()}
          >
            Create
          </button>
          <button className="btn-secondary btn-md" onClick={() => setShowNewProject(false)}>
            Cancel
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingOverlay message="Loading projects…" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={24} />}
          title="No projects yet"
          description="Create a project to start building pipe networks"
          action={
            <button className="btn-primary btn-md" onClick={() => setShowNewProject(true)}>
              <Plus size={15} /> Create Project
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {projects.map(proj => (
            <ProjectCard
              key={proj.id}
              project={proj}
              fluids={fluids}
              onDelete={() => deleteProject.mutate(proj.id)}
              onOpen={(netId) => navigate(`/projects/${proj.id}/networks/${netId}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project, fluids, onDelete, onOpen }: any) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(false)

  const { data: networks = [], isLoading: netsLoading } = useQuery({
    queryKey: ['networks', project.id],
    queryFn: () => api.listNetworks(project.id),
    enabled: expanded,
  })

  const createNetwork = useMutation({
    mutationFn: () => api.createNetwork({
      project_id: project.id,
      fluid_id: fluids[0]?.id,
      name: `Network ${networks.length + 1}`,
    }),
    onSuccess: (net) => {
      qc.invalidateQueries({ queryKey: ['networks', project.id] })
      onOpen(net.id)
    },
  })

  return (
    <div className="card">
      <div
        className="card-header cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-flow-50 flex items-center justify-center">
            <FolderOpen size={15} className="text-flow-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">{project.name}</div>
            <div className="text-xs text-slate-400">
              {new Date(project.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-danger btn-sm p-1.5"
            onClick={e => { e.stopPropagation(); onDelete() }}
          >
            <Trash2 size={12} />
          </button>
          <ChevronRight
            size={16}
            className={`text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4">
          {netsLoading ? (
            <div className="text-xs text-slate-400">Loading networks…</div>
          ) : (
            <div className="space-y-2">
              {networks.map((net: any) => (
                <div
                  key={net.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => onOpen(net.id)}
                >
                  <div className="flex items-center gap-2">
                    <Network size={13} className="text-teal-500" />
                    <span className="text-sm font-medium text-slate-700">{net.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{net.units_system}</span>
                    <ChevronRight size={13} className="text-slate-300" />
                  </div>
                </div>
              ))}
              <button
                className="w-full btn-secondary btn-sm justify-center mt-2"
                onClick={() => createNetwork.mutate()}
                disabled={createNetwork.isPending || !fluids.length}
              >
                <Plus size={12} /> New Network
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
