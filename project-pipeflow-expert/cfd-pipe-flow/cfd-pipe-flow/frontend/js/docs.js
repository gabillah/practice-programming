/**
 * docs.js — Documentation Content & Renderer
 * CFD Pipe-Flow Expert  ·  Frontend Module
 *
 * Renders the in-app reference manual covering:
 *   • CFD theory (Navier-Stokes, turbulence, pipe flow)
 *   • API reference (all endpoints)
 *   • User guide (how to build / solve a network)
 *   • Mathematical appendix
 */

"use strict";

/* =========================================================================
   Documentation articles (Markdown-lite, rendered to HTML)
   ========================================================================= */

const DOCS = [
  // =========================================================================
  {
    id: "intro",
    title: "Introduction to CFD Pipe Flow Expert",
    category: "Getting Started",
    content: `
<h2>Introduction</h2>
<p>
  <strong>CFD Pipe Flow Expert</strong> is a web-based simulation tool for
  analysing steady-state and transient flow in piping networks. It solves the
  governing equations using two complementary iterative methods:
</p>
<ul>
  <li><strong>Hardy-Cross</strong> — classic loop-correction method (1936), fast for simple networks.</li>
  <li><strong>Newton-Raphson / Todini-Pilati</strong> — gradient method, quadratic convergence, handles large networks.</li>
</ul>
<p>After convergence the application colour-maps each pipe by velocity, pressure
drop, temperature or Reynolds number so flow patterns are immediately visible.</p>

<h3>What can this tool analyse?</h3>
<ul>
  <li>Incompressible, single-phase, isothermal or thermal pipe networks</li>
  <li>Laminar (Re &lt; 2 300) and turbulent (Re ≥ 4 000) flows</li>
  <li>Pump curves, control valves, check valves</li>
  <li>Minor losses from fittings (K-factor method)</li>
  <li>Heat transfer in pipes (Gnielinski, Dittus-Boelter, Sieder-Tate)</li>
  <li>Water-hammer / surge analysis via Method of Characteristics</li>
  <li>Two-phase flow pressure drop (Lockhart-Martinelli)</li>
  <li>Compressible gas flow (Fanno line, choked conditions)</li>
</ul>

<h3>Workflow Overview</h3>
<ol>
  <li><strong>Build</strong> — draw nodes and pipes on the canvas editor.</li>
  <li><strong>Configure</strong> — set boundary conditions (fixed heads, demands).</li>
  <li><strong>Solve</strong> — choose solver type and click ▶ Solve.</li>
  <li><strong>Inspect</strong> — explore results on the colour-mapped canvas or in the results tables.</li>
  <li><strong>Export</strong> — download CSV or JSON for further analysis.</li>
</ol>
    `
  },
  // =========================================================================
  {
    id: "theory-navier-stokes",
    title: "Governing Equations — Navier-Stokes",
    category: "CFD Theory",
    content: `
<h2>Governing Equations</h2>
<p>
  Fluid flow is governed by the <strong>Navier-Stokes equations</strong>,
  which express conservation of mass, momentum, and energy.
</p>

<h3>Continuity (Mass Conservation)</h3>
<pre class="math">∂ρ/∂t + ∇·(ρ<b>u</b>) = 0</pre>
<p>For incompressible flow (ρ = const):</p>
<pre class="math">∇·<b>u</b> = 0</pre>

<h3>Momentum Conservation</h3>
<pre class="math">ρ(∂<b>u</b>/∂t + <b>u</b>·∇<b>u</b>) = −∇p + μ∇²<b>u</b> + ρ<b>g</b></pre>
<ul>
  <li><em>ρ</em> — fluid density (kg/m³)</li>
  <li><em><b>u</b></em> — velocity vector (m/s)</li>
  <li><em>p</em> — pressure (Pa)</li>
  <li><em>μ</em> — dynamic viscosity (Pa·s)</li>
  <li><em><b>g</b></em> — gravitational acceleration (m/s²)</li>
</ul>

<h3>Energy Equation</h3>
<pre class="math">ρc_p(∂T/∂t + <b>u</b>·∇T) = k∇²T + Φ</pre>
<p>Φ is the viscous dissipation function (significant only at high shear rates).</p>

<h3>Pipe-Flow Simplification</h3>
<p>
  For fully-developed, steady, axisymmetric pipe flow the momentum equation
  reduces to the <strong>Hagen-Poiseuille</strong> equation (laminar) and
  the <strong>Darcy-Weisbach</strong> relation (general):
</p>
<pre class="math">Δp = f · (L/D) · (ρu²/2)</pre>
<p>where <em>f</em> is the Darcy-Weisbach friction factor.</p>
    `
  },
  // =========================================================================
  {
    id: "theory-friction",
    title: "Friction Factor Correlations",
    category: "CFD Theory",
    content: `
<h2>Friction Factor Correlations</h2>

<h3>Laminar Flow (Re &lt; 2 300)</h3>
<pre class="math">f = 64 / Re</pre>
<p>This is the exact Hagen-Poiseuille result.</p>

<h3>Colebrook-White (turbulent)</h3>
<p>
  The standard implicit equation for turbulent flow in rough pipes:
</p>
<pre class="math">1/√f = −2 log₁₀( ε/(3.7D) + 2.51/(Re√f) )</pre>
<p>
  Solved iteratively (Picard iteration, typically converges in &lt; 15 steps).
  Accurate within ±1% for 4 000 &lt; Re &lt; 10⁸ and 0 ≤ ε/D ≤ 0.05.
</p>

<h3>Swamee-Jain (explicit approximation)</h3>
<pre class="math">f = 0.25 / [ log₁₀( ε/(3.7D) + 5.74/Re⁰·⁹ ) ]²</pre>
<p>Accuracy ±3% versus Colebrook-White. Useful as initial guess.</p>

<h3>Churchill (1977) — unified formula</h3>
<pre class="math">f = 8[ (8/Re)¹² + 1/(A+B)^1.5 ]^(1/12)</pre>
<pre class="math">A = {-2.457 ln[(7/Re)⁰·⁹ + 0.27ε/D]}¹⁶,  B = (37530/Re)¹⁶</pre>
<p>Valid for all Re including laminar-turbulent transition. Used when solver needs continuous derivatives.</p>

<h3>Moody Chart</h3>
<p>
  The interactive Moody Chart panel plots iso-roughness curves of <em>f</em> vs <em>Re</em>.
  Click any point to read off (Re, f, ε/D). Zoom with scroll wheel; pan by drag.
  Solved network results are overlaid automatically.
</p>
    `
  },
  // =========================================================================
  {
    id: "theory-network",
    title: "Network Hydraulics — Hardy-Cross & Newton-Raphson",
    category: "CFD Theory",
    content: `
<h2>Network Hydraulics</h2>
<p>
  A pipe network consists of <em>N</em> nodes and <em>P</em> pipes.
  The unknowns are the pipe flow rates <em>Q</em> and node heads <em>H</em>.
</p>

<h3>Governing Laws</h3>
<ol>
  <li><strong>Kirchhoff's First Law (Node continuity)</strong>: The algebraic sum of flows at every junction equals zero.
    <pre class="math">∑ Qᵢ = 0   (for each junction node)</pre>
  </li>
  <li><strong>Kirchhoff's Second Law (Loop energy)</strong>: The head loss around any closed loop sums to zero.
    <pre class="math">∑ hf = 0   (for each independent loop)</pre>
  </li>
</ol>

<h3>Hardy-Cross Method</h3>
<p>
  Works by iterating on loop flow corrections ΔQ until loop head-loss residuals vanish:
</p>
<pre class="math">ΔQ_k = −∑ r·|Q|ⁿ·sgn(Q) / ∑ n·r·|Q|^(n−1)</pre>
<p>
  where <em>r = f·L/(D·2gA²)</em> and <em>n = 2</em> for Darcy-Weisbach.
  Convergence is linear; typically 20-100 iterations for large networks.
</p>

<h3>Newton-Raphson / Todini-Pilati Gradient Method</h3>
<p>
  Formulates the problem as a system of nonlinear equations <strong>F(x) = 0</strong>
  and applies the Newton update:
</p>
<pre class="math">x^(k+1) = x^k − J⁻¹ F(x^k)</pre>
<p>
  <strong>J</strong> is the Jacobian matrix. The Todini-Pilati formulation
  reduces the system to N×N (node heads) by eliminating pipe flows analytically.
  Quadratic convergence near the solution; 5-15 iterations typical.
</p>

<h3>Network Topology</h3>
<p>
  The code uses BFS to detect connected components and a spanning-tree / co-tree
  decomposition to identify independent loops (fundamental cycle basis).
  The incidence matrix <strong>A</strong> (N×P) links nodes to pipes.
</p>
    `
  },
  // =========================================================================
  {
    id: "theory-turbulence",
    title: "Turbulence Modelling — k-ε",
    category: "CFD Theory",
    content: `
<h2>Turbulence Modelling</h2>
<p>
  Turbulent pipe flow is characterised by chaotic, three-dimensional velocity
  fluctuations. The <strong>Reynolds-Averaged Navier-Stokes (RANS)</strong>
  approach decomposes each flow variable into a mean and fluctuating component:
</p>
<pre class="math"><b>u</b> = Ū + u'</pre>

<h3>Standard k-ε Model (Launder &amp; Spalding 1974)</h3>
<p>Two transport equations are solved for turbulence kinetic energy <em>k</em>
and dissipation rate <em>ε</em>:</p>
<pre class="math">∂(ρk)/∂t + ∇·(ρ<b>u</b>k) = ∇·[(μ + μ_t/σ_k)∇k] + G_k − ρε</pre>
<pre class="math">∂(ρε)/∂t + ∇·(ρ<b>u</b>ε) = ∇·[(μ + μ_t/σ_ε)∇ε] + C₁_ε(ε/k)G_k − C₂_ε ρε²/k</pre>
<p>Turbulent viscosity:</p>
<pre class="math">μ_t = ρ C_μ k² / ε</pre>

<h4>Model constants (standard):</h4>
<table class="doc-table">
  <tr><th>C_μ</th><th>C₁_ε</th><th>C₂_ε</th><th>σ_k</th><th>σ_ε</th></tr>
  <tr><td>0.09</td><td>1.44</td><td>1.92</td><td>1.0</td><td>1.3</td></tr>
</table>

<h3>Wall Functions</h3>
<p>Near solid walls, log-law wall functions bridge the viscous sub-layer:</p>
<pre class="math">u⁺ = (1/κ) ln(y⁺) + B    (y⁺ &gt; 30)</pre>
<p>κ = 0.41 (von Kármán constant), B ≈ 5.5 for smooth walls.</p>

<h3>Turbulent Pipe-Flow Profiles</h3>
<p>The empirical power-law velocity profile:</p>
<pre class="math">u(r)/u_max = (1 − r/R)^(1/n)</pre>
<p>with <em>n ≈ 7</em> for Re ≈ 10⁵. The profile exponent <em>n</em> increases with Re.</p>
    `
  },
  // =========================================================================
  {
    id: "theory-heat",
    title: "Heat Transfer in Pipes",
    category: "CFD Theory",
    content: `
<h2>Convective Heat Transfer in Pipes</h2>

<h3>Nusselt Number Correlations</h3>
<table class="doc-table">
  <thead><tr><th>Correlation</th><th>Formula</th><th>Validity</th></tr></thead>
  <tbody>
    <tr>
      <td>Dittus-Boelter</td>
      <td>Nu = 0.023 Re⁰·⁸ Prⁿ (n=0.4 heating, 0.3 cooling)</td>
      <td>Re &gt; 10 000, 0.6 &lt; Pr &lt; 160</td>
    </tr>
    <tr>
      <td>Gnielinski</td>
      <td>Nu = (f/8)(Re−1000)Pr / [1 + 12.7√(f/8)(Pr^(2/3)−1)]</td>
      <td>3 000 &lt; Re &lt; 5×10⁶, 0.5 &lt; Pr &lt; 2 000</td>
    </tr>
    <tr>
      <td>Sieder-Tate</td>
      <td>Nu = 0.027 Re⁰·⁸ Pr^(1/3) (μ/μ_w)^0.14</td>
      <td>Re &gt; 10 000, 0.7 &lt; Pr &lt; 16 700</td>
    </tr>
    <tr>
      <td>Laminar (const. flux)</td>
      <td>Nu = 3.66 + 0.0668·Gz / (1 + 0.04·Gz^(2/3))</td>
      <td>Re &lt; 2 300, Gz = Re·Pr·D/L</td>
    </tr>
  </tbody>
</table>

<h3>Heat Transfer Coefficient</h3>
<pre class="math">h = Nu · k / D</pre>

<h3>Log-Mean Temperature Difference (LMTD)</h3>
<pre class="math">ΔT_lm = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)</pre>

<h3>Outlet Temperature (constant wall temperature T_w)</h3>
<pre class="math">T_out = T_w − (T_w − T_in) · exp(−h·P·L / (ṁ·c_p))</pre>
<p>where P = πD is the pipe perimeter and ṁ is the mass flow rate.</p>

<h3>NTU Method</h3>
<pre class="math">NTU = h·A / (ṁ·c_p)</pre>
<pre class="math">ε = 1 − exp(−NTU)   (for constant T_w)</pre>
    `
  },
  // =========================================================================
  {
    id: "theory-waterhammer",
    title: "Water Hammer — Method of Characteristics",
    category: "CFD Theory",
    content: `
<h2>Water Hammer and Transient Analysis</h2>
<p>
  When flow is rapidly decelerated (e.g., valve closure), elastic pressure
  waves propagate through the pipeline at the acoustic wave speed <em>a</em>.
</p>

<h3>Wave Speed</h3>
<pre class="math">a = √( K/ρ · 1/(1 + KD/(Et)) )</pre>
<ul>
  <li><em>K</em> — bulk modulus of fluid (≈ 2.15 GPa for water)</li>
  <li><em>E</em> — Young's modulus of pipe material</li>
  <li><em>t</em> — pipe wall thickness</li>
</ul>

<h3>Joukowsky Equation</h3>
<pre class="math">ΔP = ρ · a · ΔV</pre>
<p>
  Maximum instantaneous pressure rise for sudden valve closure.
  For instantaneous closure (t_c ≤ 2L/a), the full Joukowsky rise applies.
  For slow closure (t_c &gt; 2L/a), the effective rise is:
</p>
<pre class="math">ΔP_eff = ΔP · (2L/a) / t_c</pre>

<h3>Method of Characteristics (MOC)</h3>
<p>
  The governing hyperbolic PDE is transformed into characteristic equations:
</p>
<pre class="math">C⁺:  dH/dt + a/gA · dQ/dt + a²/(gA²) · f·Q|Q|/(2D) = 0</pre>
<pre class="math">C⁻:  dH/dt − a/gA · dQ/dt + a²/(gA²) · f·Q|Q|/(2D) = 0</pre>
<p>
  These are solved on a space-time grid with Courant condition:
</p>
<pre class="math">Cr = a · Δt / Δx ≤ 1</pre>
<p>
  The transient simulator steps through time, applying boundary conditions
  (valve opening/closure functions, reservoir heads, pump trip) at each timestep.
</p>
    `
  },
  // =========================================================================
  {
    id: "api-reference",
    title: "REST API Reference",
    category: "API",
    content: `
<h2>REST API Reference</h2>
<p>Base URL: <code>http://localhost:8000/api/v1</code></p>

<h3>Health</h3>
<table class="doc-table api-table">
  <thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>GET</td><td>/health</td><td>Quick health ping</td></tr>
    <tr><td>GET</td><td>/health/detailed</td><td>DB status, uptime, version</td></tr>
  </tbody>
</table>

<h3>Networks (CRUD)</h3>
<table class="doc-table api-table">
  <tr><td>GET</td><td>/networks</td><td>List all networks</td></tr>
  <tr><td>POST</td><td>/networks</td><td>Create network</td></tr>
  <tr><td>GET</td><td>/networks/{id}</td><td>Get network with nodes + pipes</td></tr>
  <tr><td>PUT</td><td>/networks/{id}</td><td>Update network metadata</td></tr>
  <tr><td>DELETE</td><td>/networks/{id}</td><td>Delete network and results</td></tr>
  <tr><td>POST</td><td>/networks/{id}/duplicate</td><td>Deep copy a network</td></tr>
  <tr><td>GET</td><td>/networks/{id}/topology</td><td>Loops, nodes, components</td></tr>
</table>

<h3>Solvers</h3>
<table class="doc-table api-table">
  <tr><td>POST</td><td>/solvers/solve/{id}</td><td>Solve a saved network by ID</td></tr>
  <tr><td>POST</td><td>/solvers/solve/inline</td><td>Solve an unsaved network (body contains full network)</td></tr>
  <tr><td>GET</td><td>/solvers/moody-chart</td><td>Return Colebrook-White data for plotting</td></tr>
  <tr><td>GET</td><td>/solvers/pipe-flow-calculators/darcy-weisbach</td><td>Quick DW calculation via query params</td></tr>
</table>

<h3>Results</h3>
<table class="doc-table api-table">
  <tr><td>GET</td><td>/results/{network_id}</td><td>Latest solve result</td></tr>
  <tr><td>GET</td><td>/results/{network_id}/visualise</td><td>Coloured GeoJSON for map rendering</td></tr>
  <tr><td>GET</td><td>/results/{network_id}/list</td><td>All historical results for this network</td></tr>
</table>

<h3>Export</h3>
<table class="doc-table api-table">
  <tr><td>GET</td><td>/export/{network_id}/csv</td><td>CSV of pipe + node results</td></tr>
  <tr><td>GET</td><td>/export/{network_id}/json</td><td>Full JSON result file</td></tr>
</table>

<h3>Materials</h3>
<table class="doc-table api-table">
  <tr><td>GET</td><td>/materials/fluids</td><td>All fluid property entries</td></tr>
  <tr><td>GET</td><td>/materials/pipe-roughness</td><td>Roughness values by material</td></tr>
  <tr><td>GET</td><td>/materials/fittings-k</td><td>Minor-loss K-factor table</td></tr>
</table>

<h3>Templates</h3>
<table class="doc-table api-table">
  <tr><td>GET</td><td>/templates</td><td>List network templates</td></tr>
  <tr><td>GET</td><td>/templates/{id}</td><td>Get template details</td></tr>
  <tr><td>POST</td><td>/templates/{id}/apply</td><td>Instantiate template as a new network</td></tr>
</table>

<h3>Validation</h3>
<table class="doc-table api-table">
  <tr><td>POST</td><td>/validation/validate/network</td><td>Validate network topology and BCs</td></tr>
</table>
    `
  },
  // =========================================================================
  {
    id: "user-guide-build",
    title: "User Guide — Building a Network",
    category: "User Guide",
    content: `
<h2>Building a Pipe Network</h2>

<h3>Step 1 — Add Nodes</h3>
<ol>
  <li>Select the <strong>Add Node</strong> tool (N key or toolbar).</li>
  <li>Click anywhere on the canvas to place a junction node.</li>
  <li>Double-click an existing node to open the <em>Node Inspector</em>:
    <ul>
      <li><strong>Type</strong>: Junction, Reservoir, Tank, Demand node</li>
      <li><strong>Elevation (m)</strong>: used for HGL calculation</li>
      <li><strong>Fixed Head</strong>: check to set as a boundary condition (reservoir)</li>
      <li><strong>Demand (m³/s)</strong>: for demand nodes (negative = source)</li>
    </ul>
  </li>
</ol>

<h3>Step 2 — Add Pipes</h3>
<ol>
  <li>Select the <strong>Add Pipe</strong> tool (P key).</li>
  <li>Click a start node, then click an end node to draw a pipe.</li>
  <li>Double-click a pipe to open the <em>Pipe Inspector</em>:
    <ul>
      <li><strong>Diameter (m)</strong></li>
      <li><strong>Length (m)</strong> — auto-calculated from canvas or enter manually</li>
      <li><strong>Material / Roughness (m)</strong></li>
      <li><strong>Valve</strong>: enable and set Cv or open percentage</li>
      <li><strong>Pump</strong>: enable and set pump head (m) and efficiency</li>
      <li><strong>Minor Loss K</strong>: sum of all fitting K values</li>
    </ul>
  </li>
</ol>

<h3>Step 3 — Set Boundary Conditions</h3>
<p>
  Every solvable network must have at least one <strong>fixed head</strong> node
  (reservoir or tank) to anchor the pressure grade line.
  Demand nodes must have non-zero demands that satisfy ∑Q = 0 overall.
</p>

<h3>Step 4 — Validate</h3>
<p>
  Use the <em>Validate</em> button before solving. The validator checks:
</p>
<ul>
  <li>At least one fixed-head node exists</li>
  <li>No isolated nodes or disconnected components</li>
  <li>No duplicate node IDs</li>
  <li>All pipe diameters and lengths are positive</li>
  <li>Nodal demands are globally balanced (∑Q_demand ≈ ∑Q_supply)</li>
</ul>

<h3>Step 5 — Solve</h3>
<p>
  Choose solver settings in the left sidebar:
</p>
<ul>
  <li><strong>Solver</strong>: Hardy-Cross or Newton-Raphson (recommended)</li>
  <li><strong>Max Iterations</strong>: 200 typical</li>
  <li><strong>Tolerance</strong>: 1×10⁻⁶ (flow residual, m³/s)</li>
  <li><strong>Fluid</strong>: select from the fluid database</li>
  <li><strong>Temperature</strong>: for thermal analysis</li>
</ul>
<p>Click <strong>▶ Solve</strong>. Watch the convergence log and residual plot.</p>
    `
  },
  // =========================================================================
  {
    id: "user-guide-results",
    title: "User Guide — Reading Results",
    category: "User Guide",
    content: `
<h2>Interpreting Results</h2>

<h3>Canvas Colour Map</h3>
<p>
  Pipes are coloured by the selected variable:
</p>
<table class="doc-table">
  <thead><tr><th>Mode</th><th>Variable</th><th>Units</th></tr></thead>
  <tbody>
    <tr><td>Velocity</td><td>Mean pipe velocity</td><td>m/s</td></tr>
    <tr><td>Pressure Drop</td><td>Δp per pipe</td><td>Pa</td></tr>
    <tr><td>Temperature</td><td>Outlet temperature</td><td>°C</td></tr>
    <tr><td>Reynolds No.</td><td>Reynolds number Re</td><td>—</td></tr>
    <tr><td>Head Loss</td><td>Darcy head loss h_L</td><td>m</td></tr>
    <tr><td>Flow Rate</td><td>Volumetric flow rate Q</td><td>m³/s</td></tr>
  </tbody>
</table>
<p>Change the colormap with the <em>Colormap</em> selector (viridis, jet, plasma…).</p>

<h3>Pipe Results Table</h3>
<p>Columns: Flow Rate (L/s), Velocity (m/s), Head Loss (m), Pressure Drop (Pa), Re, Regime, f, T_out (°C).</p>
<p>Click a row to highlight that pipe on the canvas. Click 🔍 to open the full pipe inspector.</p>

<h3>Node Results Table</h3>
<p>Columns: Type, Pressure (kPa), Head (m), Elevation (m), Demand (L/s), HGL (m).</p>

<h3>HGL Overlay</h3>
<p>
  Toggle the <strong>HGL</strong> overlay to draw the Hydraulic Grade Line across the canvas.
  The HGL slope at each pipe segment equals h_L / L.
</p>

<h3>Convergence Plot</h3>
<p>
  The mini plot shows the residual (flow continuity error) vs iteration number on a log₁₀ scale.
  A well-converged solution shows the residual dropping 6+ orders of magnitude.
</p>

<h3>Advanced Statistics Panel</h3>
<p>Shows: velocity and Reynolds number statistics, friction factor distribution,
energy budget (pump power, friction losses, efficiency), and velocity histogram.</p>
    `
  },
  // =========================================================================
  {
    id: "math-appendix",
    title: "Mathematical Appendix",
    category: "Reference",
    content: `
<h2>Mathematical Appendix</h2>

<h3>A.1 — Darcy-Weisbach Complete Formulation</h3>
<pre class="math">h_L = f · (L/D) · V²/(2g)
Δp  = f · (L/D) · ρV²/2
Q   = V · A = V · π D²/4</pre>

<h3>A.2 — Hydraulic Grade Line (HGL) and Energy Grade Line (EGL)</h3>
<pre class="math">HGL = z + p/(ρg)          [piezometric head, m]
EGL = HGL + V²/(2g)       [total head, m]</pre>

<h3>A.3 — Buckingham Π Theorem Applied to Pipe Flow</h3>
<p>Variables: Δp, ρ, V, D, μ, L, ε → 7 variables, 3 dimensions → 4 Π groups:</p>
<pre class="math">Π₁ = Δp/(ρV²)   [Euler number]
Π₂ = ρVD/μ      [Reynolds number]
Π₃ = L/D        [aspect ratio]
Π₄ = ε/D        [relative roughness]</pre>

<h3>A.4 — Incidence Matrix</h3>
<p>For a network with N nodes and P pipes, the N×P incidence matrix <strong>A</strong>:</p>
<pre class="math">A_{ij} = +1  if pipe j leaves node i
A_{ij} = −1  if pipe j enters node i
A_{ij} =  0  otherwise</pre>
<p>Node continuity: <strong>A</strong>·<strong>Q</strong> = <strong>d</strong> (demand vector)</p>

<h3>A.5 — Loop Equations</h3>
<p>From the co-tree of the network spanning tree, the loop matrix <strong>B</strong> (L×P)
satisfies <strong>B</strong>·<strong>A</strong>ᵀ = 0 and encodes Kirchhoff's voltage law:</p>
<pre class="math"><strong>B</strong>·<strong>h</strong> = 0   (head loss closure around all loops)</pre>

<h3>A.6 — Newton-Raphson for Pipe Networks</h3>
<p>State vector: <strong>x</strong> = [Q₁, …, Q_P, H₁, …, H_N]ᵀ</p>
<pre class="math"><strong>F</strong>(<strong>x</strong>) = [ h_L(Q) − A^T H ;  A·Q − d ] = 0
<strong>J</strong> = ∂<strong>F</strong>/∂<strong>x</strong>  (Jacobian)
Δ<strong>x</strong> = −<strong>J</strong>⁻¹<strong>F</strong>(<strong>x</strong>)</pre>
<p>
  Todini-Pilati reduces this to an N×N system by substituting pipe flows
  as functions of node heads via:
</p>
<pre class="math">Q_k = sgn(H_i − H_j) · √(|H_i − H_j| / r_k )</pre>
<p>where r_k = f_k·L_k / (2g·A_k²·D_k).</p>

<h3>A.7 — Hardy-Cross Loop Correction</h3>
<pre class="math">ΔQ_loop = −∑_k r_k|Q_k|Q_k / (2·∑_k r_k|Q_k|)</pre>

<h3>A.8 — Two-Phase Lockhart-Martinelli</h3>
<pre class="math">X² = (Δp/L)_L / (Δp/L)_G        [Martinelli parameter]
Φ²_L = 1 + C/X + 1/X²           [two-phase multiplier]
(Δp/L)_TP = Φ²_L · (Δp/L)_L     [two-phase pressure gradient]</pre>
<p>C = 21 (liquid-turbulent / gas-turbulent), 12, 10, or 5 depending on regimes.</p>

<h3>A.9 — Dimensionless Groups Summary</h3>
<table class="doc-table">
  <thead><tr><th>Number</th><th>Symbol</th><th>Formula</th><th>Physical meaning</th></tr></thead>
  <tbody>
    <tr><td>Reynolds</td><td>Re</td><td>ρVD/μ</td><td>Inertia / viscous forces</td></tr>
    <tr><td>Prandtl</td><td>Pr</td><td>c_p μ/k</td><td>Momentum / thermal diffusivity</td></tr>
    <tr><td>Nusselt</td><td>Nu</td><td>hD/k</td><td>Convective / conductive HT</td></tr>
    <tr><td>Péclet</td><td>Pe</td><td>Re·Pr</td><td>Advection / diffusion</td></tr>
    <tr><td>Stanton</td><td>St</td><td>Nu/(Re·Pr)</td><td>Heat transferred / heat capacity</td></tr>
    <tr><td>Euler</td><td>Eu</td><td>Δp/(ρV²/2)</td><td>Pressure / dynamic force</td></tr>
    <tr><td>Froude</td><td>Fr</td><td>V/√(gL)</td><td>Inertia / gravity (free surface)</td></tr>
    <tr><td>Mach</td><td>M</td><td>V/a</td><td>Inertia / compressibility</td></tr>
    <tr><td>Dean</td><td>De</td><td>Re√(D/2R_c)</td><td>Centrifugal effects in bends</td></tr>
    <tr><td>Womersley</td><td>Wo</td><td>R√(ω/ν)</td><td>Unsteady / viscous (pulsatile flow)</td></tr>
    <tr><td>Strouhal</td><td>St</td><td>f_s D/V</td><td>Vortex shedding frequency</td></tr>
    <tr><td>Cavitation</td><td>σ</td><td>(p−p_v)/(ρV²/2)</td><td>Pressure above vapour pressure</td></tr>
  </tbody>
</table>
    `
  }
];

