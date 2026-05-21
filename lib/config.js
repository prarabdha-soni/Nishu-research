// ── Site-wide constants — update these to match your deployment ──

export const SITE_NAME = 'Bharat.Pulse'
// Update SITE_URL after first Vercel deployment
export const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || 'https://nishu-research.vercel.app'

// ── Subscriber count (task 3) ────────────────────────────────────
// Update this number whenever you hit a milestone
export const SUBSCRIBER_COUNT = '1,200+'

// ── Social links (task 2) ────────────────────────────────────────
// Replace placeholder URLs with your real profiles
export const SOCIAL_LINKS = {
  twitter:  'https://twitter.com/bharatpulse',
  linkedin: 'https://linkedin.com/company/bharatpulse',
  whatsapp: 'https://whatsapp.com/channel/bharatpulse',
}

// ── Author profile (task 4) ──────────────────────────────────────
export const AUTHOR = {
  name:     'Prarabdha Soni',
  initial:  'P',
  role:     'Independent Equity Analyst',
  bio:      'Focused on India & emerging markets — writes long-horizon, data-driven research on structural growth stories that institutional coverage tends to underweight.',
  twitter:  'https://twitter.com/prarabdha',
  linkedin: 'https://linkedin.com/in/prarabdha-soni',
}

// ── Research pipeline (task 9) ───────────────────────────────────
// Update names, categories, badges, and teasers manually
export const PIPELINE = [
  {
    name:     'IDFC First Bank',
    category: 'Banking & NBFC',
    badge:    'Coming Soon',
    teaser:   'From troubled origins to potential 10x — the case for India\'s most misunderstood bank.',
  },
  {
    name:     'India\'s EV Supply Chain',
    category: 'Clean Energy',
    badge:    'Coming Soon',
    teaser:   'Who actually wins when India electrifies 300M two-wheelers? A deep look at the component layer.',
  },
  {
    name:     'Dixon Technologies',
    category: 'Electronics Manufacturing',
    badge:    'Q3 2025',
    teaser:   'India\'s answer to Foxconn — and why PLI tailwinds are only the start of the story.',
  },
  {
    name:     'Southeast Asia Fintech',
    category: 'Emerging Markets',
    badge:    'Coming Soon',
    teaser:   'Mapping the fintech landscape across 650M unbanked adults — who\'s building the rails?',
  },
]
