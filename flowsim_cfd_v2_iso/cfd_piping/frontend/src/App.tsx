import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import ProjectsPage from '@/pages/ProjectsPage'
import NetworkEditorPage from '@/pages/NetworkEditorPage'
import SimulationsPage from '@/pages/SimulationsPage'
import AnalysisPage from '@/pages/AnalysisPage'
import MoodyChartPage from '@/pages/MoodyChartPage'
import FluidLibraryPage from '@/pages/FluidLibraryPage'
import DiagnosticsPage from '@/pages/DiagnosticsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"       element={<DashboardPage />} />
        <Route path="projects"        element={<ProjectsPage />} />
        <Route path="projects/:projectId/networks/:networkId" element={<NetworkEditorPage />} />
        <Route path="simulations"     element={<SimulationsPage />} />
        <Route path="analysis"        element={<AnalysisPage />} />
        <Route path="moody-chart"     element={<MoodyChartPage />} />
        <Route path="fluids"          element={<FluidLibraryPage />} />
        <Route path="diagnostics"     element={<DiagnosticsPage />} />
        <Route path="*"               element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