/* =========================================================================
   DocsRenderer — renders table of contents and articles
   ========================================================================= */

const DocsRenderer = (() => {

  let _current = null;

  function init() {
    _buildTOC();
    _showArticle(DOCS[0].id);

    // Search
    document.getElementById("docs-search")?.addEventListener("input", e => {
      _filterTOC(e.target.value.toLowerCase());
    });
  }

  function _buildTOC() {
    const container = document.getElementById("docs-toc");
    if (!container) return;

    // Group by category
    const cats = {};
    DOCS.forEach(doc => {
      if (!cats[doc.category]) cats[doc.category] = [];
      cats[doc.category].push(doc);
    });

    container.innerHTML = Object.entries(cats).map(([cat, articles]) => `
      <div class="toc-category">
        <div class="toc-cat-label">${cat}</div>
        ${articles.map(a => `
          <div class="toc-item" id="toc-${a.id}" data-id="${a.id}" onclick="DocsRenderer.show('${a.id}')">
            ${a.title}
          </div>
        `).join("")}
      </div>
    `).join("");
  }

  function _filterTOC(query) {
    document.querySelectorAll(".toc-item").forEach(el => {
      const match = el.textContent.toLowerCase().includes(query);
      el.style.display = match ? "" : "none";
    });
    document.querySelectorAll(".toc-category").forEach(cat => {
      const any = [...cat.querySelectorAll(".toc-item")].some(el => el.style.display !== "none");
      cat.style.display = any ? "" : "none";
    });
  }

  function show(id) {
    _showArticle(id);
  }

  function _showArticle(id) {
    const doc = DOCS.find(d => d.id === id);
    if (!doc) return;

    _current = id;

    // Highlight TOC item
    document.querySelectorAll(".toc-item").forEach(el => {
      el.classList.toggle("active", el.dataset.id === id);
    });

    const viewer = document.getElementById("docs-article");
    if (viewer) {
      viewer.innerHTML = `
        <div class="article-breadcrumb">${doc.category} › ${doc.title}</div>
        <div class="article-body">${doc.content}</div>
      `;
      viewer.scrollTop = 0;
    }
  }

  return { init, show };
})();

/* =========================================================================
   Export
   ========================================================================= */

window.DocsRenderer = DocsRenderer;
window.DOCS         = DOCS;
