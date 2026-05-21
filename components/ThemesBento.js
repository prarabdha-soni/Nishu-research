'use client'
import { motion } from 'framer-motion'
import { THEMES } from '@/lib/glowData'

const ICONS = {
  ai:       '⟡',
  infra:    '◈',
  telecom:  '◎',
  attention:'◉',
  gold:     '◆',
  health:   '✦',
}

const TAG_STYLES = {
  'Emerging':    'text-g-accent bg-g-accent/10 border-g-accent/20',
  'Structural':  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Conviction':  'text-g-purple bg-g-purple/10 border-g-purple/20',
  'Behavioural': 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  'Macro':       'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Next Decade': 'text-g-green bg-g-green/10 border-g-green/20',
}

function ThemeCard({ theme, className = '', delay = 0 }) {
  const tagStyle = TAG_STYLES[theme.tag] || TAG_STYLES['Emerging']
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.01 }}
      className={`group relative rounded-2xl border border-white/[0.07] bg-g-surface p-7
        hover:border-white/[0.13] hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]
        transition-all duration-300 cursor-default flex flex-col ${className}`}
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,179,87,0.04) 0%, transparent 70%)' }} />

      <div className="relative">
        {/* Icon + tag */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-200">
            {ICONS[theme.id] || '◉'}
          </span>
          <span className={`text-[10px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1
            rounded-full border ${tagStyle}`}>
            {theme.tag}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-g-text font-bold text-[16px] md:text-[18px] tracking-[-0.02em] leading-tight mb-3">
          {theme.title}
        </h3>

        {/* Description */}
        <p className="text-g-muted text-[13.5px] font-light leading-relaxed">
          {theme.desc}
        </p>
      </div>
    </motion.div>
  )
}

export default function ThemesBento() {
  return (
    <section id="themes" className="bg-g-bg py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase mb-4">
            Themes We&apos;re Studying
          </p>
          <h2 className="text-heading font-bold text-g-text tracking-[-0.025em] max-w-xl mx-auto leading-[1.1]">
            Civilization-level shifts. Long before consensus.
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Featured large tile */}
          <ThemeCard theme={THEMES[0]} className="md:col-span-2 md:row-span-1" delay={0} />

          {/* Small tile right */}
          <ThemeCard theme={THEMES[1]} delay={0.08} />

          {/* Middle row */}
          <ThemeCard theme={THEMES[2]} delay={0.12} />
          <ThemeCard theme={THEMES[3]} delay={0.16} />
          <ThemeCard theme={THEMES[4]} delay={0.2} />

          {/* Bottom spanning */}
          <ThemeCard theme={THEMES[5]} className="md:col-span-3 md:flex-row md:items-center md:justify-between" delay={0.24} />
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-g-faint text-[13px] mt-10"
        >
          Each theme informs multiple research pieces over time. <a href="#newsletter" className="text-g-accent hover:underline">Subscribe</a> to follow a specific thread.
        </motion.p>
      </div>
    </section>
  )
}
