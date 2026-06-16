import type { ButtonHTMLAttributes, ReactNode } from 'react'

/** Reusable, on-theme UI primitives for Bogey Bucks. */

export function Card({
  children,
  className = '',
  onClick,
  glow = false,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** Adds a soft gold glow ring for hero/featured cards. */
  glow?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`ring-grad glass relative rounded-3xl shadow-xl shadow-black/40 ${
        glow ? 'shadow-[0_10px_40px_-10px_rgba(245,180,38,0.35)]' : ''
      } ${
        onClick
          ? 'cursor-pointer transition-all duration-200 active:scale-[0.985] hover:shadow-2xl hover:shadow-black/50'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'sheen inline-flex items-center justify-center gap-2 rounded-2xl font-display font-semibold tracking-tight transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:active:scale-100 disabled:saturate-50'
  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  }
  const variants = {
    primary:
      'bg-gradient-to-b from-fairway-400 to-fairway-500 text-white shadow-lg shadow-fairway-500/30 ring-1 ring-inset ring-white/10 hover:from-fairway-300 hover:to-fairway-400',
    secondary:
      'bg-white/5 text-white ring-1 ring-inset ring-white/15 hover:bg-white/10',
    ghost: 'bg-transparent text-fairway-200 hover:bg-white/5',
    gold: 'bg-gradient-to-b from-gold-400 to-gold-600 text-fairway-950 shadow-lg shadow-gold-500/35 ring-1 ring-inset ring-white/25 hover:from-gold-300 hover:to-gold-500',
    danger:
      'bg-gradient-to-b from-cash-down to-rose-600 text-white shadow-lg shadow-rose-500/25',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Pill({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: 'neutral' | 'up' | 'down' | 'gold' | 'green'
  className?: string
}) {
  const tones = {
    neutral: 'bg-white/8 text-fairway-100 ring-white/10',
    up: 'bg-cash-up/15 text-cash-up ring-cash-up/25',
    down: 'bg-cash-down/15 text-cash-down ring-cash-down/25',
    gold: 'bg-gold-500/15 text-gold-300 ring-gold-500/30',
    green: 'bg-fairway-400/15 text-fairway-200 ring-fairway-400/30',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-fairway-300/70">
        <span className="h-3 w-0.5 rounded-full bg-gradient-to-b from-gold-400 to-fairway-400" />
        {children}
      </h2>
      {action}
    </div>
  )
}

export function GolfBall({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block ${className}`} aria-hidden>
      ⛳️
    </span>
  )
}

export function EmptyState({
  emoji,
  title,
  subtitle,
}: {
  emoji: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="ring-grad glass flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center">
      <div className="mb-3 text-5xl opacity-90 animate-float">{emoji}</div>
      <p className="font-display font-semibold text-fairway-50">{title}</p>
      {subtitle && (
        <p className="mt-1.5 max-w-xs text-sm text-fairway-300/70">
          {subtitle}
        </p>
      )}
    </div>
  )
}
