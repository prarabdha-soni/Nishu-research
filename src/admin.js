import { renderBlocks, formatDate } from './renderer.js'
import { smartParse } from './parser.js'

const ADMIN_PW = 'bharatpulse'

// ── State ─────────────────────────────────────────────────────
let editingId = null   // null = new article, string = editing existing
let blocks    = []

// ── Auth ──────────────────────────────────────────────────────
const authGate = document.getElementById('auth-gate')
const adminApp = document.getElementById('admin-app')
const authInput = document.getElementById('auth-input')
const authBtn   = document.getElementById('auth-btn')
const authError = document.getElementById('auth-error')

function unlock() {
  authGate.style.display = 'none'
  adminApp.style.display = 'block'
  sessionStorage.setItem('bp_auth', '1')
  initAdmin()
}

if (sessionStorage.getItem('bp_auth') === '1') unlock()

authBtn.addEventListener('click', () => {
  if (authInput.value === ADMIN_PW) { unlock() }
  else { authError.textContent = 'Incorrect password.'; authInput.value = '' }
})
authInput.addEventListener('keydown', e => { if (e.key === 'Enter') authBtn.click() })
document.getElementById('admin-logout').addEventListener('click', () => {
  sessionStorage.removeItem('bp_auth')
  location.reload()
})

function getLocalPublished() { return JSON.parse(localStorage.getItem('bp_published') || '[]') }
function getDrafts()         { return JSON.parse(localStorage.getItem('bp_drafts')    || '[]') }
function saveLocalPublished(arr) { localStorage.setItem('bp_published', JSON.stringify(arr)) }
function saveDrafts(arr)         { localStorage.setItem('bp_drafts',    JSON.stringify(arr)) }

// ── API helpers ───────────────────────────────────────────────
function getApiKey() { return localStorage.getItem('bp_api_key') || '' }
function setApiKey(k) { k ? localStorage.setItem('bp_api_key', k) : localStorage.removeItem('bp_api_key') }

function authHeaders() {
  return { 'Content-Type': 'application/json', 'x-api-key': getApiKey() }
}

async function apiPublish(art) {
  try {
    const r = await fetch('/api/articles', { method: 'POST', headers: authHeaders(), body: JSON.stringify(art) })
    return r.ok
  } catch { return false }
}

async function apiDelete(id) {
  try {
    const r = await fetch(`/api/articles/${id}`, { method: 'DELETE', headers: authHeaders() })
    return r.ok
  } catch { return false }
}

async function apiGetPublished() {
  try {
    const r = await fetch('/api/articles?limit=100')
    if (r.ok) { const d = await r.json(); return d.articles }
  } catch {}
  return null
}

// ── Block templates ───────────────────────────────────────────
const defaultBlock = {
  paragraph:  () => ({ type: 'paragraph', dropCap: false, text: '' }),
  pullquote:  () => ({ type: 'pullquote', text: '' }),
  stats:      () => ({ type: 'stats', cells: [
    { num: '', unit: '', label: '' },
    { num: '', unit: '', label: '' },
    { num: '', unit: '', label: '' }
  ]}),
  section:    () => ({ type: 'section', num: 'Part I', heading: '' }),
  annotation: () => ({ type: 'annotation', title: '', text: '' }),
  timeline:   () => ({ type: 'timeline', items: [{ year: '', text: '' }] }),
  verdict:    () => ({ type: 'verdict', label: 'The bottom line', title: '', body: '', prompt: '' }),
  image:      () => ({ type: 'image', src: '', alt: '', caption: '' }),
}

