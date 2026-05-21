'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

const CATEGORY_COLORS = {
  'AI':               'text-violet-400 bg-violet-400/10 border-violet-400/20',
  'Telecom':          'text-sky-400   bg-sky-400/10   border-sky-400/20',
  'Emerging Markets': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'India Macro':      'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Gold':             'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
}
function catClass(cat) {
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (cat?.toLowerCase().includes(key.toLowerCase())) return CATEGORY_COLORS[key]
  }
  return 'text-g-accent bg-g-accent/10 border-g-accent/20'
}

export default function ResearchFeed({ articles = [] }) {
  const [visible, setVisible] = useState(8)

  return (
    <section id="research" className="bg-g-bg px-6 pb-28 pt-16">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase mb-2">
            Research
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-g-text tracking-[-0.025em] leading-tight">
            All Publications
          </h2>
          <p className="text-g-muted text-[15px] font-light mt-2">
            Long-horizon deep-dives, latest first.
          </p>
        </motion.div>

        {articles.length === 0 ? (
          <p className="text-g-faint text-[15px] py-12 text-center">
            No research published yet.
          </p>
        ) : (
          <>
            {/* Cards */}
            <div className="flex flex-col gap-3">
              {articles.slice(0, visible).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: Math.min(i, 4) * 0.06 }}
                >
                  <Link
                    href={`/article/${a.id}`}
                    className="group block rounded-2xl border border-white/[0.07] bg-g-surface
                      px-7 py-6 hover:border-g-accent/30 hover:bg-g-s2
                      transition-all duration-200"
                  >
                    {/* Top row: category + date */}
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10.5px] font-semibold tracking-[0.16em] uppercase
                          px-2.5 py-1 rounded-full border ${catClass(a.category)}`}>
                          {a.category}
                        </span>
                        {a.issue && (
                          <span className="text-g-faint text-[11px]">
                            No.&thinsp;{String(a.issue).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-g-faint text-[12px] hidden sm:block">
                          {formatDate(a.date)}
                        </span>
                        <span className="text-g-faint text-[12px]">{a.readTime} min read</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-g-text font-semibold text-[18px] md:text-[20px]
                      tracking-[-0.02em] leading-snug mb-2
                      group-hover:text-g-accent transition-colors duration-150">
                      {a.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-g-muted text-[14px] font-light leading-relaxed line-clamp-2">
                      {a.subtitle}
                    </p>

                    {/* Bottom: author + arrow */}
                    <div className="flex items-center justify-between mt-4 pt-4
                      border-t border-white/[0.05]">
                      <span className="text-g-faint text-[12.5px]">{a.author}</span>
                      <span className="text-g-faint group-hover:text-g-accent
                        transition-colors duration-150 group-hover:translate-x-1
                        transform inline-block">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M8.5 4l4.5 4-4.5 4" stroke="currentColor"
                            strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Load more */}
            {visible < articles.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={() => setVisible(v => v + 8)}
                  className="px-8 py-3 rounded-xl border border-white/[0.1] text-g-muted
                    text-[13.5px] font-medium hover:border-white/[0.18] hover:text-g-text
                    transition-all duration-200"
                >
                  Load more
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
