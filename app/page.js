import Link from 'next/link'
import { connectDB, Article } from '@/lib/db'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Bharat Pulse — Future Research Lab | The Future Is The Biggest Multibagger',
  description: 'Independent long-horizon research on AI, telecom, emerging markets, gold, and civilizational change. Studying structural shifts before markets understand them.',
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function HomePage() {
  await connectDB()
  const raw = await Article.find(
    { status: 'published' },
    '-blocks -__v'
  ).sort({ date: -1 }).lean()
  const articles = JSON.parse(JSON.stringify(raw))

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <SiteNav />

      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <p className="text-[#CC785C] text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-4">
          Independent Research
        </p>
        <h1 className="text-4xl md:text-[3.2rem] font-bold text-stone-900 tracking-[-0.03em] leading-tight mb-4 max-w-2xl">
          The Future Is The Biggest Multibagger.
        </h1>
        <p className="text-stone-500 text-[16px] font-light leading-relaxed max-w-xl">
          Long-horizon deep-dives on AI, telecom, emerging markets, and civilizational change.
          Studying structural shifts before markets understand them.
        </p>
      </div>

      {/* Articles */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-stone-400 text-[15px]">
            No research published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-200 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            {articles.map(a => (
              <Link
                key={a.id}
                href={`/article/${a.id}`}
                className="group bg-white hover:bg-stone-50 transition-colors duration-150 p-8 flex flex-col gap-3"
              >
                {/* Top: category + date */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-stone-400">
                    {a.category}
                  </span>
                  <span className="text-[11px] text-stone-400 flex-shrink-0">
                    {formatDate(a.date)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-[18px] md:text-[19px] font-semibold text-stone-900 leading-snug tracking-[-0.02em] group-hover:text-[#CC785C] transition-colors duration-150">
                  {a.title}
                </h2>

                {/* Subtitle */}
                <p className="text-stone-500 text-[13.5px] font-light leading-relaxed line-clamp-2 flex-1">
                  {a.subtitle}
                </p>

                {/* Footer: author + read time + arrow */}
                <div className="flex items-center justify-between pt-4 mt-1 border-t border-stone-100 text-[12px] text-stone-400">
                  <span>{a.author}</span>
                  <div className="flex items-center gap-2">
                    <span>{a.readTime} min read</span>
                    <svg
                      width="14" height="14" viewBox="0 0 16 16" fill="none"
                      className="text-stone-300 group-hover:text-[#CC785C] group-hover:translate-x-0.5 transition-all duration-150"
                    >
                      <path d="M3 8h10M8.5 4l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}
