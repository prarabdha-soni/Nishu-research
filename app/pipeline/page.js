import Link from 'next/link'
import { PIPELINE } from '@/lib/config'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata = {
  title: 'Research Pipeline — Bharat Pulse',
  description: 'Upcoming deep-dive research on AI, telecom, emerging markets, and civilizational change.',
}

export default function PipelinePage() {
  return (
    <>
      <nav>
        <Link className="nav-brand" href="/">Bharat Pulse</Link>
        <div className="nav-right">
          <Link className="nav-back" href="/">&larr; All Research</Link>
          <ThemeToggle />
          <a className="nav-subscribe" href="mailto:research@bharatpulse.in?subject=Subscribe%20me">
            Subscribe
          </a>
        </div>
      </nav>

      <div className="pipeline-masthead">
        <div className="pipeline-eyebrow">
          <div className="issue-dot" />
          <span>Research Pipeline</span>
        </div>
        <h1 className="pipeline-title">What&apos;s Coming Next</h1>
        <p className="pipeline-desc">
          Deep-dives currently in progress. Subscribe to get notified the moment each piece publishes.
        </p>
      </div>

      <div className="pipeline-grid-wrap">
        <div className="pipeline-grid">
          {PIPELINE.map((item, i) => (
            <div key={i} className="pipeline-card">
              <div className="pipeline-card-top">
                <span className="pipeline-cat">{item.category}</span>
                <span className={`pipeline-badge${item.badge !== 'Coming Soon' ? ' pipeline-badge--dated' : ''}`}>
                  {item.badge}
                </span>
              </div>
              <h2 className="pipeline-name">{item.name}</h2>
              <p className="pipeline-teaser">{item.teaser}</p>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <div className="footer-brand">Bharat Pulse</div>
        <div className="footer-right">
          © {new Date().getFullYear()} Gloww. Independent research.
        </div>
      </footer>
    </>
  )
}
