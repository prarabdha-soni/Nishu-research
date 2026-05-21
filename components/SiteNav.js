'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SiteNav({ showBack = false, backLabel = 'All Research', backHref = '/' }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200'
          : 'bg-white border-b border-stone-200'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Left: back button OR brand */}
        {showBack ? (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors duration-150 group"
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className="group-hover:-translate-x-0.5 transition-transform duration-150"
            >
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backLabel}
          </Link>
        ) : (
          <Link
            href="/"
            className="font-bold text-[17px] tracking-[-0.02em] text-stone-900 hover:text-stone-700 transition-colors duration-150"
          >
            Bharat<span className="text-[#CC785C]">.</span>Pulse
          </Link>
        )}

        {/* Center brand (only when back button is shown) */}
        {showBack && (
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-bold text-[16px] tracking-[-0.02em] text-stone-900 hover:text-stone-700 transition-colors duration-150 hidden sm:block"
          >
            Bharat<span className="text-[#CC785C]">.</span>Pulse
          </Link>
        )}

        {/* Right: nav links + subscribe */}
        <div className="flex items-center gap-2">
          {!showBack && (
            <Link
              href="/pipeline"
              className="text-stone-500 hover:text-stone-900 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all duration-150"
            >
              Pipeline
            </Link>
          )}
          <a
            href="mailto:research@bharatpulse.in?subject=Subscribe%20me"
            className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-[#CC785C] text-white hover:bg-[#b86a50] transition-colors duration-150"
          >
            Subscribe
          </a>
        </div>
      </div>
    </header>
  )
}
