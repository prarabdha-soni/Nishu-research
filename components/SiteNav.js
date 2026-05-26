'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function SiteNav({ showBack = false, backLabel = 'All Research', backHref = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white sticky top-0 z-50 border-b-[3px] border-gray-900">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" fill="#1a1a1a" />
            <circle cx="15" cy="15" r="8" fill="none" stroke="white" strokeWidth="1.8" />
            <circle cx="15" cy="15" r="3.5" fill="white" />
          </svg>
          <span className="font-black text-[17px] text-gray-900 tracking-tight leading-none">
            Bharat<span style={{ color: '#CC785C' }}>.</span>Pulse
          </span>
        </Link>

        {/* Back link (article pages) */}
        {showBack && (
          <Link
            href={backHref}
            className="hidden sm:flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backLabel}
          </Link>
        )}

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3 ml-auto">
          <Link href="/pipeline" className="text-gray-600 hover:text-gray-900 text-[13px] font-semibold transition-colors uppercase tracking-wide">
            Pipeline
          </Link>
          <a
            href="mailto:research@bharatpulse.in?subject=Subscribe%20me"
            className="text-[12px] font-bold px-4 py-2 uppercase tracking-widest bg-gray-900 text-white hover:bg-gray-700 transition-colors"
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
              <path d="M6 6l12 12M6 18L18 6" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round"/>
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-3">
            <Link href="/pipeline" onClick={() => setMenuOpen(false)} className="text-gray-700 text-sm font-semibold uppercase tracking-wide py-1">Pipeline</Link>
            <a
              href="mailto:research@bharatpulse.in?subject=Subscribe%20me"
              className="bg-gray-900 text-white text-[12px] font-bold px-4 py-2.5 uppercase tracking-widest text-center"
            >
              Subscribe
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
