import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectDB, Article } from '@/lib/db'
import { renderBlocks, buildTOC, formatDate } from '@/lib/renderer'
import { SITE_URL } from '@/lib/config'
import ArticleInteractive from '@/components/ArticleInteractive'
import ShareBar from '@/components/ShareBar'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  await connectDB()
  const article = await Article.findOne({ id: params.id }, 'title subtitle date author').lean()
  if (!article) return { title: 'Not Found — Bharat Pulse' }
  return {
    title: `${article.title} — Bharat Pulse`,
    description: article.subtitle,
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.subtitle },
  }
}

export default async function ArticlePage({ params }) {
  await connectDB()
  const article = await Article.findOne({ id: params.id }).lean()
  if (!article) notFound()

  const blocksHtml = renderBlocks(article.blocks)
  const tocHtml    = buildTOC(article.blocks)

  // Next + Prev articles for section navigation
  const [nextArticle, prevArticle] = await Promise.all([
    Article.findOne(
      { id: { $ne: article.id }, status: 'published', date: { $lt: article.date } },
      'id title category'
    ).sort({ date: -1 }).lean(),
    Article.findOne(
      { id: { $ne: article.id }, status: 'published', date: { $gt: article.date } },
      'id title category'
    ).sort({ date: 1 }).lean(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.subtitle,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: 'Bharat Pulse', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/article/${article.id}` },
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleInteractive />
      <SiteNav showBack backLabel="All Research" backHref="/" />

      {/* Article masthead */}
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11.5px] text-stone-400 mb-6">
          <Link href="/" className="hover:text-stone-700 transition-colors duration-150">Home</Link>
          <span>/</span>
          <span className="text-[#f97316] font-medium">{article.category}</span>
        </div>

        {/* Issue line */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
          <span className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-stone-400">
            {article.category} &mdash; Issue No.&thinsp;{String(article.issue || '01').padStart(2, '0')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-[2.8rem] font-bold text-stone-900 tracking-[-0.03em] leading-[1.12] mb-4">
          {article.title}
        </h1>
        <p className="text-stone-500 text-[18px] font-light italic leading-relaxed mb-8">
          {article.subtitle}
        </p>

        {/* Byline */}
        <div className="flex items-center gap-4 py-5 border-t border-b border-stone-200 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {article.author?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-stone-800">{article.author}</div>
            <div className="text-[12px] text-stone-400">Independent Research</div>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-stone-400 flex-shrink-0">
            <span>{formatDate(article.date)}</span>
            <span className="hidden sm:block">·</span>
            <span className="hidden sm:block">{article.readTime} min read</span>
          </div>
        </div>

        <ShareBar title={article.title} />
      </div>

      {/* TOC */}
      {tocHtml && (
        <div className="max-w-3xl mx-auto px-6 my-6">
          <div dangerouslySetInnerHTML={{ __html: tocHtml }} />
        </div>
      )}

      {/* Article body */}
      <div id="article-root">
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: blocksHtml }}
        />
      </div>

      {/* Author bio */}
      <div className="max-w-3xl mx-auto px-6 mt-12">
        <div className="flex gap-5 items-start p-6 bg-white rounded-2xl border border-stone-200">
          <div className="w-12 h-12 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {article.author?.[0]}
          </div>
          <div>
            <div className="font-semibold text-stone-900 text-[15px] mb-0.5">{article.author}</div>
            <div className="text-[11.5px] text-[#f97316] font-medium mb-2">Analyst, Bharat Pulse</div>
            <p className="text-stone-500 text-[13.5px] font-light leading-relaxed">
              Independent equity analyst focused on India and emerging markets.
              Writes long-horizon, data-driven research on structural growth stories
              that institutional coverage tends to underweight.
            </p>
          </div>
        </div>
      </div>

      {/* Prev / Next article navigation */}
      {(prevArticle || nextArticle) && (
        <div className="max-w-3xl mx-auto px-6 mt-8 mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Prev (older) */}
            {nextArticle ? (
              <Link
                href={`/article/${nextArticle.id}`}
                className="group flex flex-col gap-1.5 p-5 bg-white border border-stone-200 rounded-xl hover:border-[#f97316]/40 hover:bg-stone-50 transition-all duration-150"
              >
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-medium">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-150">
                    <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </div>
                <span className="text-stone-700 text-[14px] font-medium leading-snug tracking-tight line-clamp-2 group-hover:text-[#f97316] transition-colors duration-150">
                  {nextArticle.title}
                </span>
                <span className="text-[11px] text-stone-400">{nextArticle.category}</span>
              </Link>
            ) : <div />}

            {/* Next (newer) */}
            {prevArticle ? (
              <Link
                href={`/article/${prevArticle.id}`}
                className="group flex flex-col gap-1.5 p-5 bg-white border border-stone-200 rounded-xl hover:border-[#f97316]/40 hover:bg-stone-50 transition-all duration-150 sm:text-right"
              >
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-medium sm:justify-end">
                  Next
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform duration-150">
                    <path d="M3 8h10M8.5 4l4.5 4-4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-stone-700 text-[14px] font-medium leading-snug tracking-tight line-clamp-2 group-hover:text-[#f97316] transition-colors duration-150">
                  {prevArticle.title}
                </span>
                <span className="text-[11px] text-stone-400">{prevArticle.category}</span>
              </Link>
            ) : <div />}

          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
