'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const CATEGORY_COLORS = {
  'Emerging Markets': { dot: 'bg-g-accent', text: 'text-g-accent', glow: 'rgba(255,179,87,0.08)' },
  'AI':               { dot: 'bg-g-purple', text: 'text-g-purple', glow: 'rgba(155,142,196,0.08)' },
  'Telecom':          { dot: 'bg-g-green',  text: 'text-g-green',  glow: 'rgba(111,201,139,0.08)' },
  'Internet':         { dot: 'bg-blue-400', text: 'text-blue-400', glow: 'rgba(96,165,250,0.08)' },
}

function getCat(category = '') {
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (category.includes(key)) return CATEGORY_COLORS[key]
  }
  return { dot: 'bg-g-accent', text: 'text-g-accent', glow: 'rgba(255,179,87,0.08)' }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

function ArticleCard({ article: a, featured, idx }) {
  const cat = getCat(a.category)
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/article/${a.id}`}
        className={`group block h-full rounded-2xl border border-white/[0.07] bg-g-surface
          hover:border-white/[0.14] transition-all duration-300
          hover:shadow-[0_0_40px_rgba(255,179,87,0.05)]
          ${featured ? 'p-9' : 'p-7'}`}
        style={{ '--cat-glow': cat.glow }}
      >
        {/* Cover image or gradient placeholder */}
        <div className={`rounded-xl overflow-hidden mb-6 ${featured ? 'h-52' : 'h-36'}`}>
          {a.coverImage ? (
            <img
              src={a.coverImage}
              alt={a.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-end p-4"
              style={{ background: `linear-gradient(135deg, ${cat.glow.replace('0.08', '0.18')} 0%, rgba(23,22,20,0.2) 100%)` }}
            >
              <div className={`font-bold text-[10px] tracking-[0.18em] uppercase opacity-50 ${cat.text}`}>
                {a.category}
              </div>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
            <span className={`text-[11px] font-semibold tracking-[0.15em] uppercase ${cat.text}`}>
              {a.category}
            </span>
          </div>
          <span className="text-g-faint text-[11.5px]">
            No.&thinsp;{String(a.issue || '01').padStart(2, '0')}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-g-text leading-[1.18] tracking-[-0.02em] mb-3
          group-hover:text-g-accent transition-colors duration-200
          ${featured ? 'text-[22px] md:text-[26px]' : 'text-[17px] md:text-[19px]'}`}>
          {a.title}
        </h3>

        {/* Subtitle */}
        <p className={`text-g-muted font-light leading-relaxed mb-5
          ${featured ? 'text-[15.5px]' : 'text-[13.5px] line-clamp-2'}`}>
          {a.subtitle}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <span className="text-g-faint text-[12px]">{a.author}</span>
          <div className="flex items-center gap-3 text-g-faint text-[12px]">
            <span>{a.readTime} min</span>
            <span>{formatDate(a.date)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function FeaturedResearch({ articles = [] }) {
  if (!articles.length) return null
  const [featured, ...rest] = articles
  const grid = rest.slice(0, 5)

  return (
    <section id="research" className="bg-g-bg py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <p className="text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase mb-3">
              Featured Research
            </p>
            <h2 className="text-heading font-bold text-g-text tracking-[-0.025em] leading-[1.1]">
              Deep-dive analysis on<br className="hidden md:block" /> what markets miss.
            </h2>
          </div>
          <Link
            href="#research-feed"
            className="hidden md:inline-flex items-center gap-2 text-[13px] font-medium text-g-muted
              hover:text-g-text transition-colors duration-150"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7.5 4l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>

        {/* Featured + grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Featured (full width on mobile, 2 cols on desktop) */}
          <div className="md:col-span-2">
            <ArticleCard article={featured} featured idx={0} />
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-3">
            {grid.slice(0, 2).map((a, i) => (
              <ArticleCard key={a.id} article={a} idx={i + 1} />
            ))}
          </div>

          {/* Bottom row */}
          {grid.slice(2, 5).map((a, i) => (
            <ArticleCard key={a.id} article={a} idx={i + 3} />
          ))}
        </div>
      </div>
    </section>
  )
}