// ── Block form renderers ──────────────────────────────────────
function blockForm(b, idx) {
  const wrap = (content) => `
    <div class="block-item" data-idx="${idx}">
      <div class="block-item-header">
        <span class="block-type-badge">${b.type}</span>
        <div class="block-item-actions">
          <button class="blk-btn blk-up" data-idx="${idx}" title="Move up">↑</button>
          <button class="blk-btn blk-down" data-idx="${idx}" title="Move down">↓</button>
          <button class="blk-btn blk-del" data-idx="${idx}" title="Delete">×</button>
        </div>
      </div>
      <div class="block-item-body">${content}</div>
    </div>`

  switch (b.type) {
    case 'paragraph':
      return wrap(`
        <label class="field-label field-label--inline">
          <input type="checkbox" class="blk-field" data-idx="${idx}" data-field="dropCap" ${b.dropCap ? 'checked' : ''}>
          Drop cap (first letter large)
        </label>
        <textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="text" rows="5" placeholder="Paragraph text...">${b.text}</textarea>`)

    case 'pullquote':
      return wrap(`<textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="text" rows="3" placeholder="Quote text (no quotation marks needed)...">${b.text}</textarea>`)

    case 'stats':
      return wrap(b.cells.map((c, ci) => `
        <div class="stats-row">
          <span class="stats-row-label">Stat ${ci+1}</span>
          <input type="text" class="blk-field field-input field-input--sm" data-idx="${idx}" data-field="cells.${ci}.num" value="${c.num}" placeholder="646">
          <input type="text" class="blk-field field-input field-input--sm" data-idx="${idx}" data-field="cells.${ci}.unit" value="${c.unit}" placeholder="M">
          <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="cells.${ci}.label" value="${c.label}" placeholder="Label description">
        </div>`).join(''))

    case 'section':
      return wrap(`
        <div class="meta-row meta-row--2">
          <div class="field-group">
            <label class="field-label">Part label</label>
            <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="num" value="${b.num}" placeholder="Part I">
          </div>
          <div class="field-group">
            <label class="field-label">Section heading</label>
            <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="heading" value="${b.heading}" placeholder="Section heading">
          </div>
        </div>`)

    case 'annotation':
      return wrap(`
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="title" value="${b.title}" placeholder="Box title (e.g. Why this matters)">
        <textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="text" rows="4" placeholder="Annotation body...">${b.text}</textarea>`)

    case 'timeline':
      return wrap(`
        <div class="timeline-items" id="tl-${idx}">
          ${b.items.map((it, ii) => `
            <div class="tl-row" data-tl-idx="${ii}">
              <input type="text" class="blk-field field-input field-input--sm" data-idx="${idx}" data-field="items.${ii}.year" value="${it.year}" placeholder="2025">
              <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="items.${ii}.text" value="${it.text}" placeholder="Event description">
              <button class="blk-btn blk-del-tl" data-idx="${idx}" data-ti="${ii}">×</button>
            </div>`).join('')}
        </div>
        <button class="btn-ghost btn-sm blk-add-tl" data-idx="${idx}">+ Add event</button>`)

    case 'verdict':
      return wrap(`
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="label" value="${b.label}" placeholder="Label (e.g. The bottom line)">
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="title" value="${b.title}" placeholder="Verdict title">
        <textarea class="blk-field blk-textarea" data-idx="${idx}" data-field="body" rows="4" placeholder="Conclusion body...">${b.body}</textarea>
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="prompt" value="${b.prompt}" placeholder="Discussion prompt (optional)">`)

    case 'image':
      return wrap(`
        <input type="url" class="blk-field field-input" data-idx="${idx}" data-field="src" value="${b.src}" placeholder="Image URL (https://…)">
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="alt" value="${b.alt}" placeholder="Alt text (describe the image for accessibility)">
        <input type="text" class="blk-field field-input" data-idx="${idx}" data-field="caption" value="${b.caption}" placeholder="Caption (optional)">`)

    default: return wrap('')
  }
}

// ── Render blocks list ────────────────────────────────────────
function renderBlocksList() {
  const list = document.getElementById('blocks-list')
  list.innerHTML = blocks.length === 0
    ? `<div class="blocks-empty">No blocks yet. Click &ldquo;+ Add Block&rdquo; to start building.</div>`
    : blocks.map((b, i) => blockForm(b, i)).join('')
  attachBlockEvents()
  // Auto-fill read time from word count if field is empty
  const rtField = document.getElementById('f-readtime')
  if (rtField && !rtField.value && blocks.length > 0) {
    rtField.value = calcReadTime(blocks)
  }
  updatePreview()
}

function attachBlockEvents() {
  // Field changes
  document.querySelectorAll('.blk-field').forEach(el => {
    el.addEventListener(el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'number' ? 'input' : 'change', () => {
      const idx   = +el.dataset.idx
      const field = el.dataset.field
      if (!field) return
      const val = el.type === 'checkbox' ? el.checked : el.value
      // nested path like "cells.0.num"
      const parts = field.split('.')
      let obj = blocks[idx]
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[isNaN(parts[i]) ? parts[i] : +parts[i]]
      }
      obj[isNaN(parts.at(-1)) ? parts.at(-1) : +parts.at(-1)] = val
      updatePreview()
    })
  })

  // Delete block
  document.querySelectorAll('.blk-del').forEach(btn => {
    btn.addEventListener('click', () => {
      blocks.splice(+btn.dataset.idx, 1)
      renderBlocksList()
    })
  })

  // Move up/down
  document.querySelectorAll('.blk-up').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx
      if (i === 0) return
      ;[blocks[i-1], blocks[i]] = [blocks[i], blocks[i-1]]
      renderBlocksList()
    })
  })
  document.querySelectorAll('.blk-down').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.idx
      if (i === blocks.length - 1) return
      ;[blocks[i], blocks[i+1]] = [blocks[i+1], blocks[i]]
      renderBlocksList()
    })
  })

  // Timeline: add/delete event
  document.querySelectorAll('.blk-add-tl').forEach(btn => {
    btn.addEventListener('click', () => {
      blocks[+btn.dataset.idx].items.push({ year: '', text: '' })
      renderBlocksList()
    })
  })
  document.querySelectorAll('.blk-del-tl').forEach(btn => {
    btn.addEventListener('click', () => {
      const b = blocks[+btn.dataset.idx]
      b.items.splice(+btn.dataset.ti, 1)
      renderBlocksList()
    })
  })
}

