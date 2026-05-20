import { articles as hardcoded } from './data/articles.js'
import { formatDate } from './renderer.js'

// ── Theme ─────────────────────────────────────────────────────
const MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/></svg>`
const SUN  = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707"/></svg>`

const root = document.documentElement
const toggleBtn = document.getElementById('theme-toggle')
function applyTheme(t) {
  root.setAttribute('data-theme', t)
  localStorage.setItem('bp-theme', t)
  toggleBtn.innerHTML = t === 'dark' ? SUN : MOON
}
applyTheme(localStorage.getItem('bp-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
toggleBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'))

// ── Data ──────────────────────────────────────────────────────
function getAllArticles() {
  const stored = JSON.parse(localStorage.getItem('bp_published') || '[]')
  return [...hardcoded, ...stored].sort((a, b) => new Date(b.date) - new Date(a.date))
}

const all = getAllArticles()

// ── Category filters ──────────────────────────────────────────
const categories = ['all', ...new Set(all.map(a => a.category).filter(Boolean))]
const filterBar  = document.getElementById('filter-bar')
filterBar.innerHTML = categories.map(c =>
  `<button class="filter-btn${c === 'all' ? ' active' : ''}" data-cat="${c}">${c === 'all' ? 'All Research' : c}</button>`
).join('')

// ── Homepage stats bar ────────────────────────────────────────
const statsEl = document.getElementById('home-stats')
if (all.length > 0) {
  const latest = formatDate(all[0].date)
  statsEl.innerHTML = `
    <span class="hm-stat">${all.length} issue${all.length !== 1 ? 's' : ''}</span>
    <span class="hm-dot">&middot;</span>
    <span class="hm-stat">${categories.length - 1} categor${categories.length - 1 !== 1 ? 'ies' : 'y'}</span>
    <span class="hm-dot">&middot;</span>
    <span class="hm-stat">Latest: ${latest}</span>`
}

// ── Card rendering ────────────────────────────────────────────
function renderCard(a, featured) {
  return `
    <a class="art-card${featured ? ' art-card--featured' : ''}" href="article.html?id=${a.id}">
      <div class="art-card-top">
        <span class="art-cat">${a.category || ''}</span>
        <span class="art-issue">No.&thinsp;${String(a.issue).padStart(2,'0')}</span>
      </div>
      <h2 class="art-title">${a.title}</h2>
      <p class="art-sub">${a.subtitle}</p>
      <div class="art-footer">
        <span class="art-author">${a.author}</span>
        <span class="art-sep">&middot;</span>
        <span>${formatDate(a.date)}</span>
        <span class="art-sep">&middot;</span>
        <span>${a.readTime} min read</span>
      </div>
    </a>`
}

// ── Render grid ───────────────────────────────────────────────
let activeCategory = 'all'
let searchQuery    = ''

function render() {
  const grid    = document.getElementById('home-grid')
  const empty   = document.getElementById('home-empty')
  const q       = searchQuery.toLowerCase()

  const filtered = all.filter(a => {
    const matchCat    = activeCategory === 'all' || a.category === activeCategory
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  if (filtered.length === 0) {
    grid.innerHTML = ''
    empty.style.display = 'block'
    return
  }
  empty.style.display = 'none'
  grid.innerHTML = filtered.map((a, i) => renderCard(a, i === 0)).join('')
}

render()

// ── Filter clicks ─────────────────────────────────────────────
filterBar.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn')
  if (!btn) return
  filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  activeCategory = btn.dataset.cat
  render()
})

// ── Search ────────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', e => {
  searchQuery = e.target.value
  render()
})
