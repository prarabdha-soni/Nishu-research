import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectDB, Article } from '@/lib/db'
import { renderBlocks, buildTOC, formatDate } from '@/lib/renderer'
import ThemeToggle from '@/components/ThemeToggle'
import ArticleInteractive from '@/components/ArticleInteractive'

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
    twitter: { card: 'summary', title: article.title, description: article.subtitle },
  }
}

export default async function ArticlePage({ params }) {
  await connectDB()
  const article = await Article.findOne({ id: params.id }).lean()
  if (!article) notFound()

  const blocksHtml = renderBlocks(article.blocks)
  const tocHtml    = buildTOC(article.blocks)

  return (
    <>
      <ArticleInteractive />

      <nav>
        <Link className="nav-brand" href="/">Bharat<span>.</span>Pulse</Link>
        <div className="nav-right">
          <Link className="nav-back" href="/">&larr; All Research</Link>
          <ThemeToggle />
          <a className="nav-subscribe" href="#">Subscribe</a>
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
        </div>

        {tocHtml && <div dangerouslySetInnerHTML={{ __html: tocHtml }} />}

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: blocksHtml }}
        />
      </div>

      <footer>
        <div className="footer-brand">Bharat<span>.</span>Pulse</div>
        <div className="footer-right">Independent &middot; Long-horizon &middot; Data-driven</div>
      </footer>
    </>
  )
}