// ── Live preview ──────────────────────────────────────────────
function getMeta() {
  return {
    title:    document.getElementById('f-title').value,
    subtitle: document.getElementById('f-subtitle').value,
    category: document.getElementById('f-category').value,
    issue:    document.getElementById('f-issue').value || '00',
    author:   document.getElementById('f-author').value,
    date:     document.getElementById('f-date').value || new Date().toISOString().slice(0,10),
    readTime: document.getElementById('f-readtime').value || '5',
  }
}

function updatePreview() {
  const m = getMeta()
  const frame = document.getElementById('preview-frame')
  if (!m.title && blocks.length === 0) {
    frame.innerHTML = `<div class="preview-empty">Start filling in the form to see a preview</div>`
    return
  }
  frame.innerHTML = `
    <div class="preview-scaler">
      <div class="masthead masthead--preview">
        <div class="issue-line">
          <div class="issue-dot"></div>
          <span class="issue-text">${m.category || 'Category'} &mdash; Issue No. ${String(m.issue).padStart(2,'0')}</span>
          <div class="issue-rule"></div>
        </div>
        <h1 class="cover-title">${m.title || 'Article Title'}</h1>
        <p class="cover-sub">${m.subtitle || 'Subtitle / thesis statement'}</p>
        <div class="byline">
          <div class="avatar">${(m.author||'A')[0]}</div>
          <div>
            <div class="byline-name">${m.author || 'Author'}</div>
            <div class="byline-role">Independent Research</div>
          </div>
          <div class="byline-meta">
            <span class="meta-chip">${formatDate(m.date)}</span>
            <span class="meta-chip">${m.readTime} min read</span>
          </div>
        </div>
      </div>
      <div class="article-body article-body--preview">
        ${renderBlocks(blocks)}
      </div>
    </div>`
}

// Live preview on metadata change
['f-title','f-subtitle','f-category','f-issue','f-author','f-date','f-readtime'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', updatePreview)
  document.getElementById(id)?.addEventListener('change', updatePreview)
})

// ── Add block menu ────────────────────────────────────────────
const addBtn   = document.getElementById('btn-add-block')
const blockMenu = document.getElementById('block-menu')

addBtn.addEventListener('click', e => {
  e.stopPropagation()
  blockMenu.style.display = blockMenu.style.display === 'none' ? 'block' : 'none'
})
document.addEventListener('click', () => { blockMenu.style.display = 'none' })

document.querySelectorAll('.block-menu-item').forEach(item => {
  item.addEventListener('click', () => {
    blocks.push(defaultBlock[item.dataset.type]())
    renderBlocksList()
    blockMenu.style.display = 'none'
  })
})

// ── Build article object ──────────────────────────────────────
function buildArticle(id) {
  const m = getMeta()
  return {
    id,
    issue:    m.issue,
    category: m.category,
    title:    m.title,
    subtitle: m.subtitle,
    author:   m.author,
    date:     m.date,
    readTime: m.readTime,
    blocks:   JSON.parse(JSON.stringify(blocks)),
  }
}

