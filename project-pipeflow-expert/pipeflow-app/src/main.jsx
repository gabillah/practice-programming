import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PipeFlowExpert from './pipeflow_expert'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PipeFlowExpert />
  </StrictMode>,
)