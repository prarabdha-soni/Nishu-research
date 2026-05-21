import { PIPELINE } from '@/lib/config'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const metadata = {
  title: 'Research Pipeline — Bharat Pulse',
  description: 'Upcoming deep-dive research on AI, telecom, emerging markets, and civilizational change.',
}

export default function PipelinePage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <SiteNav showBack backLabel="All Research" backHref="/" />

      {/* Masthead */}
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <p className="text-[#CC785C] text-[10.5px] font-semibold tracking-[0.2em] uppercase mb-4">
          Research Pipeline
        </p>
        <h1 className="text-4xl md:text-[3.2rem] font-bold text-stone-900 tracking-[-0.03em] leading-tight mb-4">
          What&apos;s Coming Next
        </h1>
        <p className="text-stone-500 text-[16px] font-light leading-relaxed max-w-xl">
          Deep-dives currently in progress. Subscribe to get notified the moment each piece publishes.
        </p>
      </div>

      {/* Pipeline cards */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-200 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
          {PIPELINE.map((item, i) => (
            <div key={i} className="bg-white hover:bg-stone-50 transition-colors duration-150 p-8 flex flex-col gap-3">
              {/* Top: category + badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-stone-400">
                  {item.category}
                </span>
                <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${
                  item.badge === 'Coming Soon'
                    ? 'bg-[#CC785C]/10 text-[#CC785C]'
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {item.badge}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[18px] md:text-[19px] font-semibold text-stone-900 leading-snug tracking-[-0.02em]">
                {item.name}
              </h2>

              {/* Teaser */}
              <p className="text-stone-500 text-[13.5px] font-light leading-relaxed">
                {item.teaser}
              </p>
            </div>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
