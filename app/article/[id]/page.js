import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectDB, Article } from '@/lib/db'
import { renderBlocks, buildTOC, formatDate } from '@/lib/renderer'
import { SITE_URL } from '@/lib/config'
import ThemeToggle from '@/components/ThemeToggle'
import ArticleInteractive from '@/components/ArticleInteractive'
import ShareBar from '@/components/ShareBar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  await connectDB()
  const article = await Article.findOne({ id: params.id }, 'title subtitle date author').lean()
  if (!article) return { title: 'Not Found — Bharat.Pulse' }
  return {
    title: `${article.title} — Bharat.Pulse`,
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

  // Related articles (same category, up to 3)
  const related = await Article.find(
    { category: article.category, id: { $ne: article.id }, status: 'published' },
    'id title subtitle category issue author date readTime coverImage'
  ).limit(3).lean()

  // Read Next: most recent article regardless of category
  const nextArticle = await Article.findOne(
    { id: { $ne: article.id }, status: 'published' },
    'id title subtitle category issue author date readTime coverImage'
  ).sort({ date: -1 }).lean()

  // JSON-LD structured data (task 6)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.subtitle,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'Bharat.Pulse',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/article/${article.id}` },
  }

  return (
    <>
      {/* JSON-LD (task 6) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleInteractive />

      <nav>
        <Link className="nav-brand" href="/">Bharat<span>.</span>Pulse</Link>
        <div className="nav-right">
          <Link className="nav-back" href="/">&larr; All Research</Link>
          <Link className="nav-pipeline-link" href="/pipeline">Pipeline</Link>
          <ThemeToggle />
          <a className="nav-subscribe" href="/#newsletter">Subscribe</a>
        </div>
      </nav>

      <div id="article-root">
        <div className="masthead">
          <div className="issue-line">
            <div className="issue-dot" />
            <span className="issue-text">
              {article.category} &mdash; Issue No. {String(article.issue).padStart(2, '0')}
            </span>
            <div className="issue-rule" />
          </div>
          <h1 className="cover-title">{article.title}</h1>
          <p className="cover-sub">{article.subtitle}</p>
          <div className="byline">
            <div className="avatar">{article.author?.[0]}</div>
            <div>
              <div className="byline-name">{article.author}</div>
              <div className="byline-role">Independent Research</div>
            </div>
            <div className="byline-meta">
              <span className="meta-chip">{formatDate(article.date)}</span>
              <span className="meta-chip">{article.readTime} min read</span>
            </div>
          </div>
          <ShareBar title={article.title} />
        </div>

        {tocHtml && <div dangerouslySetInnerHTML={{ __html: tocHtml }} />}

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: blocksHtml }}
        />
      </div>

      {/* Author bio */}
      <div className="author-bio">
        <div className="author-bio-inner">
          <div className="author-bio-avatar">{article.author?.[0]}</div>
          <div>
            <div className="author-bio-name">{article.author}</div>
            <div className="author-bio-role">Analyst, Bharat.Pulse</div>
            <p className="author-bio-text">
              Independent equity analyst focused on India and emerging markets.
              Writes long-horizon, data-driven research on structural growth stories
              that institutional coverage tends to underweight.
            </p>
          </div>
        </div>
      </div>

      {/* Read Next (task 5) */}
      <div className="read-next-section">
        <div className="read-next-label">Read Next</div>
        {nextArticle ? (
          <Link className="read-next-card" href={`/article/${nextArticle.id}`}>
            {nextArticle.coverImage && (
              <div className="read-next-img" style={{ backgroundImage: `url(${nextArticle.coverImage})` }} />
            )}
            <div className="read-next-body">
              <span className="read-next-cat">{nextArticle.category}</span>
              <h3 className="read-next-title">{nextArticle.title}</h3>
              <p className="read-next-sub">{nextArticle.subtitle}</p>
              <div className="read-next-meta">
                {nextArticle.author} &middot; {nextArticle.readTime} min read
              </div>
            </div>
          </Link>
        ) : (
          <p className="read-next-empty">More research coming soon. <a href="/#newsletter">Subscribe</a> to be notified.</p>
        )}
      </div>

      {/* Related articles (same category) */}
      {related.length > 0 && (
        <section className="related-section">
          <h3 className="related-heading">More from {article.category}</h3>
          <div className="related-grid">
            {related.map(a => (
              <ArticleCard key={a.id} article={a} featured={false} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
