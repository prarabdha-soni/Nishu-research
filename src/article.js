import { renderBlocks, formatDate } from './renderer.js'

function setMeta(name, content, prop = false) {
  const attr = prop ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildTOC(blocks) {
  const sections = blocks.filter(b => b.type === 'section' && b.heading)
  if (sections.length < 2) return ''
  const items = sections.map(b => {
    const id = b.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `<li><a href="#${id}">${b.num ? `<span class="toc-num">${esc(b.num)}</span> ` : ''}${esc(b.heading)}</a></li>`
  }).join('')
  return `<nav class="toc"><div class="toc-title">Contents</div><ol class="toc-list">${items}</ol></nav>`
}

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

// ── Load article ──────────────────────────────────────────────
const id        = new URLSearchParams(location.search).get('id')
const container = document.getElementById('article-root')

async function loadArticle() {
  if (!id) {
    container.innerHTML = `<div class="not-found"><p>No article specified. <a href="/">← Go back</a></p></div>`
    return
  }

  // Try API first, fall back to local drafts
  let article = null
  try {
    const res = await fetch(`/api/articles/${id}`)
    if (res.ok) article = await res.json()
  } catch { /* offline or dev */ }

  if (!article) {
    const drafts = JSON.parse(localStorage.getItem('bp_drafts') || '[]')
    article = drafts.find(a => a.id === id)
  }

  if (!article) {
    container.innerHTML = `<div class="not-found"><p>Research not found. <a href="/">← Go back</a></p></div>`
    return
  }

  {
  document.title = `${article.title} — Bharat.Pulse`
  setMeta('description', article.subtitle)
  setMeta('og:title', article.title, true)
  setMeta('og:description', article.subtitle, true)
  setMeta('og:type', 'article', true)
  setMeta('article:published_time', article.date, true)
  setMeta('article:author', article.author, true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', article.title)
  setMeta('twitter:description', article.subtitle)

  const shareUrl   = encodeURIComponent(location.href)
  const shareTitle = encodeURIComponent(article.title)
  container.innerHTML = `
    <div class="masthead">
      <div class="issue-line">
        <div class="issue-dot"></div>
        <span class="issue-text">${article.category} &mdash; Issue No. ${String(article.issue).padStart(2,'0')}</span>
        <div class="issue-rule"></div>
      </div>
      <h1 class="cover-title">${article.title}</h1>
      <p class="cover-sub">${article.subtitle}</p>
      <div class="byline">
        <div class="avatar">${article.author[0]}</div>
        <div>
          <div class="byline-name">${article.author}</div>
          <div class="byline-role">Independent Research</div>
        </div>
        <div class="byline-meta">
          <span class="meta-chip">${formatDate(article.date)}</span>
          <span class="meta-chip">${article.readTime} min read</span>
        </div>
      </div>
    </div>
    <div class="art-share">
      <span class="art-share-label">Share</span>
      <a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}" target="_blank" rel="noopener" class="art-share-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X / Twitter
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener" class="art-share-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
      <button class="art-share-btn" id="art-copy-link">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Copy link
      </button>
    </div>
    ${buildTOC(article.blocks)}
    <div class="article-body">
      ${renderBlocks(article.blocks)}
    </div>`

  // Reading progress bar
  const bar = document.getElementById('reading-progress')
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight
    bar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%'
  }, { passive: true })

  // Back to top
  const btt = document.getElementById('back-to-top')
  window.addEventListener('scroll', () => {
    btt.classList.toggle('btt--visible', window.scrollY > 600)
  }, { passive: true })
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))

  // Copy link
  document.getElementById('art-copy-link').addEventListener('click', async function() {
    await navigator.clipboard.writeText(location.href)
    this.textContent = 'Copied!'
    setTimeout(() => { this.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy link` }, 2000)
  })

  // Prompt modal
  const modal       = document.getElementById('prompt-modal')
  const modalPrompt = document.getElementById('modal-prompt-text')
  const modalClose  = document.getElementById('modal-close')
  const modalCopy   = document.getElementById('modal-copy')

  function openModal(text) { modalPrompt.textContent = text; modal.classList.add('open'); document.body.style.overflow = 'hidden' }
  function closeModal()    { modal.classList.remove('open'); document.body.style.overflow = '' }

  document.querySelectorAll('[data-prompt]').forEach(el => el.addEventListener('click', () => openModal(el.dataset.prompt)))
  modalClose.addEventListener('click', closeModal)
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() })
  modalCopy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(modalPrompt.textContent)
    modalCopy.textContent = 'Copied!'
    setTimeout(() => { modalCopy.textContent = 'Copy prompt' }, 1500)
  })
  }
}

loadArticle()
