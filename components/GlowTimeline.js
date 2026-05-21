'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { TIMELINE } from '@/lib/glowData'

function TimelineItem({ event, idx }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isPredicted = event.year.includes('+')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-6 md:gap-10"
    >
      {/* Year column */}
      <div className="flex-shrink-0 w-16 md:w-24 pt-1 text-right">
        <span className={`font-bold text-[13px] md:text-[15px] tracking-[-0.01em]
          ${isPredicted ? 'text-g-purple' : 'text-g-accent'}`}>
          {event.year}
        </span>
      </div>

      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0 z-10
          ${isPredicted
            ? 'border-g-purple bg-g-bg shadow-[0_0_10px_rgba(155,142,196,0.4)]'
            : 'border-g-accent bg-g-bg shadow-[0_0_10px_rgba(255,179,87,0.4)]'}`} />
        {idx < TIMELINE.length - 1 && (
          <div className="w-px flex-1 mt-2 bg-gradient-to-b from-white/10 to-white/[0.03]" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 flex-1">
        <h3 className="text-g-text font-semibold text-[15px] md:text-[17px] tracking-[-0.015em] mb-2 leading-snug">
          {event.title}
          {isPredicted && (
            <span className="ml-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-g-purple">Predicted</span>
          )}
        </h3>
        <p className="text-g-muted text-[13.5px] font-light leading-relaxed max-w-lg">
          {event.desc}
        </p>
      </div>
    </motion.div>
  )
}

export default function GlowTimeline() {
  return (
    <section className="bg-g-bg py-28 px-6 border-t border-white/[0.05]">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase mb-4">
            Structural Shifts
          </p>
          <h2 className="text-heading font-bold text-g-text tracking-[-0.025em] leading-[1.1]">
            The arc of change, compressed.
          </h2>
          <p className="mt-4 text-g-muted text-[15px] font-light leading-relaxed max-w-md">
            Every shift below created a decade of compounding opportunity. The next one is visible, if you know where to look.
          </p>
        </motion.div>

        {/* Timeline */}
        <div>
          {TIMELINE.map((event, i) => (
            <TimelineItem key={event.year} event={event} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
