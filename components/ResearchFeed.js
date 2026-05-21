'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ResearchFeed({ articles = [] }) {
  const [visible, setVisible] = useState(6)

  return (
    <section id="research-feed" className="bg-g-bg py-28 px-6 border-t border-white/[0.05]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-g-accent text-[11px] font-semibold tracking-[0.22em] uppercase mb-3">
            Research Archive
          </p>
          <h2 className="text-heading font-bold text-g-text tracking-[-0.025em] leading-[1.1]">
            All Research
          </h2>
        </motion.div>

        {/* List */}
        <div className="flex flex-col divide-y divide-white/[0.05]">
          {articles.slice(0, visible).map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
            >
              <Link
                href={`/article/${a.id}`}
                className="group flex items-start justify-between gap-6 py-7
                  hover:bg-white/[0.015] -mx-6 px-6 rounded-xl transition-colors duration-150"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-g-accent text-[10.5px] font-bold tracking-[0.18em] uppercase">
                      {a.category}
                    </span>
                    <span className="text-white/10">·</span>
                    <span className="text-g-faint text-[11px]">
                      No.&thinsp;{String(a.issue || '01').padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-g-text font-semibold text-[16px] md:text-[18px] tracking-[-0.02em]
                    leading-snug mb-2 group-hover:text-g-accent transition-colors duration-150">
                    {a.title}
                  </h3>
                  <p className="text-g-muted text-[13.5px] font-light leading-relaxed line-clamp-2">
                    {a.subtitle}
                  </p>
                </div>

                <div className="flex-shrink-0 text-right hidden sm:block">
                  <div className="text-g-faint text-[12px] mb-1">{formatDate(a.date)}</div>
                  <div className="text-g-faint text-[12px]">{a.readTime} min</div>
                  <div className="mt-3 text-g-faint group-hover:text-g-accent transition-colors duration-150">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M8.5 4l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
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
            className="mt-10 text-center"
          >
            <button
              onClick={() => setVisible(v => v + 6)}
              className="px-8 py-3 rounded-xl border border-white/[0.1] text-g-muted text-[13.5px] font-medium
                hover:border-white/[0.18] hover:text-g-text transition-all duration-200"
            >
              Load more research
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
