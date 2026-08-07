/**
 * Shared UI Primitives
 * --------------------
 * Re-usable components across all pages.
 */

import React from 'react'
import { clsx } from 'clsx'
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react'

// ─── Spinner ─────────────────────────────────────────────────────────────────

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={clsx('animate-spin text-flow-500', className)} />
}

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray'

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  blue:  'badge-blue',
  green: 'badge-green',
  amber: 'badge-amber',
  red:   'badge-red',
  gray:  'badge-gray',
}

export function Badge({
  children, variant = 'gray', className,
}: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={clsx(BADGE_CLASSES[variant], className)}>
      {children}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { variant: BadgeVariant; dot: string; label: string }> = {
  pending:   { variant: 'gray',  dot: 'bg-slate-400',  label: 'Pending' },
  running:   { variant: 'blue',  dot: 'bg-flow-500 animate-pulse', label: 'Running' },
  converged: { variant: 'green', dot: 'bg-teal-500',   label: 'Converged' },
  failed:    { variant: 'red',   dot: 'bg-danger-500', label: 'Failed' },
  cancelled: { variant: 'gray',  dot: 'bg-slate-400',  label: 'Cancelled' },
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <Badge variant={meta.variant} className="gap-1.5">
      <span className={clsx('w-1.5 h-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </Badge>
  )
}

// ─── Flow Regime Badge ────────────────────────────────────────────────────────

const REGIME_VARIANT: Record<string, BadgeVariant> = {
  laminar:          'blue',
  transitional:     'amber',
  turbulent_smooth: 'green',
  turbulent_rough:  'amber',
  fully_turbulent:  'red',
}

export function RegimeBadge({ regime }: { regime: string }) {
  const variant = REGIME_VARIANT[regime] ?? 'gray'
  const label = regime.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return <Badge variant={variant}>{label}</Badge>
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  subtext?: string
  icon?: React.ReactNode
  variant?: 'default' | 'blue' | 'green' | 'amber' | 'red'
  className?: string
}

const METRIC_VARIANTS = {
  default: 'bg-white border-slate-200',
  blue:    'bg-flow-50 border-flow-200',
  green:   'bg-teal-50 border-teal-200',
  amber:   'bg-amber-50 border-amber-200',
  red:     'bg-danger-50 border-danger-200',
}

export function MetricCard({
  label, value, unit, subtext, icon, variant = 'default', className,
}: MetricCardProps) {
  return (
    <div className={clsx(
      'rounded-xl border p-4 flex flex-col gap-1 shadow-sm',
      METRIC_VARIANTS[variant],
      className,
    )}>
      <div className="flex items-start justify-between">
        <span className="label">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="metric-value font-mono-nums">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon, title, description, action,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────────────────────

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const ALERT_STYLES: Record<AlertVariant, { wrapper: string; icon: React.ReactNode }> = {
  info:    { wrapper: 'bg-flow-50 border-flow-200 text-flow-800',   icon: <Info size={15} /> },
  success: { wrapper: 'bg-teal-50 border-teal-200 text-teal-800',  icon: <CheckCircle2 size={15} /> },
  warning: { wrapper: 'bg-amber-50 border-amber-200 text-amber-800', icon: <AlertTriangle size={15} /> },
  error:   { wrapper: 'bg-danger-50 border-danger-200 text-danger-800', icon: <XCircle size={15} /> },
}

export function Alert({
  variant = 'info', title, children,
}: { variant?: AlertVariant; title?: string; children: React.ReactNode }) {
  const s = ALERT_STYLES[variant]
  return (
    <div className={clsx('flex gap-3 rounded-lg border px-4 py-3 text-sm', s.wrapper)}>
      <span className="mt-0.5 shrink-0">{s.icon}</span>
      <div>
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        {children}
      </div>
    </div>
  )
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────

export function LoadingOverlay({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size={24} />
      <span className="text-sm text-slate-500">{message}</span>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

// ─── Number Formatter ─────────────────────────────────────────────────────────

export function formatNumber(n: number, decimals = 3): string {
  if (Math.abs(n) === 0) return '0'
  if (Math.abs(n) < 0.001 || Math.abs(n) >= 1e6) {
    return n.toExponential(2)
  }
  return n.toFixed(decimals)
}

export function formatFlow(q: number): string {
  const liters = q * 1000
  if (liters < 0.1) return `${(q * 1e6).toFixed(1)} mL/s`
  if (liters < 10)  return `${liters.toFixed(2)} L/s`
  return `${liters.toFixed(1)} L/s`
}

export function formatPressure(pa: number): string {
  if (Math.abs(pa) >= 1e6) return `${(pa / 1e6).toFixed(3)} MPa`
  if (Math.abs(pa) >= 1e3) return `${(pa / 1e3).toFixed(2)} kPa`
  return `${pa.toFixed(1)} Pa`
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export function Tooltip({
  children, content,
}: { children: React.ReactNode; content: string }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-slate-800 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
          {content}
        </div>
        <div className="w-2 h-2 bg-slate-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
    </div>
  )
}

// ─── Kbd ─────────────────────────────────────────────────────────────────────

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-mono text-slate-600 shadow-sm">
      {children}
    </kbd>
  )
}
