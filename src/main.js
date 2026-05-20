import { articles as hardcoded } from './data/articles.js'
import { formatDate } from './renderer.js'

// ── Theme toggle ──────────────────────────────────────────────
const MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/></svg>`
const SUN  = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707"/></svg>`

const root = document.documentElement
const toggleBtn = document.getElementById('theme-toggle')

function applyTheme(t) {
  root.setAttribute('data-theme', t)
  localStorage.setItem('bp-theme', t)
  toggleBtn.innerHTML = t === 'dark' ? SUN : MOON
  toggleBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')
}
applyTheme(localStorage.getItem('bp-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
toggleBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'))

// ── Merge articles (hardcoded + localStorage published) ───────
function getAllArticles() {
  const stored = JSON.parse(localStorage.getItem('bp_published') || '[]')
  return [...hardcoded, ...stored].sort((a, b) => new Date(b.date) - new Date(a.date))
}

// ── Render hero ───────────────────────────────────────────────
function renderHero(a) {
  return `
    <div class="hero-inner">
      <div class="hero-eyebrow">
        <div class="issue-dot"></div>
        <span class="hero-category">${a.category}</span>
        <span class="hero-issue-badge">Issue No. ${String(a.issue).padStart(2,'0')}</span>
        <div class="issue-rule"></div>
      </div>
      <a class="hero-link" href="article.html?id=${a.id}">
        <h1 class="hero-title">${a.title}</h1>
      </a>
      <p class="hero-sub">${a.subtitle}</p>
      <div class="hero-footer">
        <a class="hero-read-btn" href="article.html?id=${a.id}">Read Research &rarr;</a>
        <span class="hero-byline">${a.author} &middot; ${formatDate(a.date)} &middot; ${a.readTime} min read</span>
      </div>
    </div>`
}

// ── Render archive card ───────────────────────────────────────
function renderCard(a) {
  return `
    <a class="article-card" href="article.html?id=${a.id}">
      <div class="card-top">
        <span class="card-category">${a.category}</span>
        <span class="card-issue">No. ${String(a.issue).padStart(2,'0')}</span>
      </div>
      <h2 class="card-title">${a.title}</h2>
      <p class="card-sub">${a.subtitle}</p>
      <div class="card-bottom">
        <span>${a.author}</span>
        <span class="card-dot">&middot;</span>
        <span>${formatDate(a.date)}</span>
        <span class="card-dot">&middot;</span>
        <span>${a.readTime} min</span>
      </div>
    </a>`
}

// ── Mount ─────────────────────────────────────────────────────
const all = getAllArticles()
const heroEl    = document.getElementById('home-hero')
const archiveEl = document.getElementById('archive-section')
const gridEl    = document.getElementById('articles-grid')
const countEl   = document.getElementById('archive-count')

if (all.length === 0) {
  heroEl.innerHTML = `<div class="hero-inner hero-empty"><p>No research published yet.</p></div>`
} else {
  heroEl.innerHTML = renderHero(all[0])
  const rest = all.slice(1)
  if (rest.length > 0) {
    archiveEl.style.display = 'block'
    countEl.textContent = `${rest.length} issue${rest.length > 1 ? 's' : ''}`
    gridEl.innerHTML = rest.map(renderCard).join('')
  }
}
