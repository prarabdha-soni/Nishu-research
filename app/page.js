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
  const date = new Date(d)
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`
}

function ArticleCard({ article, featured = false }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="block group bg-white hover:bg-gray-50 transition-colors duration-150 border border-gray-200"
    >
      {/* Thumbnail */}
      <div className={`overflow-hidden bg-gray-200 ${featured ? 'h-[200px]' : 'h-[130px]'}`}>
        {article.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 font-black text-2xl tracking-[0.3em]">BP</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {article.category && (
          <span
            className="block text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5"
            style={{ color: '#f97316' }}
          >
            {article.category}
          </span>
        )}

        <h2
          className={`font-black text-gray-900 leading-tight mb-2 group-hover:underline transition-colors duration-150 ${
            featured ? 'text-[22px] md:text-[26px]' : 'text-[16px] md:text-[18px]'
          }`}
        >
          {article.title}
        </h2>

        {article.subtitle && (
          <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 mb-3 italic">
            {article.subtitle}
          </p>
        )}

        {/* Metadata row — ZeroHedge style */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 text-[11px] text-gray-400 uppercase tracking-wider font-medium">
          <span>{formatDate(article.date)}</span>
          <div className="flex items-center gap-3">
            {/* Eye / views */}
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>—</span>
            </span>
            {/* Chat bubble / read time */}
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{article.readTime}&nbsp;min</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const MOCK_ARTICLES = [
    {
      id: 'airtel-africa-multibagger',
      issue: '01',
      category: 'Emerging Markets',
      title: 'Airtel Africa: The Continent\'s Most Underpriced Growth Story',
      subtitle: 'Mobile money penetration, ARPU expansion, and why the market is missing a 5-year structural compounding thesis.',
      author: 'Nishtha Soni',
      date: '2025-05-20',
      readTime: '14',
      coverImage: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&auto=format&fit=crop',
    },
    {
      id: 'india-ai-infrastructure',
      issue: '02',
      category: 'India Macro',
      title: 'India\'s AI Infrastructure Build-Out: Who Actually Wins?',
      subtitle: 'Beyond the hyperscaler narrative — the picks-and-shovels plays in data centres, cooling, and last-mile connectivity.',
      author: 'Nishtha Soni',
      date: '2025-05-14',
      readTime: '11',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    },
    {
      id: 'gold-structural-bull',
      issue: '03',
      category: 'Commodities',
      title: 'Gold\'s Structural Bull Case Has Never Been Stronger',
      subtitle: 'Central bank de-dollarisation, negative real rates, and the geopolitical premium that analysts keep discounting.',
      author: 'Nishtha Soni',
      date: '2025-05-06',
      readTime: '9',
      coverImage: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop',
    },
    {
      id: 'reliance-jio-platforms',
      issue: '04',
      category: 'India Macro',
      title: 'Jio Platforms: Building the OS for 1.4 Billion People',
      subtitle: 'The super-app flywheel, financial services optionality, and why Reliance\'s digital business is chronically misunderstood.',
      author: 'Nishtha Soni',
      date: '2025-04-28',
      readTime: '16',
      coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
    },
    {
      id: 'china-dram-flood',
      issue: '05',
      category: 'Technology',
      title: 'China Begins Flooding the Market With DRAM and NAND Chips',
      subtitle: 'The cure for high commodity prices is high commodity prices. What CXMT\'s ramp means for Micron, Samsung, and the memory cycle.',
      author: 'Nishtha Soni',
      date: '2025-04-18',
      readTime: '10',
      coverImage: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&auto=format&fit=crop',
    },
    {
      id: 'vietnam-manufacturing-hub',
      issue: '06',
      category: 'Emerging Markets',
      title: 'Vietnam: The Quiet Beneficiary of the China+1 Decade',
      subtitle: 'Supply chain realignment is creating a manufacturing renaissance. Here\'s where to look for the durable compounders.',
      author: 'Nishtha Soni',
      date: '2025-04-10',
      readTime: '12',
      coverImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop',
    },
  ]

  let articles = []
  try {
    await connectDB()
    const raw = await Article.find(
      { status: 'published' },
      '-blocks -__v'
    ).sort({ date: -1 }).lean()
    articles = JSON.parse(JSON.stringify(raw))
    if (articles.length === 0) articles = MOCK_ARTICLES
  } catch {
    articles = MOCK_ARTICLES
  }

  const [featured, ...rest] = articles

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f0f0' }}>
      <SiteNav />

      {/* Site tagline strip */}
      <div className="bg-white border-b border-gray-200 py-2">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between gap-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
            Long-horizon research on India &amp; emerging markets
          </p>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold hidden sm:block">
            Independent · Unbiased · Deep
          </p>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-5">
        {articles.length === 0 ? (
          <div className="bg-white border border-gray-200 text-center py-20 text-gray-400 text-[15px]">
            No research published yet.
          </div>
        ) : (
          <>
            {/* Featured — full width */}
            {featured && (
              <div className="mb-4">
                <ArticleCard article={featured} featured />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map(a => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
