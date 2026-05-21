import Link from 'next/link'
import { connectDB, Article } from '@/lib/db'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Bharat Pulse — Future Research Lab | The Future Is The Biggest Multibagger',
  description: 'Independent long-horizon research on AI, telecom, emerging markets, gold, and civilizational change.',
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
    <>
      {/* Nav — same structure as pipeline */}
      <nav>
        <Link className="nav-brand" href="/">Bharat Pulse</Link>
        <div className="nav-right">
          <Link className="nav-pipeline-link" href="/pipeline">Pipeline</Link>
          <ThemeToggle />
          <a className="nav-subscribe" href="mailto:research@bharatpulse.in?subject=Subscribe%20me">
            Subscribe
          </a>
        </div>
      </nav>

      {/* Masthead — same structure as pipeline */}
      <div className="pipeline-masthead">
        <div className="pipeline-eyebrow">
          <div className="issue-dot" />
          <span>Independent Research</span>
        </div>
        <h1 className="pipeline-title">The Future Is The Biggest Multibagger.</h1>
        <p className="pipeline-desc">
          Long-horizon deep-dives on AI, telecom, emerging markets, and civilizational change.
          Studying structural shifts before markets understand them.
        </p>
      </div>

      {/* Article grid — same structure as pipeline */}
      <div className="pipeline-grid-wrap">
        {articles.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-tertiary)', fontSize: '15px' }}>
            No research published yet.
          </p>
        ) : (
          <div className="pipeline-grid">
            {articles.map(a => (
              <Link
                key={a.id}
                href={`/article/${a.id}`}
                className="pipeline-card"
                style={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <div className="pipeline-card-top">
                  <span className="pipeline-cat">{a.category}</span>
                  <span className="pipeline-badge pipeline-badge--dated">
                    {formatDate(a.date)}
                  </span>
                </div>
                <h2 className="pipeline-name">{a.title}</h2>
                <p className="pipeline-teaser">{a.subtitle}</p>
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '14px',
                  borderTop: '0.5px solid var(--color-border-tertiary)',
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>{a.author}</span>
                  <span>{a.readTime} min read</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer — same structure as pipeline */}
      <footer>
        <div className="footer-brand">Bharat Pulse</div>
        <div className="footer-right">
          © {new Date().getFullYear()} Gloww. Independent research.
        </div>
      </footer>
    </>
  )
}