function generateId(title) {
  const slug = (title || '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)
  const suffix = Date.now().toString(36).slice(-4)
  return slug ? `${slug}-${suffix}` : `article-${suffix}`
}

function calcReadTime(blockList) {
  const words = blockList.reduce((acc, b) => {
    const texts = [b.text, b.body, b.heading, b.title]
      .filter(Boolean)
    if (b.items) b.items.forEach(i => texts.push(i.text))
    if (b.cells) b.cells.forEach(c => texts.push(c.label))
    return acc + texts.join(' ').split(/\s+/).filter(Boolean).length
  }, 0)
  return Math.max(1, Math.ceil(words / 200))
}

// ── Save draft ────────────────────────────────────────────────
document.getElementById('btn-save-draft').addEventListener('click', () => {
  const title = document.getElementById('f-title').value.trim()
  if (!title) {
    alert('Please add a title before saving.')
    return
  }
  const id  = editingId || generateId(title)
  const art = buildArticle(id)
  const drafts = getDrafts().filter(d => d.id !== id)
  drafts.unshift(art)
  saveDrafts(drafts)
  editingId = id
  showToast('Draft saved')
})

// ── Publish ───────────────────────────────────────────────────
document.getElementById('btn-publish').addEventListener('click', async () => {
  const title = document.getElementById('f-title').value.trim()
  if (!title) { alert('Please add a title before publishing.'); return }
  if (!confirm(`Publish "${title}" to the site?`)) return

  const id  = editingId || generateId(title)
  const art = buildArticle(id)
  editingId = id

  // Remove from drafts
  saveDrafts(getDrafts().filter(d => d.id !== id))

  showToast('Publishing…')
  const done = await apiPublish(art)
  if (done) {
    saveLocalPublished(getLocalPublished().filter(p => p.id !== id))
    showToast('Published ✓')
  } else {
    // Fallback: save locally if API unavailable
    const local = getLocalPublished().filter(p => p.id !== id)
    local.unshift(art)
    saveLocalPublished(local)
    showToast(getApiKey() ? 'API error — saved locally only' : 'No API key — saved locally. Add key in Settings.')
  }

  document.getElementById('preview-open-link').href   = `article.html?id=${id}`
  document.getElementById('preview-open-link').style.display = 'inline'
})

// ── Clear form ────────────────────────────────────────────────
document.getElementById('btn-clear').addEventListener('click', () => {
  if (!confirm('Clear the form and start fresh?')) return
  clearForm()
})

function clearForm() {
  editingId = null
  blocks    = []
  ;['f-title','f-subtitle','f-category','f-issue','f-readtime'].forEach(id => {
    document.getElementById(id).value = ''
  })
  document.getElementById('f-author').value = 'Prarabdha Soni'
  document.getElementById('f-date').value = new Date().toISOString().slice(0,10)
  document.getElementById('editor-title-label').textContent = 'New Research'
  document.getElementById('preview-open-link').style.display = 'none'
  renderBlocksList()
}

// ── Load article into editor ──────────────────────────────────
function loadArticle(art) {
  editingId = art.id
  document.getElementById('f-title').value    = art.title || ''
  document.getElementById('f-subtitle').value = art.subtitle || ''
  document.getElementById('f-category').value = art.category || ''
  document.getElementById('f-issue').value    = art.issue || ''
  document.getElementById('f-author').value   = art.author || 'Prarabdha Soni'
  document.getElementById('f-date').value     = art.date || new Date().toISOString().slice(0,10)
  document.getElementById('f-readtime').value = art.readTime || ''
  document.getElementById('editor-title-label').textContent = `Editing: ${art.title}`
  blocks = JSON.parse(JSON.stringify(art.blocks || []))
  renderBlocksList()
  closeDraftsModal()
  document.getElementById('preview-open-link').href   = `article.html?id=${art.id}`
  document.getElementById('preview-open-link').style.display = 'inline'
}

// ── Drafts modal ──────────────────────────────────────────────
const draftsModal  = document.getElementById('drafts-modal')
const draftsClose  = document.getElementById('drafts-close')
const draftsList   = document.getElementById('drafts-list-content')

async function openDraftsModal() {
  draftsList.innerHTML = '<p class="drafts-empty" style="padding:24px">Loading…</p>'
  draftsModal.style.display = 'flex'

  const drafts    = getDrafts()
  const apiPub    = await apiGetPublished()
  const localPub  = getLocalPublished()
  const localOnly = localPub.filter(a => !apiPub || !apiPub.some(p => p.id === a.id))
  const published = [...(apiPub || []), ...localOnly]

  function row(art, status, source) {
    const badge = source === 'db'
      ? `<span class="draft-status draft-status--published" title="In MongoDB">published</span>`
      : source === 'local'
      ? `<span class="draft-status draft-status--published" title="Local only — API key needed to sync">local</span>`
      : `<span class="draft-status draft-status--${status}">${status}</span>`
    return `<div class="draft-row">
      <div class="draft-row-info">
        ${badge}
        <span class="draft-title">${art.title || '(untitled)'}</span>
        <span class="draft-date">${formatDate(art.date)}</span>
      </div>
      <div class="draft-row-actions">
        <button class="btn-ghost btn-sm" data-load="${art.id}">Edit</button>
        <button class="btn-ghost btn-sm btn-danger" data-delete="${art.id}" data-from="${status}">Delete</button>
      </div>
    </div>`
  }

  const rows = [
    ...(apiPub || []).map(a => row(a, 'published', 'db')),
    ...localOnly.map(a => row(a, 'published', 'local')),
    ...drafts.map(a => row(a, 'draft', 'local')),
  ]
  draftsList.innerHTML = rows.length ? rows.join('') : '<p class="drafts-empty">No saved drafts or published articles yet.</p>'

  const all = [...published, ...drafts]
  draftsList.querySelectorAll('[data-load]').forEach(btn => {
    btn.addEventListener('click', () => loadArticle(all.find(a => a.id === btn.dataset.load)))
  })
  draftsList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this article?')) return
      const aid = btn.dataset.delete
      if (btn.dataset.from === 'published') {
        await apiDelete(aid)
        saveLocalPublished(getLocalPublished().filter(a => a.id !== aid))
      } else {
        saveDrafts(getDrafts().filter(a => a.id !== aid))
      }
      openDraftsModal()
    })
  })
}
function closeDraftsModal() { draftsModal.style.display = 'none' }

