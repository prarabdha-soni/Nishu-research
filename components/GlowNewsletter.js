'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { SUBSCRIBER_COUNT } from '@/lib/config'

export default function GlowNewsletter() {
  const [email, setEmail]     = useState('')
  const [submitted, setSubmit] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    window.open(
      `mailto:research@gloww.in?subject=Subscribe%20me&body=Please%20add%20me%3A%20${encodeURIComponent(email)}`,
      '_blank'
    )
    setSubmit(true)
    setEmail('')
  }

  return (
    <section id="newsletter" className="relative bg-g-surface py-28 px-6 overflow-hidden border-t border-white/[0.05]">

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,179,87,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase mb-5">
            Free Research
          </p>
          <h2 className="text-display font-black text-g-text tracking-[-0.035em] leading-[1.05] mb-5">
            Stay ahead of the shift.
          </h2>
          <p className="text-g-muted text-[16px] font-light leading-relaxed mb-10 max-w-md mx-auto">
            Long-horizon deep-dives on AI, telecom, gold, and emerging markets. Once a week. No noise.
          </p>

          {submitted ? (
            <div className="py-6">
              <p className="text-g-green font-medium text-[15px]">
                ✓ Thanks — check your email to confirm.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 rounded-xl bg-g-bg border border-white/[0.1] text-g-text
                  text-[14px] placeholder:text-g-faint outline-none
                  focus:border-g-accent/50 focus:shadow-[0_0_20px_rgba(255,179,87,0.08)]
                  transition-all duration-200"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-xl font-semibold text-[14px] tracking-[-0.01em]
                  bg-g-accent text-g-bg hover:bg-g-accent-2
                  transition-all duration-200 shadow-[0_0_24px_rgba(255,179,87,0.2)]
                  hover:shadow-[0_0_32px_rgba(255,179,87,0.3)] whitespace-nowrap"
              >
                Subscribe free
              </button>
            </form>
          )}

          {/* Social proof */}
          <p className="text-g-faint text-[13px]">
            <span className="text-g-muted font-semibold">{SUBSCRIBER_COUNT}</span> long-term investors already in. No spam, ever.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
