'use client'
import { motion } from 'framer-motion'

const LINES = ['THE FUTURE IS', 'THE BIGGEST', 'MULTIBAGGER']

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const lineVariants = {
  hidden: { opacity: 0, y: 56, skewY: 1 },
  show:   { opacity: 1, y: 0, skewY: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-g-bg">

      {/* ── Animated grid background ── */}
      <div
        className="absolute inset-0 animate-grid-flow"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,179,87,0.032) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,179,87,0.032) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Radial vignette over grid ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,#171614_100%)]" />

      {/* ── Glowing orbs ── */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full animate-orb-drift pointer-events-none"
        style={{
          top: '-10%', left: '-8%',
          background: 'radial-gradient(circle, rgba(255,179,87,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-orb-drift-2 pointer-events-none"
        style={{
          bottom: '-5%', right: '-5%',
          background: 'radial-gradient(circle, rgba(155,142,196,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-20">

        {/* Eyebrow label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full
            border border-g-accent/20 bg-g-accent/5
            text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-g-accent animate-pulse-glow" />
          Future Research Lab
        </motion.p>

        {/* Hero headline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          {LINES.map((line, i) => (
            <div key={i} className="overflow-hidden">
              <motion.div
                variants={lineVariants}
                className={`font-black leading-[0.87] tracking-[-0.04em] text-hero
                  ${i === LINES.length - 1
                    ? 'bg-clip-text text-transparent'
                    : 'text-g-text'
                  }`}
                style={i === LINES.length - 1 ? {
                  backgroundImage: 'linear-gradient(135deg, #F4EFE6 20%, #FFB357 60%, #E8A045 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                } : {}}
              >
                {line}
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="text-g-muted text-[17px] md:text-[19px] font-light leading-relaxed max-w-xl mx-auto mb-12
            tracking-[-0.01em]"
        >
          Researching structural shifts before markets fully understand them.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#research"
            className="px-7 py-3.5 rounded-xl font-semibold text-[14px] tracking-[-0.01em]
              bg-g-text text-g-bg hover:bg-g-accent hover:text-g-bg
              transition-all duration-200 shadow-[0_0_24px_rgba(255,179,87,0)]
              hover:shadow-[0_0_24px_rgba(255,179,87,0.25)]"
          >
            Explore Research
          </a>
          <a
            href="#newsletter"
            className="px-7 py-3.5 rounded-xl font-semibold text-[14px] tracking-[-0.01em]
              bg-white/[0.05] border border-white/[0.1] text-g-muted
              hover:bg-white/[0.08] hover:text-g-text hover:border-white/[0.15]
              transition-all duration-200"
          >
            Subscribe free →
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-16 flex items-center justify-center gap-8 md:gap-12 text-g-faint text-[12px] tracking-[0.06em] uppercase"
        >
          {[
            ['Research', 'Independent'],
            ['Markets', 'India & EM'],
            ['Focus', 'Long Horizon'],
          ].map(([label, val]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-g-muted font-semibold text-[15px] tracking-[-0.01em]">{val}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-white/20">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