document.getElementById('btn-drafts-list').addEventListener('click', openDraftsModal)
draftsClose.addEventListener('click', closeDraftsModal)
draftsModal.querySelector('.adm-modal-backdrop').addEventListener('click', closeDraftsModal)

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div')
  t.className = 'admin-toast'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.classList.add('admin-toast--show'), 10)
  setTimeout(() => { t.classList.remove('admin-toast--show'); setTimeout(() => t.remove(), 300) }, 2500)
}

// ── API Settings ──────────────────────────────────────────────
const apiSettingsToggle = document.getElementById('gh-settings-toggle')
const apiSettingsBody   = document.getElementById('gh-settings-body')
const apiChevron        = document.getElementById('gh-chevron')
const apiKeyInput       = document.getElementById('gh-token-input')
const apiKeyStatus      = document.getElementById('gh-token-status')

function updateApiStatus() {
  const k = getApiKey()
  apiKeyInput.value = k ? '••••••••••••••••' : ''
  apiKeyStatus.textContent = k ? '✓ API key saved' : 'No key — articles save to this browser only'
  apiKeyStatus.style.color = k ? 'var(--color-accent)' : 'var(--color-text-tertiary)'
}

apiSettingsToggle.addEventListener('click', () => {
  const open = apiSettingsBody.style.display !== 'none'
  apiSettingsBody.style.display = open ? 'none' : 'block'
  apiChevron.textContent = open ? '▾' : '▴'
  if (!open) { apiKeyInput.value = ''; updateApiStatus() }
})

document.getElementById('gh-token-save').addEventListener('click', () => {
  const val = apiKeyInput.value.trim()
  if (!val || val.startsWith('•')) { showToast('Paste your API key first'); return }
  setApiKey(val)
  updateApiStatus()
  showToast('API key saved')
})

document.getElementById('gh-token-clear').addEventListener('click', () => {
  if (!confirm('Remove the API key? Articles will save to this browser only.')) return
  setApiKey('')
  updateApiStatus()
  showToast('API key removed')
})

updateApiStatus()

// ── Smart Import ──────────────────────────────────────────────
const smartToggle = document.getElementById('smart-import-toggle')
const smartBody   = document.getElementById('smart-import-body')
const smartChevron = document.getElementById('smart-chevron')

smartToggle.addEventListener('click', () => {
  const open = smartBody.style.display !== 'none'
  smartBody.style.display = open ? 'none' : 'block'
  smartChevron.textContent = open ? '▾' : '▴'
})

document.getElementById('smart-parse-btn').addEventListener('click', () => {
  const text = document.getElementById('smart-textarea').value.trim()
  if (!text) { showToast('Paste some text first'); return }

  const parsed = smartParse(text)
  if (parsed.length === 0) { showToast('Could not detect structure — try adding more text'); return }

  blocks = parsed
  renderBlocksList()

  // Collapse smart import panel
  smartBody.style.display = 'none'
  smartChevron.textContent = '▾'

  showToast(`Parsed ${parsed.length} blocks — review and edit below`)
  document.getElementById('blocks-list').scrollIntoView({ behavior: 'smooth', block: 'start' })
})

document.getElementById('smart-clear-btn').addEventListener('click', () => {
  document.getElementById('smart-textarea').value = ''
})

// ── Init ──────────────────────────────────────────────────────
function initAdmin() {
  document.getElementById('f-date').value = new Date().toISOString().slice(0, 10)
  renderBlocksList()
}
