import Link from 'next/link'
import { SOCIAL_LINKS } from '@/lib/config'

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

const FOOTER_LINKS = [
  { group: 'Content',  items: [{ label: 'Research', href: '#research' }, { label: 'Themes', href: '#themes' }, { label: 'Signals', href: '#signals' }] },
  { group: 'Platform', items: [{ label: 'Pipeline', href: '/pipeline' }, { label: 'RSS Feed', href: '/feed.xml' }, { label: 'Admin', href: '/admin' }] },
]

export default function GlowFooter() {
  return (
    <footer className="bg-g-bg border-t border-white/[0.06] px-6 pt-16 pb-10">
      <div className="max-w-7xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-g-accent/20 border border-g-accent/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-g-accent" />
              </div>
              <span className="font-bold text-[17px] tracking-[-0.02em] text-g-text">gloww</span>
            </div>
            <p className="text-g-faint text-[13.5px] font-light leading-relaxed max-w-xs mb-6">
              Researching structural shifts before markets fully understand them.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              <a href={SOCIAL_LINKS.twitter}  target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center
                  text-g-faint hover:text-g-accent hover:border-g-accent/30 transition-all duration-150">
                <XIcon />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center
                  text-g-faint hover:text-g-accent hover:border-g-accent/30 transition-all duration-150">
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map(group => (
            <div key={group.group}>
              <div className="text-g-faint text-[11px] font-semibold tracking-[0.18em] uppercase mb-4">
                {group.group}
              </div>
              <ul className="flex flex-col gap-3">
                {group.items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-g-muted text-[14px] hover:text-g-text transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-g-faint text-[12.5px]">
            © {new Date().getFullYear()} Gloww. Independent research.
          </p>
          <p className="text-g-faint text-[12px] italic">
            &ldquo;The Future Is The Biggest Multibagger.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  )
}
