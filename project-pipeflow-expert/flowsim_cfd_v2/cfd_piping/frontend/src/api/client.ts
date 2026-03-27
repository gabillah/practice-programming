/**
 * FlowSim CFD — API Client
 * ========================
 * Typed axios client for all backend REST endpoints.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios'

// ============================================================================
// Types
// ============================================================================

export interface Fluid {
  id: string
  name: string
  slug: string
  description: string | null
  density_kg_m3: number
  dynamic_viscosity_pa_s: number
  kinematic_viscosity_m2_s: number
  bulk_modulus_pa: number
  vapor_pressure_pa: number
  surface_tension_n_m: number
  specific_heat_j_kg_k: number
  thermal_conductivity_w_m_k: number
  prandtl_number: number
  compressible: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  owner: string
  tags: string | null
  created_at: string
  updated_at: string
}

export interface Network {
  id: string
  project_id: string
  fluid_id: string
  name: string
  description: string | null
  temperature_c: number
  reference_pressure_pa: number
  gravity_m_s2: number
  units_system: string
  canvas_width: number
  canvas_height: number
  created_at: string
  updated_at: string
}

export interface Node {
  id: string
  network_id: string
  label: string
  node_type: 'junction' | 'reservoir' | 'tank' | 'pump_inlet' | 'pump_outlet' | 'valve_node'
  x: number
  y: number
  elevation_m: number
  demand_m3s: number
  fixed_head_m: number | null
  fixed_pressure_pa: number | null
  surface_area_m2: number | null
  notes: string | null
  color: string | null
  created_at: string
}

export interface Pipe {
  id: string
  network_id: string
  node_from_id: string
  node_to_id: string
  label: string
  pipe_material: string
  diameter_m: number
  length_m: number
  roughness_m: number
  wall_thickness_m: number
  minor_loss_K: number
  fittings: Record<string, number> | null
  valve_type: string | null
  valve_open: boolean
  valve_setting: number
  has_pump: boolean
  pump_rated_flow_m3s: number
  pump_rated_head_m: number
  pump_efficiency: number
  pump_curve: Record<string, number[]> | null
  waypoints: [number, number][] | null
  color_override: string | null
  line_width: number
  initial_flow_m3s: number
  notes: string | null
  created_at: string
}

export interface Simulation {
  id: string
  network_id: string
  name: string
  status: 'pending' | 'running' | 'converged' | 'failed' | 'cancelled'
  solver_type: string
  max_iterations: number
  convergence_tol: number
  relaxation_factor: number
  converged: boolean | null
  iterations_used: number | null
  max_residual: number | null
  total_head_loss_m: number | null
  total_power_w: number | null
  solve_time_s: number | null
  error_message: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface PipeResult {
  flow_m3s: number
  velocity_m_s: number
  reynolds_number: number
  friction_factor: number
  head_loss_m: number
  pressure_drop_pa: number
  minor_head_loss_m: number
  total_head_loss_m: number
  flow_regime: string
  turbulence_intensity_pct: number
  wall_shear_stress_pa: number
  resistance_R: number
  direction: 'forward' | 'reverse'
}

export interface NodeResult {
  pressure_head_m: number
  elevation_m: number
  hydraulic_grade_m: number
  energy_grade_m: number
  pressure_pa: number
  demand_m3s: number
  inflow_m3s: number
  outflow_m3s: number
  balance_error_m3s: number
}

export interface SimulationResults extends Simulation {
  pipe_results: Record<string, PipeResult> | null
  node_results: Record<string, NodeResult> | null
  convergence_history: number[] | null
  warnings: string[] | null
}

export interface CanvasPipeData {
  id: string
  label: string
  node_from_id: string
  node_to_id: string
  waypoints: [number, number][] | null
  diameter_m: number
  line_width: number
  color: string
  color_value: number | null
  color_field: string | null
  flow_m3s: number | null
  velocity_m_s: number | null
  reynolds_number: number | null
  head_loss_m: number | null
  pressure_drop_pa: number | null
  flow_regime: string | null
  turbulence_intensity_pct: number | null
  direction: string | null
}

export interface CanvasNodeData {
  id: string
  label: string
  node_type: string
  x: number
  y: number
  elevation_m: number
  pressure_head_m: number | null
  pressure_pa: number | null
  hydraulic_grade_m: number | null
  balance_error_m3s: number | null
}

export interface CanvasExport {
  network_id: string
  simulation_id: string | null
  color_field: string
  colormap: string
  nodes: CanvasNodeData[]
  pipes: CanvasPipeData[]
  legend_min: number
  legend_max: number
  legend_unit: string
  legend_label: string
  canvas_width: number
  canvas_height: number
}

export interface SinglePipeAnalysis {
  diameter_m: number
  length_m: number
  flow_rate_m3s: number
  roughness_m: number
  fluid_name: string
  pipe_area_m2: number
  relative_roughness: number
  velocity_m_s: number
  reynolds_number: number
  friction_factor_darcy: number
  friction_factor_fanning: number
  flow_regime: string
  darcy_weisbach_head_loss_m: number
  minor_loss_head_m: number
  total_head_loss_m: number
  friction_pressure_drop_pa: number
  minor_pressure_drop_pa: number
  static_pressure_drop_pa: number
  total_pressure_drop_pa: number
  dynamic_pressure_pa: number
  velocity_head_m: number
  kinetic_energy_coeff_alpha: number
  wall_shear_stress_pa: number
  friction_velocity_m_s: number
  turbulence_intensity_pct: number
  turbulent_kinetic_energy_m2s2: number
  mach_number: number
  euler_number: number
  cavitation_number: number
  centerline_velocity_m_s: number
  velocity_at_half_radius_m_s: number
  velocity_at_wall_m_s: number
  hydraulic_power_w: number
  wave_speed_m_s: number
  joukowski_pressure_surge_pa: number
  critical_closure_time_s: number
}

export interface NetworkTopology {
  network_id: string
  n_nodes: number
  n_pipes: number
  nodes: Array<{
    id: string; label: string; node_type: string
    x: number; y: number; elevation_m: number
    demand_m3s: number; fixed_head_m: number | null
  }>
  pipes: Array<{
    id: string; label: string
    node_from_id: string; node_to_id: string
    diameter_m: number; length_m: number
    roughness_m: number; minor_loss_K: number
    waypoints: [number, number][] | null
  }>
}

export interface MoodyChartData {
  n_reynolds_points: number
  re_range: [number, number]
  laminar_line: Array<{ re: number; f: number }>
  transition_band: { re_start: number; re_end: number }
  roughness_curves: Record<string, {
    eps_d: number
    data: Array<{ re: number; f: number; regime: string }>
  }>
}

export interface DiagnosticsResult {
  test_case: string
  n_nodes: number
  n_pipes: number
  n_loops: number
  converged: boolean
  iterations: number
  max_residual: number
  solve_time_ms: number
  expected_convergence: boolean
  passed: boolean
}

// ============================================================================
// Client
// ============================================================================

class FlowSimClient {
  private http: AxiosInstance

  constructor(baseURL = '/api/v1') {
    this.http = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    })

    // Response interceptor for error normalisation
    this.http.interceptors.response.use(
      (res) => res,
      (err) => {
        const message =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'An unknown error occurred'
        return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
      },
    )
  }

  // --------------------------------------------------------------------------
  // Fluids
  // --------------------------------------------------------------------------
  async listFluids(): Promise<Fluid[]> {
    const { data } = await this.http.get<Fluid[]>('/fluids/')
    return data
  }

  async getFluidBySlug(slug: string): Promise<Fluid> {
    const { data } = await this.http.get<Fluid>(`/fluids/slug/${slug}`)
    return data
  }

  async createFluid(payload: Partial<Fluid>): Promise<Fluid> {
    const { data } = await this.http.post<Fluid>('/fluids/', payload)
    return data
  }

  // --------------------------------------------------------------------------
  // Projects
  // --------------------------------------------------------------------------
  async listProjects(): Promise<Project[]> {
    const { data } = await this.http.get<Project[]>('/projects/')
    return data
  }

  async createProject(payload: { name: string; description?: string }): Promise<Project> {
    const { data } = await this.http.post<Project>('/projects/', payload)
    return data
  }

  async updateProject(id: string, payload: Partial<Project>): Promise<Project> {
    const { data } = await this.http.patch<Project>(`/projects/${id}`, payload)
    return data
  }

  async deleteProject(id: string): Promise<void> {
    await this.http.delete(`/projects/${id}`)
  }

  // --------------------------------------------------------------------------
  // Networks
  // --------------------------------------------------------------------------
  async listNetworks(projectId?: string): Promise<Network[]> {
    const params = projectId ? { project_id: projectId } : {}
    const { data } = await this.http.get<Network[]>('/networks/', { params })
    return data
  }

  async getNetwork(id: string): Promise<Network> {
    const { data } = await this.http.get<Network>(`/networks/${id}`)
    return data
  }

  async createNetwork(payload: Partial<Network>): Promise<Network> {
    const { data } = await this.http.post<Network>('/networks/', payload)
    return data
  }

  async updateNetwork(id: string, payload: Partial<Network>): Promise<Network> {
    const { data } = await this.http.patch<Network>(`/networks/${id}`, payload)
    return data
  }

  async deleteNetwork(id: string): Promise<void> {
    await this.http.delete(`/networks/${id}`)
  }

  async getNetworkTopology(id: string): Promise<NetworkTopology> {
    const { data } = await this.http.get<NetworkTopology>(`/networks/${id}/topology`)
    return data
  }

  // --------------------------------------------------------------------------
  // Nodes
  // --------------------------------------------------------------------------
  async listNodes(networkId: string): Promise<Node[]> {
    const { data } = await this.http.get<Node[]>('/nodes/', { params: { network_id: networkId } })
    return data
  }

  async createNode(payload: Partial<Node>): Promise<Node> {
    const { data } = await this.http.post<Node>('/nodes/', payload)
    return data
  }

  async bulkCreateNodes(payloads: Partial<Node>[]): Promise<Node[]> {
    const { data } = await this.http.post<Node[]>('/nodes/bulk', payloads)
    return data
  }

  async updateNode(id: string, payload: Partial<Node>): Promise<Node> {
    const { data } = await this.http.patch<Node>(`/nodes/${id}`, payload)
    return data
  }

  async deleteNode(id: string): Promise<void> {
    await this.http.delete(`/nodes/${id}`)
  }

  // --------------------------------------------------------------------------
  // Pipes
  // --------------------------------------------------------------------------
  async listPipes(networkId: string): Promise<Pipe[]> {
    const { data } = await this.http.get<Pipe[]>('/pipes/', { params: { network_id: networkId } })
    return data
  }

  async createPipe(payload: Partial<Pipe>): Promise<Pipe> {
    const { data } = await this.http.post<Pipe>('/pipes/', payload)
    return data
  }

  async bulkCreatePipes(payloads: Partial<Pipe>[]): Promise<Pipe[]> {
    const { data } = await this.http.post<Pipe[]>('/pipes/bulk', payloads)
    return data
  }

  async updatePipe(id: string, payload: Partial<Pipe>): Promise<Pipe> {
    const { data } = await this.http.patch<Pipe>(`/pipes/${id}`, payload)
    return data
  }

  async deletePipe(id: string): Promise<void> {
    await this.http.delete(`/pipes/${id}`)
  }

  // --------------------------------------------------------------------------
  // Simulations
  // --------------------------------------------------------------------------
  async listSimulations(networkId?: string): Promise<Simulation[]> {
    const params = networkId ? { network_id: networkId } : {}
    const { data } = await this.http.get<Simulation[]>('/simulations/', { params })
    return data
  }

  async createSimulation(payload: {
    network_id: string
    name?: string
    solver_settings?: {
      max_iterations?: number
      convergence_tol?: number
      relaxation?: number
      use_gradient_method?: boolean
    }
  }): Promise<Simulation> {
    const { data } = await this.http.post<Simulation>('/simulations/', payload)
    return data
  }

  async getSimulation(id: string): Promise<Simulation> {
    const { data } = await this.http.get<Simulation>(`/simulations/${id}`)
    return data
  }

  async getSimulationResults(id: string): Promise<SimulationResults> {
    const { data } = await this.http.get<SimulationResults>(`/simulations/${id}/results`)
    return data
  }

  async reRunSimulation(id: string): Promise<Simulation> {
    const { data } = await this.http.post<Simulation>(`/simulations/${id}/run`)
    return data
  }

  async deleteSimulation(id: string): Promise<void> {
    await this.http.delete(`/simulations/${id}`)
  }

  // --------------------------------------------------------------------------
  // Analysis
  // --------------------------------------------------------------------------
  async analyzePipe(payload: {
    diameter_m: number
    length_m: number
    flow_rate_m3s: number
    roughness_m?: number
    minor_loss_K?: number
    elevation_in_m?: number
    elevation_out_m?: number
    fluid_slug?: string
  }): Promise<SinglePipeAnalysis> {
    const { data } = await this.http.post<SinglePipeAnalysis>('/analysis/pipe', payload)
    return data
  }

  async compareFrictionFactors(re: number, epsd: number) {
    const { data } = await this.http.get('/analysis/friction-factor-comparison', {
      params: { re, eps_d: epsd },
    })
    return data
  }

  async getMoodyChartData(nRePoints = 100, nRoughnessLines = 8): Promise<MoodyChartData> {
    const { data } = await this.http.get<MoodyChartData>('/analysis/moody-chart-data', {
      params: { n_re_points: nRePoints, n_roughness_lines: nRoughnessLines },
    })
    return data
  }

  async getVelocityProfile(pipeId: string, simId: string, nPoints = 50) {
    const { data } = await this.http.get(`/analysis/velocity-profile/${pipeId}`, {
      params: { sim_id: simId, n_points: nPoints },
    })
    return data
  }

  // --------------------------------------------------------------------------
  // Canvas
  // --------------------------------------------------------------------------
  async exportCanvas(payload: {
    network_id: string
    simulation_id?: string | null
    color_field?: string
    colormap?: string
    show_labels?: boolean
    show_arrows?: boolean
  }): Promise<CanvasExport> {
    const { data } = await this.http.post<CanvasExport>('/canvas/export', payload)
    return data
  }

  async listColormaps(): Promise<{ available: string[] }> {
    const { data } = await this.http.get('/canvas/colormaps')
    return data
  }

  async listColorFields(): Promise<{ fields: Array<{ key: string; label: string; unit: string }> }> {
    const { data } = await this.http.get('/canvas/color-fields')
    return data
  }

  // --------------------------------------------------------------------------
  // Diagnostics
  // --------------------------------------------------------------------------
  async runAllDiagnostics(): Promise<{ all_passed: boolean; results: DiagnosticsResult[] }> {
    const { data } = await this.http.get('/diagnostics/solver-test/all')
    return data
  }

  async runDiagnostic(testCase: string): Promise<DiagnosticsResult> {
    const { data } = await this.http.post<DiagnosticsResult>('/diagnostics/solver-test', {
      test_case: testCase,
    })
    return data
  }
}

export const api = new FlowSimClient()
export default api
