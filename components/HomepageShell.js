'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import ArticleCard from './ArticleCard'
import { formatDate } from '@/lib/renderer'

const PAGE_SIZE = 12

export default function HomepageShell({ initialArticles, initialTotal, initialCategories }) {
  const [articles, setArticles]       = useState(initialArticles)
  const [total, setTotal]             = useState(initialTotal)
  const [categories]                  = useState(initialCategories)
  const [activeCategory, setCategory] = useState('all')
  const [searchQuery, setSearch]      = useState('')
  const [loading, setLoading]         = useState(false)
  const [page, setPage]               = useState(2) // next page to fetch
  const searchTimeout                 = useRef(null)

  async function fetchArticles({ reset = false, category = activeCategory, q = searchQuery, nextPage = page } = {}) {
    if (loading) return
    setLoading(true)
    const params = new URLSearchParams({ page: reset ? 1 : nextPage, limit: PAGE_SIZE })
    if (category !== 'all') params.set('category', category)
    if (q) params.set('q', q)

    try {
      const data = await fetch(`/api/articles?${params}`).then(r => r.json())
      setTotal(data.total)
      setArticles(prev => reset ? data.articles : [...prev, ...data.articles])
      setPage(reset ? 2 : nextPage + 1)
    } finally {
      setLoading(false)
    }
  }

  function handleCategory(cat) {
    setCategory(cat)
    fetchArticles({ reset: true, category: cat })
  }

  function handleSearch(e) {
    const q = e.target.value
    setSearch(q)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchArticles({ reset: true, q }), 300)
  }

  const cats = ['all', ...categories.filter(Boolean).sort()]
  const hasMore = articles.length < total

  return (
    <>
      <nav>
        <Link className="nav-brand" href="/">Bharat<span>.</span>Pulse</Link>
        <div className="nav-search-wrap">
          <svg className="nav-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11" />
          </svg>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search research…"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="nav-right">
          <ThemeToggle />
          <a className="nav-subscribe" href="#">Subscribe</a>
        </div>
      </nav>

      <div className="home-masthead">
        <div className="home-masthead-inner">
          <div className="home-masthead-label">
            <div className="issue-dot" />
            <span>Independent Research · India &amp; Emerging Markets</span>
          </div>
          {total > 0 && (
            <div className="home-masthead-stats">
              <span className="hm-stat">{total} issue{total !== 1 ? 's' : ''}</span>
              <span className="hm-dot">&middot;</span>
              <span className="hm-stat">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</span>
              {articles[0]?.date && <>
                <span className="hm-dot">&middot;</span>
                <span className="hm-stat">Latest: {formatDate(articles[0].date)}</span>
              </>}
            </div>
          )}
        </div>
      </div>

      <div className="filter-bar">
        {cats.map(c => (
          <button
            key={c}
            className={`filter-btn${activeCategory === c ? ' active' : ''}`}
            onClick={() => handleCategory(c)}
          >
            {c === 'all' ? 'All Research' : c}
          </button>
        ))}
      </div>

      <main className="home-main">
        {articles.length === 0 && !loading ? (
          <div className="home-empty"><p>No research found.</p></div>
        ) : (
          <div className="home-grid">
            {articles.map((a, i) => (
              <ArticleCard key={a.id || a._id} article={a} featured={i === 0} />
            ))}
            {loading && <div className="home-loading">Loading…</div>}
          </div>
        )}

        {hasMore && !loading && (
          <div className="load-more-wrap">
            <button className="btn-load-more" onClick={() => fetchArticles()}>
              Load more
            </button>
          </div>
        )}
      </main>

      <footer>
        <div className="footer-brand">Bharat<span>.</span>Pulse</div>
        <div className="footer-right">Independent &middot; Long-horizon &middot; Data-driven</div>
      </footer>
    </>
  )
}
