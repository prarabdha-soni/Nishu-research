'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Research', href: '#research' },
  { label: 'Themes',   href: '#themes' },
  { label: 'Signals',  href: '#signals' },
  { label: 'Pipeline', href: '/pipeline' },
]

export default function GlowNav() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-g-bg/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_40px_rgba(0,0,0,0.4)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-g-accent/20 border border-g-accent/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-g-accent animate-pulse-glow" />
            </div>
            <span className="font-bold text-[17px] tracking-[-0.02em] text-g-text group-hover:text-g-accent transition-colors duration-200">
              gloww
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="px-4 py-2 text-[13.5px] font-medium text-g-muted hover:text-g-text transition-colors duration-150 rounded-lg hover:bg-white/[0.04]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="#newsletter"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg
                bg-g-accent/10 border border-g-accent/25 text-g-accent
                hover:bg-g-accent hover:text-g-bg hover:border-g-accent
                transition-all duration-200"
            >
              Subscribe
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="opacity-70">
                <path d="M1 11L11 1M11 1H4M11 1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            {/* Mobile burger */}
            <button
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              <span className={`block w-5 h-px bg-g-muted transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`block w-5 h-px bg-g-muted transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-g-bg/95 backdrop-blur-xl border-b border-white/[0.06]"
          >
            <nav className="flex flex-col px-6 py-4 gap-1">
              {NAV_LINKS.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-[15px] font-medium text-g-muted hover:text-g-text rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#newsletter"
                onClick={() => setMenuOpen(false)}
                className="mt-2 px-4 py-3 text-[14px] font-semibold text-g-accent bg-g-accent/10 border border-g-accent/20 rounded-lg text-center"
              >
                Subscribe →
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
