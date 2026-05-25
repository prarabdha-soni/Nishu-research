import { formatDate } from './renderer.js'

// ── Theme ─────────────────────────────────────────────────────
const MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/></svg>`
const SUN  = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707"/></svg>`

const root      = document.documentElement
const toggleBtn = document.getElementById('theme-toggle')
function applyTheme(t) {
  root.setAttribute('data-theme', t)
  localStorage.setItem('bp-theme', t)
  toggleBtn.innerHTML = t === 'dark' ? SUN : MOON
}
applyTheme(localStorage.getItem('bp-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
toggleBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'))

// ── State ─────────────────────────────────────────────────────
const PAGE_SIZE = 12
let page          = 1
let total         = 0
let activeCategory = 'all'
let searchQuery   = ''
let articles      = []
let loading       = false

// ── DOM refs ──────────────────────────────────────────────────
const grid      = document.getElementById('home-grid')
const empty     = document.getElementById('home-empty')
const filterBar = document.getElementById('filter-bar')
const statsEl   = document.getElementById('home-stats')

// Inject "Load more" button
const main = document.querySelector('.home-main')
const loadMoreWrap = document.createElement('div')
loadMoreWrap.className = 'load-more-wrap'
loadMoreWrap.innerHTML = `<button class="btn-load-more" id="btn-load-more">Load more</button>`
main.appendChild(loadMoreWrap)
const loadMoreBtn = document.getElementById('btn-load-more')
loadMoreWrap.style.display = 'none'

// ── Card rendering ────────────────────────────────────────────
function renderCard(a, featured) {
  const img = a.coverImage
    ? `<div class="art-card-img"><img src="${a.coverImage}" alt="${a.title}" loading="lazy"></div>`
    : ''
  return `
    <a class="art-card${featured ? ' art-card--featured' : ''}" href="article.html?id=${a.id}">
      <h2 class="art-title">${a.title}</h2>
      ${img}
      <p class="art-sub">${a.subtitle}</p>
      <div class="art-footer">
        <span class="art-date">${formatDate(a.date)}</span>
        ${a.category ? `<span class="art-sep">&middot;</span><span class="art-cat">${a.category}</span>` : ''}
        <span class="art-sep">&middot;</span>
        <span>${a.readTime} min read</span>
      </div>
    </a>`
}

// ── Filter bar ────────────────────────────────────────────────
function updateFilterBar(categories) {
  const cats = ['all', ...categories.filter(Boolean).sort()]
  filterBar.innerHTML = cats.map(c =>
    `<button class="filter-btn${c === activeCategory ? ' active' : ''}" data-cat="${c}">${c === 'all' ? 'All Research' : c}</button>`
  ).join('')
}

filterBar.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn')
  if (!btn) return
  filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  activeCategory = btn.dataset.cat
  fetchAndRender(true)
})

// ── Stats bar ─────────────────────────────────────────────────
function updateStats(count, catCount, latestDate) {
  if (!count) return
  statsEl.innerHTML = `
    <span class="hm-stat">${count} issue${count !== 1 ? 's' : ''}</span>
    <span class="hm-dot">&middot;</span>
    <span class="hm-stat">${catCount} categor${catCount !== 1 ? 'ies' : 'y'}</span>
    ${latestDate ? `<span class="hm-dot">&middot;</span><span class="hm-stat">Latest: ${formatDate(latestDate)}</span>` : ''}`
}

// ── Fetch & render ────────────────────────────────────────────
async function fetchAndRender(reset = false) {
  if (loading) return
  loading = true

  if (reset) { page = 1; articles = [] }
  if (articles.length === 0) grid.innerHTML = `<div class="home-loading">Loading…</div>`

  const params = new URLSearchParams({ page, limit: PAGE_SIZE })
  if (activeCategory !== 'all') params.set('category', activeCategory)
  if (searchQuery) params.set('q', searchQuery)

  try {
    const data = await fetch(`/api/articles?${params}`).then(r => r.json())
    total    = data.total
    articles = reset ? data.articles : [...articles, ...data.articles]
    page++

    if (page === 2) {  // first load
      updateFilterBar(data.categories || [])
      updateStats(data.total, (data.categories || []).length, data.articles[0]?.date)
    }
  } catch {
    grid.innerHTML = `<div class="home-loading">Could not load articles — check your connection.</div>`
    loading = false
    return
  }

  if (articles.length === 0) {
    grid.innerHTML = ''
    empty.style.display = 'block'
    loadMoreWrap.style.display = 'none'
  } else {
    empty.style.display = 'none'
    grid.innerHTML = articles.map((a, i) => renderCard(a, i === 0)).join('')
    loadMoreWrap.style.display = articles.length < total ? 'flex' : 'none'
  }

  loading = false
}

// ── Search (debounced 300ms) ──────────────────────────────────
let searchTimeout
document.getElementById('search-input').addEventListener('input', e => {
  searchQuery = e.target.value
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchAndRender(true), 300)
})

// ── Load more ─────────────────────────────────────────────────
loadMoreBtn.addEventListener('click', () => fetchAndRender(false))

// ── Init ──────────────────────────────────────────────────────
fetchAndRender(true)
