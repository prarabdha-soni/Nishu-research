'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { SIGNALS } from '@/lib/glowData'

function SignalCard({ signal, idx }) {
  const [copied, setCopied] = useState(false)

  function copySignal() {
    navigator.clipboard.writeText(`SIGNAL #${signal.id}: "${signal.text}" — gloww.in`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl border border-white/[0.07] bg-g-surface p-7
        hover:border-g-accent/20 transition-all duration-300
        hover:shadow-[0_0_32px_rgba(255,179,87,0.05)]"
    >
      {/* Signal label */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-g-accent text-[10.5px] font-bold tracking-[0.22em] uppercase">
          Signal #{String(signal.id).padStart(2, '0')}
        </span>
        <button
          onClick={copySignal}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
            text-[11px] text-g-faint hover:text-g-muted flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#6FC98B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-g-green">Copied</span>
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 3V2a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              Share
            </>
          )}
        </button>
      </div>

      {/* Signal text */}
      <p className="text-g-text text-[15px] md:text-[16px] font-medium leading-[1.65] tracking-[-0.01em]">
        &ldquo;{signal.text}&rdquo;
      </p>

      {/* Decorative quote */}
      <div className="absolute bottom-5 right-6 text-5xl text-g-accent/8 font-serif leading-none select-none">
        &rdquo;
      </div>
    </motion.div>
  )
}

export default function SignalBlocks() {
  return (
    <section id="signals" className="bg-g-bg py-28 px-6 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <p className="text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase mb-3">
              Market Signals
            </p>
            <h2 className="text-heading font-bold text-g-text tracking-[-0.025em] leading-[1.1]">
              What we see that others miss.
            </h2>
          </div>
          <p className="hidden md:block text-g-faint text-[13px] max-w-[200px] text-right leading-relaxed">
            Short-form insight. Shareable. Citable.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SIGNALS.map((signal, i) => (
            <SignalCard key={signal.id} signal={signal} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
