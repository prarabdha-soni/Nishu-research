'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SiteNav({ showBack = false, backLabel = 'All Research', backHref = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{ backgroundColor: '#0a0a0a' }} className="sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" fill="#f97316" />
            <circle cx="14" cy="14" r="7" fill="none" stroke="white" strokeWidth="1.8" />
            <circle cx="14" cy="14" r="3" fill="white" />
          </svg>
          <span className="font-black text-[17px] tracking-tight leading-none text-white">
            Bharat<span style={{ color: '#f97316' }}>.</span>Pulse
          </span>
        </Link>

        {/* Back link (article pages) */}
        {showBack && (
          <Link
            href={backHref}
            className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backLabel}
          </Link>
        )}

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 ml-auto">
          <Link
            href="/pipeline"
            className="text-gray-400 hover:text-white text-[13px] font-semibold transition-colors uppercase tracking-wide px-3 py-1.5"
          >
            Pipeline
          </Link>
          <a
            href="mailto:research@bharatpulse.in?subject=Subscribe%20me"
            className="text-[12px] font-bold px-4 py-2 uppercase tracking-widest text-white transition-colors rounded-sm"
            style={{ backgroundColor: '#f97316' }}
          >
            Subscribe
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-1"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ backgroundColor: '#111111', borderTop: '1px solid #222' }}>
          <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-3">
            <Link href="/pipeline" onClick={() => setMenuOpen(false)} className="text-gray-300 text-sm font-semibold uppercase tracking-wide py-1">
              Pipeline
            </Link>
            <a
              href="mailto:research@bharatpulse.in?subject=Subscribe%20me"
              className="text-[12px] font-bold px-4 py-2.5 uppercase tracking-widest text-white text-center rounded-sm"
              style={{ backgroundColor: '#f97316' }}
            >
              Subscribe
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
